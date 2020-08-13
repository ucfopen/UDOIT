// Action Types
const GET_SCAN_RESULTS = 'GET_SCAN_RESULTS';

// Action Creators
function getScanResults() {
    return {
        type: GET_SCAN_RESULTS,
        payload: [{
            "id": 12345,
            "scanRuleId": "Scan Rule Id",
            "title": "Issue 1 Title",
            "description": "Issue 1 Description",
            "type": "error",
            "uFixIt": true,
            "sourceHtml": "<div>Source HTML</div>"
        },
        {
            "id": 23456,
            "title": "Issue 2 Title",
            "scanRuleId": "Scan Rule Id",
            "description": "Issue 2 Description",
            "type": "suggestion",
            "uFixIt": false,
            "sourceHtml": "<div>Source HTML</div>"
        }]
    }
}

export default getScanResults;


