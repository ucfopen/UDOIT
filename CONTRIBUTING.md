# Contributing to UDOIT

Thank you for your interest in contributing to UDOIT.  Even though it was originally created by the University of Central Florida, UDOIT relies on the contributions of people like you in order to be the best accessibility scanning and remediation tool possible.  This document outlines the standards we use for various aspects of the project, and should be followed whenever possible.  If you have ideas for additions or changes to this document, please follow the guidelines below to submit them.

## Reporting Bugs and Requesting Features

### Before Submitting

Before you reporting a bug or requesting a feature, take a few moments to look through the [existing issues](https://github.com/ucfopen/UDOIT/issues).  Someone else may have already submitted the same issue or idea.  Also, check the [pull requests](https://github.com/ucfopen/UDOIT/pulls) that have been closed since you last updated UDOIT.  Your issue or feature may have already been dealt with.

### Submitting a Bug Report

After you've determined that your bug hasn't been reported or fixed already, you can submit an issue.  It's important to include as much detail as possible so that your issue can be resolved faster.  Here's a quick list of information to include:

* Version number, date of your last pull from Github, or Git commit ID
* Detailed step-by-step to reproduce the issue
* Screenshots or screen captures showing the issue
* Example HTML content that causes or relates to the issue (if applicable)
* Severity of the issue.  Is UDOIT completely broken, or can you work around the issue in the meantime?
* Scale of the issue.  Does this affect a single user, some users, most users, or all users?

Before submitting, use the labels to mark the issue as a Bug.

### Submitting a Feature Request

After you've determined that your feature hasn't been requested or implemented already, you can submit an issue.  Please take some time to flesh out the feature as much as possible.  The more work you put into the feature now, the sooner it will be implemented.  Here are some things to include:

* Why do you want this feature?  What are the use cases?
* Will this feature be useful to other institutions?  If so, describe how.
* How should the feature work, and what should it look like?  Include wireframes and workflow.
* Are you able to implement this feature yourself?  If not, are you available for consultation during the implementation process?
* How desperately do you need this feature?

Keep in mind that the individuals and institutions that contribute to UDOIT have their own list of priorities, so there is no guarantee that your feature will be implemented as soon as you would like.  The more universal the feature is, the more likely other institutions will help with the implementation.

## Contributing to the Project

If you are contributing code to UDOIT, please follow the guidelines below.

### Forking

If you are an outside contributor, you will need to fork the UDOIT project in order to work on it.  If you are familiar with Git, but are unsure of the forking process, read the [Forking Projects](https://guides.github.com/activities/forking/) guide. Make your changes in an appropriately-named [issue branch](#issue-branches) in your fork. After you are finished fixing a bug or implementing a feature on your fork, submit a pull request back to this repository.

The overall workflow is:

1. Choose an issue to work on, or submit a new one.
2. [Fork this project](https://guides.github.com/activities/forking/)
3. Create an [issue branch](#issue-branches).
4. Make the changes necessary to resolve the issue.
5. Test the code in your own environment.
6. Commit and push the code to your fork.
7. Create a pull request back to the ucfopen/UDOIT repository.
   1. Write a description of what you did in the `description` field.
   2. [Link the pull request to the issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
8. Pay attention to the pull request and respond to any questions others have about it.  It may take a few back-and-forth communications and changes for your pull request to be approved and merged.

### Branching

If you are a member of the UDOIT team, you can either fork the project (using the instructions above) or create a new branch within this repository.  Refer to the [Issue Branches](#issue-branches) section for the proper naming convention and pull request process.

## Explanation of Branches and Merging

UDOIT has a structured flow for how issues, branches, and releases are handled.  

### Main Branch

* This is the default branch.
* Issue branches merge into this branch.
* It represents the latest version of UDOIT, but it is not intended for production use.

### Stable Branches

* Naming convention: `stable/major.minor.x`, following [Semantic Versioning](https://semver.org/)
* They represent the latest stable version of each minor release, including all bugfixes and patches up to that point.
* They are intended for production use.
* The current release and previous minor release will receive security vulnerability fixes.
* Only the current release will receive non-security bugfixes.

### Issue Branches

* Naming Convention: `issue/####-short-description-of-issue`, where `####` is the issue number.
* All issue branches must be tied to an issue, even in your forked version of UDOIT.
* Make sure you update your forked version first, then create your issue branch from the current dev branch.
* After work is completed, create a pull request into `main`.
* After the pull request is merged, the issue branch should be deleted.

### Hotfix Branches

* Naimg convention: `hotfix/short-description`
* They represent security vulnerability fixes for the current or previous release.
* After work is completed, create a pull request into the target `stable` branch.
* Also merge these changes into `main` and any other `stable` branch where the vulnerability exists.

## Releases

The steps in this section are performed by the project maintainers.

1. When `main` is ready for a new minor release, a new [stable branch](#stable-branches) is created.
  * Patch releases for the current minor release are merged into the existing stable branch.
  * Patch releases for previous minor releases are merged directly into the existing stable branch, not into `main`. The remaining steps below are still followed.
2. A new [Release](https://github.com/ucfopen/UDOIT/releases) is created for it, named in the format `major.minor.patch` [Article about managing releases](https://docs.github.com/en/github/administering-a-repository/releasing-projects-on-github/managing-releases-in-a-repository)
3. Each release gets a tag with the same name as the release. This tag points at the appropriate commit hash.
4. It is suggested that you sign release tags for extra trust ([git tag](https://git-scm.com/book/tr/v2/Git-Tools-Signing-Your-Work)).