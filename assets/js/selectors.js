// Constants
const sectionNames = [
    "announcements",
    "assignments",
    "files",
    "pages",
    "syllabus",
    "moduleUrls"
]

// Selectors

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

    console.log(section);
    console.log(sectionInfo);

    for(var i = 0; i < sectionInfo.length; i++) {
        for(var j = 0; j < sectionInfo[i].issues.length; j++) {
            let issue = sectionInfo[i].issues[j];

            if(issue.type === type) {
                if(issue.title in issueTypes) {
                    issueTypes[issue.title].count += 1
                } else {
                    issueTypes[issue.title] = issue;
                    issueTypes[issue.title].count = 1;
                }
            }
        }
    }

}

export const getIssueFrequency = (state, type) => {
    let issueTypes = {}

    sectionNames.forEach(section => getIssueTypes(state, section, type, issueTypes));

    return issueTypes;
}

// Helpers

