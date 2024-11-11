import argparse
import logging
import os
import sys
from dataclasses import dataclass, asdict
from typing import Optional, Generator

import hl7
import pandas as pd
import pyarrow.compute as pc
from deltalake import DeltaTable, write_deltalake

from hl7extractor.hl7extractor import extract_and_join_reports, extract_field, extract_report_status_from_obx11
from hl7extractor.hl7extractor import read_hl7_message as _read_hl7_message

log = logging.getLogger("hl7deltalake")
storage_options = {"conditional_put": "etag"}


@dataclass(frozen=True)
class MessageData:
    source_file: Optional[str]
    msh_7_message_timestamp: Optional[str]
    msh_10_message_control_id: Optional[str]
    pid_7_date_time_of_birth: Optional[str]
    pid_8_administrative_sex: Optional[str]
    pid_10_race: Optional[str]
    pid_22_ethnic_group: Optional[str]
    obr_2_placer_order_number: Optional[str]
    obr_3_filler_order_number: Optional[str]
    obr_4_universal_service_identifier_id: Optional[str]
    obr_4_universal_service_identifier_text: Optional[str]
    obr_4_universal_service_identifier_coding_system: Optional[str]
    obr_6_requested_datetime: Optional[str]
    obr_7_observation_datetime: Optional[str]
    obr_8_observation_end_datetime: Optional[str]
    obr_22_results_rpt_status_chng_datetime: Optional[str]
    obr_25_result_status: Optional[str]
    obx_5_observation_value: Optional[str]
    obx_11_observation_result_status: Optional[str]
    dg1_3_diagnosis_code_identifier: Optional[str]
    dg1_3_diagnosis_code_text: Optional[str]
    dg1_3_diagnosis_code_coding_system: Optional[str]
    zds_1_study_instance_uid: Optional[str]


def extract_data(message: hl7.Message, path: Optional[str] = None) -> MessageData:
    """Extract data from HL7 message."""
    return MessageData(
        source_file=path,
        msh_7_message_timestamp=extract_field(message, "MSH", 7),
        msh_10_message_control_id=extract_field(message, "MSH", 10),
        pid_7_date_time_of_birth=extract_field(message, "PID", 7),
        pid_8_administrative_sex=extract_field(message, "PID", 8),
        pid_10_race=extract_field(message, "PID", 10),
        pid_22_ethnic_group=extract_field(message, "PID", 22),
        obr_2_placer_order_number=extract_field(message, "OBR", 2),
        obr_3_filler_order_number=extract_field(message, "OBR", 3),
        obr_4_universal_service_identifier_id=extract_field(message, "OBR", 4, component=1),
        obr_4_universal_service_identifier_text=extract_field(message, "OBR", 4, component=2),
        obr_4_universal_service_identifier_coding_system=extract_field(message, "OBR", 4, component=3),
        obr_6_requested_datetime=extract_field(message, "OBR", 6),
        obr_7_observation_datetime=extract_field(message, "OBR", 7),
        obr_8_observation_end_datetime=extract_field(message, "OBR", 8),
        obr_22_results_rpt_status_chng_datetime=extract_field(message, "OBR", 22),
        obr_25_result_status=extract_field(message, "OBR", 25),
        obx_5_observation_value=extract_and_join_reports(message),
        obx_11_observation_result_status=extract_report_status_from_obx11(message),
        dg1_3_diagnosis_code_identifier=extract_field(message, "DG1", 3, component=1),
        dg1_3_diagnosis_code_text=extract_field(message, "DG1", 3, component=2),
        dg1_3_diagnosis_code_coding_system=extract_field(message, "DG1", 3, component=3),
        zds_1_study_instance_uid=extract_field(message, "ZDS", 1),
    )


def extract_filename(path: str) -> str:
    """Extract filename from path."""
    return None if path is None else os.path.basename(path)


