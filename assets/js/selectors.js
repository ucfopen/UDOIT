import issueListReducer from "./Reducers/issueList";

// Constants
const sectionNames = [
    "announcement",
    "assignment",
    "file",
    "page",
    "discussion",
    "syllabus",
    "moduleUrl"
]

const searchTermFields = [
    "status",
    "title",
    "type",
    "contentTitle",
    "section"
]

export const getContentById = (state, contentId) => {
    return Object.assign({}, state.contentList[contentId]);
}

// Selectors
export const getIssueFrequency = (state, type) => {
    let issueTypes = []

    sectionNames.forEach(section => getIssueTypes(state, section, type, issueTypes));

    return issueTypes;
}

export const getReportDetails = (state) => {

    const issueDictionary = {}
    const issueFrequency = {"error": {}, "suggestion": {}}

    sectionNames.forEach(section => {issueDictionary[section] = {"error": 0, "suggestion": 0}})

    Object.keys(state.issueList).forEach(function(key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        let currentIssue = state.issueList[key];

        //Look up the piece of content that the issue refers to 
        let currentContent = state.contentList[currentIssue.contentItemId];
        // Add it to the appropriate content type
        issueDictionary[currentContent.contentType][currentIssue.type] += 1;

        
        if(currentIssue.scanRuleId in issueFrequency[currentIssue.type]) {
            issueFrequency[currentIssue.type][currentIssue.scanRuleId]["count"] += 1;
        } else {
            issueFrequency[currentIssue.type][currentIssue.scanRuleId] = {"count": 1}
        }    
    });

    return {
        issueDictionary,
        issueFrequency
    }
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
    var filteredList = [];
    var issueList = Object.assign({}, state.issueList);

    console.log("hello?");
    
    // Loop through the issues
    for (const [key, value] of Object.entries(issueList)) {
        var issue = Object.assign({}, value)
        // Check if we are interested in this issue severity, aka "type"
        if(state.visibilityFilters.issueTypes === "SHOW_ALL" || state.visibilityFilters.issueTypes.includes(issue.type)) {
            // Check if we are interested in issues with this title
            if(state.visibilityFilters.issueTitles === "SHOW_ALL" || state.visibilityFilters.issueTitles.includes(issue.scanRuleId)) {
                // Check if we are interested in the issue based on whether it is fixed or not
                issue.status = (issue.status === false ? "Not Fixed" : "Fixed")
                if(state.visibilityFilters.status === "SHOW_ALL" || state.visibilityFilters.status.includes(issue.status)){
                    // Get information about the content the issue refers to
                    var contentPiece = getContentById(state, issue.contentItemId);

                    // Check if we are interesteed in this piece of content
                    if(state.visibilityFilters.content === "SHOW_ALL" || state.visibilityFilters.content.includes(contentPiece.title)) {
                        // Check if we are interested in this type of content
                        if(state.visibilityFilters.sections === "SHOW_ALL" || state.visibilityFilters.sections.includes(contentPiece.contentType)) {
                            issue.contentTitle = contentPiece.title;
                            issue.contentType = contentPiece.contentType
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

const matchesKeywordSearch = (search_term, issue) => {
    return true;
}
