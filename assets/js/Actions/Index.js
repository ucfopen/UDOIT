// Imports
import data from '../testData.json';

// Action Types
const GET_SCAN_RESULTS = 'GET_SCAN_RESULTS';

// Action Creators
function getScanResults() {
    console.log(data.data[0].report.announcements[0].issues);
    return {
        type: GET_SCAN_RESULTS,
        payload: data.data[0].report.announcements[0].issues
    }
}

export default getScanResults;


