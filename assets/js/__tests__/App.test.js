import React from 'react'
import { renderComponent } from './utils'
import App from '../Components/App'
import * as settings from './fixtures/settings'
import { noMessages } from './fixtures/messages'

it('renders the App component', async () => {
  const { getByText } = renderComponent(
    <App settings={settings} messages={noMessages} />
  )
  const button = getByText('Continue')
  expect(button).toBeInTheDocument()
})
