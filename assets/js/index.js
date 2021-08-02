import React from 'react'
import ReactDOM from 'react-dom'
import App from './Components/App'
import getInitialData from './getInitialData'
import { theme } from '@instructure/canvas-theme'

theme.use()
const data = getInitialData()

ReactDOM.render(<App {...data} />, document.getElementById('root'))
