import argparse
import json
import logging
import sys
from dataclasses import asdict, dataclass
from typing import Literal, Optional

import hl7

log = logging.getLogger("hl7extractor")

type ReportGroups = dict[str, str]

extractables = ("report", "metadata")
type Extractable = Literal["report", "metadata"]


@dataclass(frozen=True)
class PatientIdentifier:
    id_number: Optional[str]
    assigning_authority: Optional[str]
    identifier_type_code: Optional[str]


@dataclass(frozen=True)
class ProcedureCode:
    code: Optional[str] = None
    text: Optional[str] = None
    coding_system: Optional[str] = None
    alternate_text: Optional[str] = None


@dataclass(frozen=True)
class Metadata:
    patient_ids: Optional[list[PatientIdentifier]]
    patient_sex: Optional[str]
    patient_birth_datetime: Optional[str]
    procedure_code: Optional[ProcedureCode]
    modality: Optional[str]
    report_status: Optional[str]
    scan_datetime: Optional[str]
    scan_end_datetime: Optional[str]
    report_status_change_datetime: Optional[str]
    report_message_datetime: Optional[str]
    study_instance_uid: Optional[str]


def read_hl7_message(filename: str) -> hl7.Message:
    """Read HL7 message from file."""
    log.info(f"Reading HL7 message from {filename}")
    with open(filename, "r", encoding="latin-1", newline="\r") as f:
        return hl7.parse(f.read())


def extract_patient_identifiers(
    message: hl7.Message,
) -> Optional[list[PatientIdentifier]]:
    r"""Extract Patient Identifiers from PID-3 in HL7 message.

    PID-3 is a list (delimited by ~) of Patient Identifiers of the form
        <ID Number (ST)> ^^^ <Assigning Authority (HD)> ^ <Identifier Type Code (ID)>

    >>> message_str = r'''
    ... MSH|^~\&|EPIC|ABC|PACS|ABC|20210101120000||ORU^R01|123456|P|2.7
    ... PID|1||123456789^^^EPIC^MRN~0000000001^^^ABC^MR|
    ... '''.replace("\n", "\r")
    >>> message = hl7.parse(message_str)
    >>> extract_patient_identifiers(message)
    [PatientIdentifier(id_number='123456789', assigning_authority='EPIC', identifier_type_code='MRN'), PatientIdentifier(id_number='0000000001', assigning_authority='ABC', identifier_type_code='MR')]
    """
    log.debug(f"Extracting Patient IDs from PID-3")

    pid_seg = message.segment("PID")
    if not pid_seg:
        log.debug("PID segment not found in message")
        return None
    if len(pid_seg) < 3:
        log.debug("PID-3 not found in PID segment")
        return None

    pid3s: hl7.Field = message.segment("PID")(3)
    if not pid3s:
        log.debug("PID-3 not found in PID segment")
        return None

    return [
        PatientIdentifier(
            id_number=pid3(1)(1),
            assigning_authority=pid3(4)(1),
            identifier_type_code=pid3(5)(1),
        )
        for pid3 in pid3s
    ]


def extract_report_status(message: hl7.Message) -> Optional[str]:
    """Extract Report Status from OBR-25 in HL7 message,
    or fall back to OBX-11."""
    status = extract_field(message, "OBR", 25)

    if not status:
        status = extract_report_status_from_obx11(message)

    return status


def extract_report_status_from_obx11(message: hl7.Message) -> Optional[str]:
    """Extract Report Status from OBX-11 in HL7 message."""
    log.debug("Extracting Report Status from OBX-11")
    try:
        obx_segments = message.segments("OBX")
    except LookupError:
        obx_segments = None
    if not obx_segments:
        log.debug("OBX segment not found in message")
        return None

    report_statuses = set()
    for obx in obx_segments:
        if len(obx) < 11:
            log.debug("Skipping OBX segment with no OBX-11")
            continue
        status = str(obx(11))
        if not status:
            log.debug("Skipping OBX segment with empty OBX-11")
            continue
        report_statuses.add(status)

    if not report_statuses:
        log.debug("No Report Status OBX-11 found in OBX segments")
        return None
    if len(report_statuses) > 1:
        log.warning(
            f"Multiple Report Statuses found in OBX-11: {report_statuses}. Returning first."
        )
    return report_statuses.pop()


