// Imports
import data from '../report_example.json';

// Action Types
const GET_SCAN_RESULTS = 'GET_SCAN_RESULTS';
const SET_VISBILITY_FILTER = 'SET_VISIBILITY_FILTER'

const defaultFilter = {
    sections: "SHOW_ALL",
    content: "SHOW_ALL",
    issueTypes: "SHOW_ALL",
    issueTitles: "SHOW_ALL",
    status: "SHOW_ALL",
    search_term: "SHOW_ALL"
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


