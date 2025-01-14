# Change Log

Please update this file as you open PRs and make changes to the codebase. Thank you!
## [Unreleased](https://github.com/ucfopen/UDOIT/tree/dev)

## [4.0] -- In Progress

- Updated UDOIT's PHP version from 8.2 to 8.4 to avoid issues pulling the latest composer image, as well as work with a php version that has active support. (Thank you, [@dmols](https://github.com/dmols) and [@panbed](https://github.com/panbed))

## [3.5.0](https://github.com/ucfopen/UDOIT/compare/3.4.0...3.5.0) - 2024-11-12

### General

- Changed element highlight color in UFIXIT form to meet all accessibility standards for color contrast, in [this commit](https://github.com/ucfopen/UDOIT/commit/93f4bdd3b64be23392a0fc16a3df5b4f9f057217) (Thank you, [@dmols](https://github.com/dmols))
- Added TableNotEmpty rule and UFIXIT issue form to track tables with no content [#725](https://github.com/ucfopen/UDOIT/pull/725) (Thank you, [@AlanFCMV](https://github.com/alanfcmv))
- Increased maximum file upload size allowed, from 1mb to 10mb [#944](https://github.com/ucfopen/UDOIT/pull/944) (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Changed the description of 'ParagraphNotUsedAsHeader' rule to be less ambiguous since UDOIT has flagged this issue incorrectly before [#938](https://github.com/ucfopen/UDOIT/pull/938) (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Updated outdated dependencies [#947](https://github.com/ucfopen/UDOIT/pull/947) (Thank you, [@dmols](https://github.com/dmols))
- Previously, the browser console would relay the data captured in the course, on initial scan. The console log has been removed since, to allow for better data security [#946](https://github.com/ucfopen/UDOIT/pull/946) (Thank you, [@dmols](https://github.com/dmols))
- Allow UDOIT to accept modern file types to be uploaded, such as those with extensions pptx, xlsx, docx [#943](https://github.com/ucfopen/UDOIT/pull/943) (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Added a CHANGELOG file to keep better track of the codebase changes [#957](https://github.com/ucfopen/UDOIT/pull/957) (Thank you, [@dmols](https://github.com/dmols))
- Made changes to `INSTALL_CANVAS.md` and `INSTALL.md` files to make the installation process a little easier to follow [#950](https://github.com/ucfopen/UDOIT/pull/950) (Thank you [@SimHoZebs](https://github.com/SimHoZebs))
- Added `Makefile` to speed up development process [#958](https://github.com/ucfopen/UDOIT/pull/958) (Thank you, [@SimHoZebs](https://github.com/SimHoZebs))\
- Dependabot bumped `ws` package from 6.2.2 to 6.2.3 in [this commit](https://github.com/ucfopen/UDOIT/commit/2c6962f336e437f3bdffa42534f7235f01bd3c3a)

### Bugfixes

- Fixed issue where more than one resolved issue in the UFIXIT modal can remain. Before, the modal would only show the most recent one resolved [#892](https://github.com/ucfopen/UDOIT/pull/892) (Thank you, [@ssciolla](https://github.com/ssciolla))
- Fixed case where navigating through issues on UFIXIT modal would be difficult or impossible when one is marked as fixed, since the modal will jump back to the resolved one [#888](https://github.com/ucfopen/UDOIT/pull/888) (Thank you, [@ssciolla](https://github.com/ssciolla))
- Fixed issue where adding a Youtube API key to your .env file would not make UDOIT automatically consider issues revolving youtube captioning. This was resolved by allowing a 'Full Course Rescan' option in the dropdown menu of the UDOIT welcome screen [#898](https://github.com/ucfopen/UDOIT/pull/898) (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Increased php `memory_limit` from 800M to 3500M, and both `max_execution_time` and `fastcgi_read_timeout` from 180 to 300, to allow for php to handle a larger amount of data, and having nginx wait longer for the processes to complete. Changes seen in [this commit](https://github.com/ucfopen/UDOIT/commit/d6c71b59dc3a353fc3d18b048473e1e09bcef423) (Thank you, [@dmols](https://github.com/dmols) and [@Thetwam](https://github.com/Thetwam))

## Previous Releases
Please refer to [this page](https://github.com/ucfopen/UDOIT/releases) to view the changes made on previous UDOIT releases.