def extract_field(
    message: hl7.Message, segment: str, field: int, repeat: int = 1, component: int = 1, subcomponent: int = 1
) -> Optional[str]:
    """Extract a simple field from an HL7 message."""
    log.debug(f"Extracting {segment}-{field} ({repeat}:{component}:{subcomponent})")
    try:
        return message.extract_field(segment, 1, field, repeat, component, subcomponent)
    except LookupError:
        log.debug(f"{segment}-{field} ({repeat}:{component}:{subcomponent}) not found in message")
        return None


def extract_procedure_code(message: hl7.Message) -> Optional[ProcedureCode]:
    """Extract Procedure Code from OBR-4 in HL7 message."""
    log.debug("Extracting Procedure Code from OBR-4")
    obr_segments = message.segments("OBR")
    if not obr_segments:
        log.warning("OBR segment not found in message")
        return None
    obr = obr_segments[0]
    if len(obr) < 4:
        log.debug("OBR-4 not found in OBR segment")
        return None
    return ProcedureCode(*[str(component) for component in obr(4)(1)[:4]])


def extract_metadata(message: hl7.Message) -> Metadata:
    """Extract metadata from HL7 message."""
    log.debug("Extracting metadata from HL7 message")
    return Metadata(
        report_message_datetime=extract_field(message, "MSH", 7),
        patient_ids=extract_patient_identifiers(message),
        patient_sex=extract_field(message, "PID", 8),
        patient_birth_datetime=extract_field(message, "PID", 7),
        study_instance_uid=extract_field(message, "ZDS", 1),
        modality=extract_field(message, "OBR", 24),
        procedure_code=extract_procedure_code(message),
        report_status=extract_report_status(message),
        scan_datetime=extract_field(message, "OBR", 7),
        scan_end_datetime=extract_field(message, "OBR", 8),
        report_status_change_datetime=extract_field(message, "OBR", 22),
    )


def extract_and_join_reports(message: hl7.Message) -> Optional[str]:
    r"""Extract all OBX-5 values in HL7 message and join with \n.

    >>> message_str = r'''
    ... MSH|^~\&|EPIC|ABC|PACS|ABC|20210101120000||ORU^R01|123456|P|2.7
    ... OBX|1|ST|A|1|This is the report text.|||Status|
    ... OBX|2|FT|B|2|Also include this text|||Status|
    ... OBX|3|FT|B|2|in the report|||Status|
    ... OBX|4|ST|C|3|This section has|||Status|
    ... OBX|5|ST|C|3||||Status|
    ... OBX|6|ST|C|3|an empty line|||Status|
    ... OBX|7|TX|D|4|This has lots of text~in one field~on multiple lines~~Neat!|||Status|
    ... OBX|8|RP|E|5|123^Skip^Me|||Status|
    ... '''.replace("\n", "\r")
    >>> message = hl7.parse(message_str)
    >>> extract_and_join_reports(message)
    'This is the report text.\nAlso include this text\nin the report\nThis section has\n\nan empty line\nThis has lots of text\nin one field\non multiple lines\n\nNeat!'
    """
    log.debug("Extracting all Report Text from OBX-5")
    try:
        obx_segments = message.segments("OBX")
    except LookupError:
        obx_segments = None
    if not obx_segments:
        log.debug("OBX segment not found in message")
        return None

    report_lines = []
    for obx in obx_segments:
        if obx(2) == ["TX"]:  # Text data type, multiple lines
            report_lines.extend(map(str, obx(5)))
        # ST: String, single line; FT: Formatted text, single line
        elif obx(2) in (["ST"], ["FT"]):
            report_lines.append(str(obx(5)))
        else:
            log.debug(
                f"Skipping OBX segment {obx(1)} with unsupported OBX-2 data type {obx(2)}"
            )
            continue

    return "\n".join(report_lines)


def main(extract: Extractable, hl7_file: str) -> Optional[str]:
    if extract not in extractables:
        log.error(f'Invalid argument "{extract}". Must be one of {extractables}')
        return None

    message = read_hl7_message(hl7_file)
    try:
        if extract == "report":
            return extract_and_join_reports(message)
        elif extract == "metadata":
            metadata = extract_metadata(message)
            return json.dumps(asdict(metadata))
    except Exception as e:
        log.error(f"Error extracting {extract} from {hl7_file}", exc_info=e)

    return None


def main_cli(argv=None) -> int:
    """Main entry point for the CLI."""
    if argv is None:
        argv = sys.argv[1:]

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "what_to_extract",
        choices=extractables,
        help="Data to extract",
    )
    parser.add_argument(
        "hl7_file",
        help="HL7 file to extract data from",
    )

    args = parser.parse_args(argv)

    output = main(args.what_to_extract, args.hl7_file)
    if output:
        print(output)
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main_cli())
