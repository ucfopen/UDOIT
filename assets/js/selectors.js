// Data selectors

function getIssuesFromSection(state, section) {
    return state.issueList.data.report[section];
}
