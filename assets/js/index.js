import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './Components/App'
import getInitialData from './getInitialData'
import { api } from './Services/Api'

// const root = createRoot(document.getElementById('root'))
const root = createRoot(document.getElementsByTagName('body')[0])

getInitialData('api/settings').then((data) => {
  api.setInstanceInfo(data.instanceInfo);
  root.render(<App { ...data } />);
})