def read_hl7_message(path: str) -> MessageData:
    """Read HL7 message from file."""
    log.debug(f"Reading HL7 message from {path}")
    try:
        return extract_data(_read_hl7_message(path), path)
    except Exception as e:
        log.error(str(e))


def read_hl7_directory(directory: str, cache: Optional[set[str]] = None) -> Generator[MessageData]:
    """Read HL7 messages from directory."""
    cache = cache or set()
    if directory in cache:
        return

    for root, subdir, files in os.walk(directory):
        for file in files:
            path = os.path.join(root, file)
            if path in cache:
                continue
            if file.endswith(".hl7"):
                yield read_hl7_message(path)
                cache.add(path)

    cache.add(directory)


def read_hl7_input(hl7input: list[str]) -> Generator[MessageData]:
    """Read HL7 messages from input files or directories."""
    cache = set()
    for path in hl7input:
        if os.path.isdir(path):
            yield from read_hl7_directory(path, cache=cache)
        else:
            yield read_hl7_message(path)
            cache.add(path)


def main(delta_table: str, hl7_input: list[str]) -> Optional[str]:
    """Extract data from HL7 messages and write to Delta Lake."""
    log.info(f"Reading HL7 messages from {hl7_input}")
    df = pd.DataFrame.from_records(map(asdict, read_hl7_input(hl7_input))).astype(dtype=str)

    log.info(f"Extracted data from {len(df)} HL7 messages")

    # Extract time column for partitioning
    timestamp = pd.to_datetime(df["msh_7_message_timestamp"], errors="coerce", format="%Y%m%d%H%M%S%f")
    df["year"] = timestamp.dt.year.astype(str)
    df["date"] = timestamp.dt.strftime("%Y-%m-%d")

    table_exists = DeltaTable.is_deltatable(delta_table)

    if not table_exists:
        log.info(f"Creating Delta Lake table {delta_table}")
        write_deltalake(delta_table, df, partition_by=["year"], mode="overwrite", storage_options=storage_options)
        return "success"

    dt = DeltaTable(delta_table, storage_options=storage_options)

    log.info(f"Merging data to Delta Lake table {delta_table}")
    dt.merge(df, predicate="s.source_file = t.source_file", source_alias="s", target_alias="t")\
        .when_matched_update_all()\
        .when_not_matched_insert_all()\
        .execute()

    log.info(f"Confirming write: Reading Delta Lake table from {delta_table}")

    # Read the Delta Lake table back into a DataFrame, filtering to only the values we wrote
    df2 = dt.to_pandas(
        partitions=[
            ("year", "in", df["year"].unique())
        ],
        filters=pc.field("source_file").isin(df["source_file"].values.tolist())
    )

    pd.testing.assert_frame_equal(df.sort_values("source_file", inplace=False).reset_index(drop=True),
                                  df2.sort_values("source_file", inplace=False).reset_index(drop=True))
    return "success"


def delete_delta_table(delta_table: str) -> None:
    """Delete Delta Lake table."""
    log.info(f"Deleting Delta Lake table {delta_table}")
    dt = DeltaTable(delta_table)
    dt.delete()
    dt.vacuum()


def main_cli(argv=None) -> int:
    """Main entry point for the CLI."""
    if argv is None:
        argv = sys.argv[1:]

    parser = argparse.ArgumentParser(
        description="Extract data from HL7 messages and write to Delta Lake",
    )
    parser.add_argument(
        "--delete",
        help="Delete Delta Lake table",
        action="store_true",
    )
    parser.add_argument(
        "delta_table",
        help="Path to Delta Lake table",
    )
    parser.add_argument(
        "hl7_input",
        help="HL7 input files or directories",
        action="append",
    )

    args = parser.parse_args(argv)
    if args.delete:
        delete_delta_table(args.delta_table)
        return 0

    output = main(args.delta_table, args.hl7_input)
    if output:
        print(output)
        return 0
    return 1


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    sys.exit(main_cli())
