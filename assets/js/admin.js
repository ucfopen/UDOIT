import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './Components/Admin/AdminApp'
import getInitialData from './getInitialData'

const root = createRoot(document.getElementById('root'))

getInitialData('api/admin/settings').then((data) => {
  root.render(<AdminApp {...data} />)
})
