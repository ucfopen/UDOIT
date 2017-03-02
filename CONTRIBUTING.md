# Contributing to UDOIT

Thank you for your interest in contributing to UDOIT.  Even though it was originally created by the University of Central Florida, UDOIT relies on the contributions of people like you in order to be the best accessibility scanning and remediation tool possible.  This document outlines the standards we use for various aspects of the project, and should be followed whenever possible.  If you have ideas for additions or changes to this document, please follow the guidelines below to submit them.

## Reporting Bugs
### Before Submitting
### Submitting the Bug Report
version, screenshot, severity

## Requesting Features
use cases


## Branching and Merging

### Forking

### Master Branch

* This is the default branch.
* It always points at the latest release (thus always production ready)

### Dev Branches

* Naming Convention: `dev/v0.2.10` - a new one for every upcoming release version
* Issue branches merge into this branch (never master)
* When this dev branch is ready for release, it is merged into master and deleted

### Issue Branches

* Naming Convention: `issue/3432-add-package-json-dependency`
* The number is an issue number, and the text is a very short description of the issue.
* All issue branches must be tied to an issue, even in your forked version of UDOIT.
* Make sure you update your forked version first, then create your issue branch from the current dev branch.
* After work is completed, create a pull request into the target dev branch (never master).
* Once the pull request is merged, the issue branch should be deleted.

### Releases

* Naming convention: `v0.2.10` using [SEMVER](http://semver.org/) as it's supported by your languages' package manager
* Each release gets a tag after it's merged into master
* If it's open source, make sure to compile a fully fledged [release doc for Github](https://help.github.com/articles/creating-releases/)
* It is suggested that you sign release tags for extra trust ([git tag](https://git-scm.com/book/tr/v2/Git-Tools-Signing-Your-Work)) and ([using keybase gpg keys](https://clu.cdl.ucf.edu/snippets/103))


### Pictures to really drive it home
```
  ┌───────────┐    ┌───────────┐    ┌───────────┐
  |           |    |           |    |           |
  |  Master   |    |  Develop  |    |   Issue   |
  |           |    |           |    |           |
  └───────────┘    └───────────┘    └───────────┘

    release        ◄── merge         ◄── merge

  	tags:          branches:        branches:
    v0.0.3   ◄──   dev/v0.0.3  ◄──  issue/123-fix-broken-links + issue/211
    v0.0.2   ◄──   dev/v0.0.2  ◄──  issue/251-rename-all-the-files + issue/222 + issue/12221
    v0.0.1   ◄──   dev/v0.0.1  ◄──  issue/121-get-logins-working-again

```