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

The configuration for the pre-commit tool is stored in [.pre-commit-config.yaml](.pre-commit-config.yaml)
