# Docs

## Overview

Documentation for this project is hosted by [Read the Docs](https://about.readthedocs.com/). When a commit is pushed to the `main` branch
of the repository, a Webhook triggers a build and deployment of the documentation on Read the Docs. The status of the documentation builds
can be viewed on the [RTD Dashboard](https://app.readthedocs.org/projects/xnat-scout-test/). The updated documentation will be available
at [https://xnat-scout-test.readthedocs.io/en/latest/](https://xnat-scout-test.readthedocs.io/en/latest/) after the build completes.

## Source Docs

The documentation is stored in the project within [docs/source](docs/source). The main configuration for the documentation project is
defined in [docs/source/conf.py](docs/source/conf.py). The documentation depends on [Sphinx](https://www.sphinx-doc.org/) along with
[MyST Parser](https://myst-parser.readthedocs.io/) to support `markdown` for the docs themselves instead of the default of `reStructuredText`.

## Local Build

You can build the documentation locally to test it out before commit changes. First, you can install the dependencies with something along
the lines of:

```bash
$ python3 -m venv .venv
$ source .venv/bin/activate
(.venv) $ python3 -m pip install -r docs/requirements.txt
```

...and then build the docs:

```bash
(.venv) $ sphinx-build -M html docs/source/ docs/build/
```
