import argparse
import sys

from . import hl7extractor


def main(argv=None) -> int:
    """Main entry point for the CLI."""
    if argv is None:
        argv = sys.argv[1:]

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "what_to_extract",
        choices=hl7extractor.extractables,
        help="Data to extract",
    )
    parser.add_argument(
        "hl7_file",
        help="HL7 file to extract data from",
    )

    args = parser.parse_args(argv)

    output = hl7extractor.main(args.what_to_extract, args.hl7_file)
    if output:
        print(output)
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
