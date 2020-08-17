// Imports
import data from '../testData.json';

// Action Types
const GET_SCAN_RESULTS = 'GET_SCAN_RESULTS';

// Action Creators
function getScanResults() {
    console.log(data);
    return {
        type: GET_SCAN_RESULTS,
        payload: data
    }
}

export default getScanResults;


