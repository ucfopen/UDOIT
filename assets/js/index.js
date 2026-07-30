import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './Components/App'
import getInitialData from './getInitialData'

// const root = createRoot(document.getElementById('root'))
const root = createRoot(document.getElementsByTagName('body')[0])

getInitialData('api/settings').then((data) => {
  root.render(<App {...data} />)
})
