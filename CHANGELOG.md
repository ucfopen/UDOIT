# Change Log

Please update this file as you open PRs and make changes to the codebase. Thank you!
## [Unreleased](https://github.com/ucfopen/UDOIT/tree/dev)

## [3.5.0](https://github.com/ucfopen/UDOIT/compare/stable/3.4.x...dev-v3.5.0) - 2024-11-12

### General

- Changed highlight color of 'alt text' for the UFIXIT form to meet all accessibility standards for color contrast (Thank you, [@dmols](https://github.com/dmols))
- Added TableNotEmpty rule and UFIXIT issue form to track tables with no content (Thank you, [@AlanFCMV](https://github.com/alanfcmv))
- Increased maximum file upload size allowed, from 1mb to 10mb (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Changed the description of 'ParagraphNotUsedAsHeader' rule to be less ambiguous since UDOIT has flagged this issue incorrectly before (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Updated outdated dependencies (Thank you, [@dmols](https://github.com/dmols))
- Previously, the browser console would relay the data captured in the course, on initial scan. The console log has been removed since, to allow for better data security (Thank you, [@dmols](https://github.com/dmols))
- Allow UDOIT to accept modern file types to be uploaded, such as those with extensions pptx, xlsx, docx (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Added a CHANGELOG file to keep better track of the codebase changes (Thank you, [@dmols](https://github.com/dmols))
- Made changes to `INSTALL_CANVAS.md` and `INSTALL.md` files to make the installation process a little easier to follow. (Thank you [@SimHoZebs](https://github.com/SimHoZebs))
- Added `Makefile` to speed up development process (Thank you, [@SimHoZebs](https://github.com/SimHoZebs))

### Bugfixes

- Fixed issue where more than one resolved issue in the UFIXIT modal can remain. Before, the modal would only show the most recent one resolved. (Thank you, [@ssciolla](https://github.com/ssciolla))
- Fixed case where navigating through issues on UFIXIT modal would be difficult or impossible when one is marked as fixed, since the modal will jump back to the resolved one. (Thank you, [@ssciolla](https://github.com/ssciolla))
- Fixed issue where adding a Youtube API key to your .env file would not make UDOIT automatically consider issues revolving youtube captioning. This was resolved by allowing a 'Full Course Rescan' option in the dropdown menu of the UDOIT welcome screen (Thank you, [@taheralfayad](https://github.com/taheralfayad))
- Upgraded php max_execution_time from 800M to 3500M, and fastcgi_read_timeout from 180 to 300, to allow for php to handle a larger amount of data, and having nginx wait longer for the processes to complete. (Thank you, [@dmols](https://github.com/dmols) and [@Thetwam](https://github.com/Thetwam))

## Previous Releases
Please refer to [this page](https://github.com/ucfopen/UDOIT/releases) to view the changes made on previous UDOIT releases.
