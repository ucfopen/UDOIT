const defaultState = {
    sections: "SHOW_ALL",
    content: "SHOW_ALL",
    issueTypes: "SHOW_ALL",
    issueTitles: "SHOW_ALL"
}

const visibilityFiltersReducer = (state = defaultState, action) => {
    switch(action.type) {
        case "SET_VISIBILITY_FILTER":
            return action.filter

        default:
            return state;
    }
}

export default visibilityFiltersReducer;