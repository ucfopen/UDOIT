import { combineReducers } from 'redux';
import issueListReducer from './issueList'

// Combining all of the reducers into one object
const allReducers = combineReducers({
    issueList: issueListReducer,
});

export default allReducers;