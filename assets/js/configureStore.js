import { createStore } from 'redux'
import allReducers from './Reducers'

export default function configureStore(params) { 
    const store = createStore(
        allReducers,
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );

    return store;
}
