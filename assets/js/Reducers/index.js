import { combineReducers } from 'redux';
import issueListReducer from './issueList'
import visibilityFilterReducer from './visibilityFilters'

// Combining all of the reducers into one object
const allReducers = combineReducers({
    issueList: issueListReducer,
    visibilityFilters: visibilityFilterReducer,
});

export default allReducers;