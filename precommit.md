# Pre-commit overview

This project uses [pre-commit](https://pre-commit.com/) to maintain a tidy and consistent repository. When getting started,
you can install pre-commit on a Mac with homebrew:

```bash
$ brew install pre-commit
```

Once `pre-commit` has been installed, the git commit hooks for the repository can be installed from running the following
from within the directory corresponding to your local copy of this repository:

```bash
$ pre-commit install
```

With the git commit hooks installed, `pre-commit` will automatically run the configured hooks on all changed files when you make a commit
locally. If you wish to run the commit hooks against all files to test things out, you can do so with:

```bash
$ pre-commit run --all-files
```

# Pre-commit configuration

The configuration for the pre-commit tool is stored in [.pre-commit-config.yaml](.pre-commit-config.yaml). Currently, the checks are:

## Default hooks

A few out-of-the-box hooks from [pre-commit-hooks](https://github.com/pre-commit/pre-commit-hooks) are enabled:
1. check-added-large-files
1. check-merge-conflict
1. detect-private-key

## Prettier

From the hook defined in [mirrors-prettier](https://github.com/pre-commit/mirrors-prettier), *Javascript*, *Typescript*, and *CSS* are reformatted
using [Prettier](https://prettier.io/). The configuration used for prettier is defined in [.prettierrc.json](.prettierrc.json). This code
formatting will apply automatically to any microservices or other projects within the monorepo.

## ESLint

From the hook defined in [mirrors-eslint](https://github.com/pre-commit/mirrors-eslint), *Javascript* and *Typescript* are linted using
[ESLint](https://eslint.org/). The configuration used for ESLint is defined in [eslint.config.cjs](eslint.config.cjs). This code
formatting will apply automatically to any microservices or other projects within the monorepo.
...

## Black
https://github.com/psf/black-pre-commit-mirror
...

## Checkstyle
...


