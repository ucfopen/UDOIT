const issueListReducer = (state = [], action) => {
    console.log(action);
    switch(action.type) {
        case "GET_SCAN_RESULTS":
            state = action.payload;

            return state;

        default:
            return state;
    }
}

export default issueListReducer;