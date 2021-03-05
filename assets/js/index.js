import React from 'react'
import ReactDOM from 'react-dom'
import App from './Components/App'
import getInitialData from './getInitialData'

const data = getInitialData()

ReactDOM.render(<App {...data} />, document.getElementById('root'))
