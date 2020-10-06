const reportReducer = (state = [], action) => {
    switch(action.type) {
        case "GET_SCAN_RESULTS":
            return action.payload.data;

        default:
            return state;
    }
}

export default reportReducer;