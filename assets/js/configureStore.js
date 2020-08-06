import { createStore } from 'redux'
import allReducers from './Reducers'

export default function configureStore(params) {
    const store = createStore(allReducers);

    return store;
}
