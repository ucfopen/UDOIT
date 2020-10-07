const issueListReducer = (state = [], action) => {
    switch(action.type) {
        case "GET_SCAN_RESULTS":
            return action.payload.data.issues;

        default:
            return state;
    }
}

export default issueListReducer;