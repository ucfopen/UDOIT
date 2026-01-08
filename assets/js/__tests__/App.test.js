import React from 'react'
import { renderComponent } from './utils'
import App from '../Components/App'
import * as settings from './fixtures/settings'
import { noMessages } from './fixtures/messages'
import { render, screen } from '@testing-library/react';

it('renders the App component', async () => {
  const { getByText } = renderComponent(
    <App settings={settings} messages={noMessages} />
  )

  // Check if Welcome screen rendered text. TODO: build more extensive tests for UDOIT
  const div = getByText('Scanning Course... Please Wait')
  expect(div).toBeInTheDocument()
})
