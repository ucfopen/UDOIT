// Data selectors

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

export const getIssueTypes = (state, section, type) => {
    let sectionInfo = getIssuesFromSection(state, section);
    let issueTypes = []

    for(var i = 0; i < sectionInfo.length; i++) {
        issueTypes = issueTypes.concat(sectionInfo[i].issues.filter(issue => issue.type === type));
    }

    return issueTypes;
}


