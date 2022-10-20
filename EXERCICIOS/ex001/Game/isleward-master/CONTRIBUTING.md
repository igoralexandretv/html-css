# Contributing Guide

There are many ways in which you can contribute to the project, be it reporting issues, fixing them, implementing new features or even making art/audio assets.

If anything in this contributing guide is not clear, don't hesitate to contact Waf or Vildravn on [Isleward's Discord](https://discord.gg/gnsn7ZP).

## Issues

### Creating Issues

* Isleward uses the integrated [Issue Tracker](https://gitlab.com/Isleward/isleward/issues) on GitLab.
* Issues are used to track work to be done (this includes bug fixes).
* Before making a new issue, make sure the same issue is not already listed in the issue tracker, either opened or already closed.
* In case it is listed and you have some more info, for example on how to reproduce a bug, post a comment in the original issue.
* If the issue is of a more sensitive nature (a serious game breaking exploit for example), please report the issue as [confidential](#confidential-issues).

### Issue Labels

Labels can only be assigned by people with Reporter and higher permissions in the project (see [Members](https://gitlab.com/Isleward/isleward/project_members)).
People with rights to assign labels should do so regularly to keep the issues organized.
The project is using the following, rather self-explanatory, labels:

* ~Balance
* ~Bug
* ~Content
* ~DevOps
* ~Draft
* ~Enhancement
* ~Feature
* ~Good first issue
* ~Mobile
* ~Mod
* ~Modding
* ~Polish
* ~Refactor
* ~Suggestion

### Issue Weights

* In addition to labels, issues tagged with the ~Bug label are also assigned Weights.
* Bugs are weighed by severity, with 1 being trivial and 5 being severe.
* Weights can assigned by people with Reporter or higher privileges.

### Confidential Issues

* Confidential issues are issues that are visible only to people with Reporter or higher access rights.
* Therefore they are very useful for reporting issues that are very sensitive and that not every user should know about.
* To create a confidential issue, simply check the `This issue is confidential and should only be visible to team members with at least Reporter access.` checkbox when creating a new issue.

### Becoming a Reporter

For more information about becoming a reporter, contact Waf on [Isleward's Discord](https://discord.gg/gnsn7ZP).

## Project Workflow

### Branching Structure

The project is using the following branching structure

* `master`
* `release`
* release tags (e.g. `0.3.1`)
* feature branches (e.g. `990-contributing-rewrite`)

**master** is the "nightly" branch, so to speak. All feature branches should be branched from and merged into `master`.

**release** is a single release branch. When a new version is to be released, `master` is merged into this branch and a release tag is created.

**release tags** are pointing at the latest commit in `release` at the point of releasing a new version.

**feature branches** are branches in which the actual development happens. The name of a feature branch should always contain the number of the issue that's being addressed (e.g. the `990` in `990-contribuing-rewrite`), and be all lowercase with hyphens between words.

### Using SSH keys

While not necessary, it is recommended to use SSH keys with git. Please follow [this page](https://gitlab.com/help/ssh/README.md) to learn how to set up and use SSH keys.

### Forking and Syncing

All contributed work needs to be done in your own fork, in a branch created from the `master` branch. To learn more about forking a repository, follow [this guide](https://docs.gitlab.com/ce/workflow/forking_workflow.html).

In case your work on the contribution is taking longer, your branch may become out of date with the parent repository. [This article](https://help.github.com/articles/syncing-a-fork/) from GitHub will help you sync your fork with the upstream (parent) repository.

### Code Style and Linting

Isleward uses ESLint and has a .eslintrc file with rules set up. When contributing code, please make sure to fix any errors and warnings produced by ESLint as your merge request won't be accepted otherwise.

Also please make sure to follow the [JS Style Guide](https://gitlab.com/Isleward/isleward/wikis/JS-Style-Guide).

### Merge Requests

Once you are done working on your contribution, you need to submit a merge request to merge your branch from your fork back into the upstream (parent) repository.

The merge request should have `master` as its target branch unless arranged otherwise.

You don't need to remove the source branch upon accepting the merge request if the merge request is being made from a fork.
Squishing commits is usually not recommended as it breaks the ability to rebase nicely in certain cases.

Once your merge request is submitted, GitLab CI will run a few tests on it. Should those tests fail, please address the failures.
A Merge Request with passing tests is ready to be merged.

### Running Isleward

* [Windows](https://gitlab.com/Isleward/isleward/wikis/installation-and-usage-(windows))
* [Linux](https://gitlab.com/Isleward/isleward/wikis/installation-and-usage-(linux))
* [MacOS](https://gitlab.com/Isleward/isleward/wikis/installation-and-usage-(macos))
