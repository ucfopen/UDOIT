import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './Components/App'
import getInitialData from './getInitialData'

const root = createRoot(document.getElementById('root'))

getInitialData('api/settings').then((data) => {
  root.render(<App {...data} />)
})
