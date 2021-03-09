import { render } from '@testing-library/react'

if (process.env.IGNORE_CONSOLE_ERRORS) {
  console.error = () => {}
}
if (process.env.IGNORE_CONSOLE_WARNINGS) {
  console.warn = () => {}
}

export function renderComponent(children) {
  return {
    ...render(children),
  }
}
