import React from 'react'
import ReactDOM from 'react-dom'
import AdminApp from './Components/Admin/AdminApp'
import getInitialData from './getInitialData'

const data = getInitialData()

ReactDOM.render(<AdminApp {...data} />, document.getElementById('root'))
