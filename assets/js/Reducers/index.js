import { combineReducers } from 'redux';
import issueListReducer from './issueList'
import visibilityFilterReducer from './visibilityFilters'
import contentListReducer from './contentList'
import reportReducer from './report';

// Combining all of the reducers into one object
const allReducers = combineReducers({
    contentList: contentListReducer,
    issueList: issueListReducer,
    report: reportReducer,
    visibilityFilters: visibilityFilterReducer,
});

export default allReducers;