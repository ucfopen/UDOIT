# Change Log

Please update this file as you open PRs and make changes to the codebase. Thank you!
## [Unreleased]

## [3.5.0]

### General

- Added TableNotEmpty rule and UFIXIT issue form to track tables with no content (Thank you, @AlanFCMV)
- Increased maximum file upload size allowed, from 1mb to 10mb (Thank you, @taheralfayad)
- Changed the description of 'ParagraphNotUsedAsHeader' rule to be less ambiguous since UDOIT has flagged this issue incorrectly before (Thank you, @taheralfayad)
- Updated outdated dependencies (Thank you, @dmols)
- Previously, the browser console would relay the data captured in the course, on initial scan. The console log has been removed since, to allow for more data security (Thank you, @dmols)
- Allow UDOIT to accept modern file types to be uploaded, such as those with extensions pptx, xlsx, docx (Thank you @taheralfayad)

### Bugfixes

- Fixed issue where more than one resolved issue in the UFIXIT modal can remain. Before, the modal would only show the most recent one resolved. (Thank you, @ssciolla)
- Fixed case where navigating through issues on UFIXIT modal would be difficult or impossible when one is marked as fixed, since the modal will jump back to the resolved one. (Thank you, @ssciolla)
- Fixed issue where adding a Youtube API key to your .env file would not make UDOIT automatically consider issues revolving youtube captioning. This was resolved by allowing a 'Full Course Rescan' option in the dropdown menu of the UDOIT welcome screen (Thank you, @taheralfayad)

## Previous Releases
For the time being, please refer to [this page](https://github.com/ucfopen/UDOIT/releases) to view the changes made to previous UDOIT releases.
