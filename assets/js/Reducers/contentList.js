const contentListReducer = (state = [], action) => {
    switch(action.type) {
        case "GET_SCAN_RESULTS":
            return action.payload.data.contentItems;

        default:
            return state;
    }
}

export default contentListReducer;