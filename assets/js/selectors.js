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

export const getIssueFrequency = (state, type) => {
    let issueTypes = []

    sectionNames.forEach(section => getIssueTypes(state, section, type, issueTypes));

    console.log(issueTypes);

    return issueTypes;
}

// Helpers

