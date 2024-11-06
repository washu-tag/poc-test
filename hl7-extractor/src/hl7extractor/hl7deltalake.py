import argparse
import os
import sys
from typing import Optional, Generator

import pandas as pd
from deltalake import DeltaTable, write_deltalake


def read_hl7_message(filename: str) -> str:
    """Read HL7 message from file."""
    pass


def read_hl7_directory(directory: str) -> Generator[str]:
    """Read HL7 messages from directory."""
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(".hl7"):
                yield read_hl7_message(os.path.join(root, file))


def main(hl7input: str) -> Optional[str]:
    """Extract data from HL7 messages and write to Delta Lake."""
    df = pd.DataFrame(
        {
            "message_id": ["1", "2", "3"],
            "patient_id": ["123", "456", "789"],
            "report": [
                "This is the first report",
                "This is the second report",
                "This is the third report",
            ],
        }
    )
    delta_table_uri = "s3://hl7/delta.test"
    storage_options = {"conditional_put": "etag"}

    write_deltalake(delta_table_uri, df, mode="overwrite", storage_options=storage_options)

    dt = DeltaTable(delta_table_uri, storage_options=storage_options)
    df2 = dt.to_pandas()

    assert df.equals(df2)
    return "success"


def main_cli(argv=None) -> int:
    """Main entry point for the CLI."""
    if argv is None:
        argv = sys.argv[1:]

    parser = argparse.ArgumentParser(
        description="Extract data from HL7 messages and write to Delta Lake",
    )
    parser.add_argument(
        "hl7input",
        help="HL7 input file or directory",
    )

    args = parser.parse_args(argv)

    output = main(args.hl7input)
    if output:
        print(output)
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main_cli())
