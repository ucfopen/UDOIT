import React from 'react'
import { renderComponent } from './utils'
import AltTextForm from '../Components/Forms/AltTextForm'
import { UFIXIT_OPTIONS } from '../Services/Constants'

const backgroundHtml = '<div style="background: right/cover url(\'https://example.com/ribbon.png\') no-repeat;"><h3>Header</h3></div>'

const renderForm = (scanRuleId, activeOption) => {
  const activeIssue = {
    scanRuleId: scanRuleId,
    ignoreClass: `udoit-ignore-${scanRuleId.replaceAll('_', '-')}`,
    sourceHtml: backgroundHtml,
    status: 0,
  }
  const handleActiveIssue = jest.fn()

  renderComponent(
    <AltTextForm
      t={(key) => key}
      activeIssue={activeIssue}
      isDisabled={false}
      handleActiveIssue={handleActiveIssue}
      activeOption={activeOption}
      setActiveOption={jest.fn()}
      formErrors={{}}
      setFormErrors={jest.fn()}
    />
  )

  return handleActiveIssue.mock.lastCall[0].newHtml
}

describe('AltTextForm with style_background_decorative', () => {
  it('adds the ignore class when the background is marked decorative', () => {
    const newHtml = renderForm('style_background_decorative', UFIXIT_OPTIONS.MARK_DECORATIVE)
    expect(newHtml).toContain('role="presentation"')
    expect(newHtml).toContain('class="udoit-ignore-style-background-decorative"')
  })

  it('adds the ignore class when alt text is added', () => {
    const newHtml = renderForm('style_background_decorative', UFIXIT_OPTIONS.ADD_TEXT)
    expect(newHtml).toContain('class="udoit-ignore-style-background-decorative"')
  })

  it('does not add the ignore class before an option is chosen', () => {
    const newHtml = renderForm('style_background_decorative', '')
    expect(newHtml).not.toContain('udoit-ignore-style-background-decorative')
  })

  it('does not add an ignore class for other alt text rules', () => {
    const newHtml = renderForm('img_alt_valid', UFIXIT_OPTIONS.MARK_DECORATIVE)
    expect(newHtml).not.toContain('udoit-ignore')
  })
})
