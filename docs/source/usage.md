# Usage

(installation)=

## Installation

A theoretical command to install Scout (not intended to make sense):

```{code-block} shell-session
:caption: Scout Installation Procedure
:emphasize-lines: 3
:lineno-start: 1

$ pip install scout
$ /some/command/thing
$ ./critical-step.sh
```

## Python SDK

A theoretical python session for an SDK talking to a Scout instance:

```pycon
>>> import xnatscout
>>> xnatscout.authenticate('admin', 'admin').study_count()
823772
```
