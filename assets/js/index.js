import React from 'react'
import ReactDOM from 'react-dom'
import App from './Components/app'
import { Provider } from 'react-redux'
import configureStore from './configureStore'

const store = configureStore()

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)