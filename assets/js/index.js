import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './Components/App'
import getInitialData from './getInitialData'
// import { theme } from '@instructure/canvas-theme'

// theme.use()
const data = getInitialData()

// Updated from react-dom's `render` to `createRoot.render` for React 18:
// https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis
const root = createRoot(document.getElementById('root'))
root.render(<App {...data} />)