import { createStore } from 'redux'
import allReducers from './Reducers'

export default function configureStore(params) { 
    const store = createStore(
        // All the reducers combined from Reducers/index.js
        allReducers,
        
        // Enabling Chrome react devtools extension for easier debugging
        // You will stiil need to download the extension through Chrome
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );

    return store;
}
