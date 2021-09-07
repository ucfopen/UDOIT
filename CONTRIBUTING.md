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

If you are an outside contributor, you will need to fork the UDOIT project in order to work on it.  If you are familiar with Git, but are unsure of the forking process, read the [Forking Projects](https://guides.github.com/activities/forking/) guide.  After you are finished fixing a bug or implementing a feature on your fork, submit a pull request using the appropriate [Dev branch](#dev-branches) as the `base`.

The overall workflow is:

1. Choose an issue to work on, or submit a new one.
2. [Fork this project](https://guides.github.com/activities/forking/)
3. Make the changes necessary to resolve the issue.
4. Test the code in your own environment.
5. Create a pull request
   1. Use the appropriate [Dev branch](#dev-branches) as the `base`
   2. Write a description of what you did in the `description` field.
   3. [Link the pull request to the issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)
6. Pay attention to the pull request and respond to any questions others have about it.  It may take a few back-and-forth communications and changes for your pull request to be approved and merged.

## Branching

If you are a member of the UDOIT team, you can either fork the project (using the instructions above) or branch.  Refer to the [Issue Branches](#issue-branches) section for the proper naming convention and pull request process.

## Explanation of Branches and Merging

UDOIT has a structured flow for how issues, branches, and releases are handled.  

### Main Branch

* This is the default branch.
* It always points at the latest release, and thus always production ready.

### Dev Branches

* Naming Convention: `dev/v1-2-10` - a new one for every upcoming release version - following [SEMVER](http://semver.org/). (Note: Hyphens are used instead of periods to preserve compatibility with the Heroku button.)
* Issue branches merge into this branch (never main)
* When this dev branch is ready for release, it is merged into main and deleted

### Issue Branches

* Naming Convention: `issue/3432-add-package-json-dependency`
* The number is an issue number, and the text is a very short description of the issue.
* All issue branches must be tied to an issue, even in your forked version of UDOIT.
* Make sure you update your forked version first, then create your issue branch from the current dev branch.
* After work is completed, create a pull request into the target dev branch (never main).
* After the pull request is merged, the issue branch should be deleted.

### Releases

The steps in this section are performed by the project maintainers.

* After the dev branch for a release is merged into main, a [Release](https://github.com/ucfopen/UDOIT/releases) is created for it. [Article about managing releases](https://docs.github.com/en/github/administering-a-repository/releasing-projects-on-github/managing-releases-in-a-repository)
* Releases are named in the format `v1.2.10` (the same as the dev branch, but with periods instead of dashes).
* Each release gets a tag with the same name as the release after it's merged into main.
* It is suggested that you sign release tags for extra trust ([git tag](https://git-scm.com/book/tr/v2/Git-Tools-Signing-Your-Work)).