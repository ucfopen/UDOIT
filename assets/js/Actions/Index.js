// Imports
import data from '../testData.json';

// Action Types
const GET_SCAN_RESULTS = 'GET_SCAN_RESULTS';
const SET_VISBILITY_FILTER = 'SET_VISIBILITY_FILTER'
const defaultFilter = {
    sections: "SHOW_ALL",
    content: "SHOW_ALL",
    issueSeverity: "SHOW_ALL",
    issueType: "SHOW_ALL"
}

// Action Creators
export const getScanResults = () => ({
    type: GET_SCAN_RESULTS,
    payload: data
});

export const setVisibilityFilter = (filter = defaultFilter) => ({
    type: SET_VISBILITY_FILTER,
    filter: filter 
});


