// Constants
const sectionNames = [
    "announcements",
    "assignments",
    "files",
    "pages",
    "discussions",
    "syllabus",
    "moduleUrls"
]

// Selectors
export const getIssueFrequency = (state, type) => {
    let issueTypes = []

    sectionNames.forEach(section => getIssueTypes(state, section, type, issueTypes));

    return issueTypes;
}

export const getIssuesFromSection = (state, section) => {
    return state.issueList.data[0].report[section];
}

export const getCountsFromSection = (state, section) => {
    let sectionInfo = getIssuesFromSection(state, section);
    let errorCount = 0, suggestionCount = 0;
    
    for(var i = 0; i < sectionInfo.length; i++) {
        errorCount += sectionInfo[i].issues.filter(issue => issue.type == "error").length;
        suggestionCount += sectionInfo[i].issues.filter(issue => issue.type == "suggestion").length;
    }

    return {errorCount, suggestionCount}
}

export const getIssueTypes = (state, section, type, issueTypes) => {
    let sectionInfo = getIssuesFromSection(state, section);

    for(var i = 0; i < sectionInfo.length; i++) {
        for(var j = 0; j < sectionInfo[i].issues.length; j++) {
            let issue = sectionInfo[i].issues[j];

            if(issue.type === type) {
                var obj = issueTypes.find(element => element.title == issue.title);
            
                if(obj === undefined) {
                    issue.count = 1;
                    issueTypes.push(issue);
                } else {
                    obj.count += 1;
                }
            }
        }
    }

}

// Filters content based on multiple parameters
export const getFilteredContent = (state) => {
    let filteredList = [];

    // Loop through the content sections
    for(var section of sectionNames) {
        if(state.visibilityFilters.sections === "SHOW_ALL" || state.visibilityFilters.sections.includes(section)) { 
            // Get the content for that section
            var contentList = state.issueList.data[0].report[section];
            
            // Loop through the content
            for(var contentPiece of contentList) {
                if(state.visibilityFilters.content === "SHOW_ALL" || state.visibilityFilters.content.includes(contentPiece.title)) {
                    var issues = contentPiece.issues;
                    console.log(issues);
                    // Loop through the issues
                    for(var issue of issues) {
                        if((state.visibilityFilters.issueTypes === "SHOW_ALL" || state.visibilityFilters.issueTypes.includes(issue.type))
                        && (state.visibilityFilters.issueTitles === "SHOW_ALL" || state.visibilityFilters.issueTitles.includes(issue.title))
                        && (state.visibilityFilters.status === "SHOW_ALL" || state.visibilityFilters.status.includes(issue.status))) {
                            issue.contentTitle = contentPiece.title;
                            issue.section = section;
                            filteredList.push(issue);
                        }
                    }

                }
            }
        }
    }

    return filteredList;
}

// Helpers

