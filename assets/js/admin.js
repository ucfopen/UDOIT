import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './Components/Admin/AdminApp'
import getInitialData from './getInitialData'
import { api } from './Services/Api'

const root = createRoot(document.getElementById('root'))

getInitialData('api/admin/settings').then((data) => {
  api.setInstanceInfo(data.instanceInfo)
  root.render(<AdminApp {...data} />)
})
