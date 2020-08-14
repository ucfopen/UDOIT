// Data selectors
export const getIssuesFromSection = (state, section) => {
    return state.issueList.data.report[section];
}
