const issueListReducer = (state = [], action) => {
    switch(action.type) {
        case "GET_SCAN_RESULTS":
            return action.payload;

        default:
            return state;
    }
}

export default issueListReducer;