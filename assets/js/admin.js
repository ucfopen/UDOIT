import React from 'react'
import ReactDOM from 'react-dom'
import AdminApp from './Components/Admin/AdminApp'
import getInitialData from './getInitialData'
import { theme } from '@instructure/canvas-theme'

theme.use()
const data = getInitialData()

ReactDOM.render(<AdminApp {...data} />, document.getElementById('root'))
