import { combineReducers } from 'redux';
import issueListReducer from './issueList'

const allReducers = combineReducers({
    issueList: issueListReducer,
});

export default allReducers;