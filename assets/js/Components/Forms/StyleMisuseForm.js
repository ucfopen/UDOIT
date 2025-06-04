import React, { useEffect, useState } from 'react'
import ProgressIcon from '../Icons/ProgressIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function StyleMisuseForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
}) {
  const [useBold, setUseBold] = useState(() => isBold())
  const [useItalics, setUseItalics] = useState(() => isItalicized())
  const [checkBoxErrors, setCheckBoxErrors] = useState([])

  let formErrors = []

  useEffect(() => {
    updatePreview()
  }, [])

  useEffect(() => {
    setUseBold(false)
    setUseItalics(false)

    if (activeIssue.status == '1') {
      // set checkboxes based on if its already fixed
      setUseBold(isBold())
      setUseItalics(isItalicized())
      setCheckBoxErrors([])
    }

    formErrors = []
  }, [activeIssue])

  useEffect(() => {
    updatePreview()
  }, [useBold, useItalics])

  function handleBoldToggle() {
    setUseBold(!useBold)
    updatePreview()
  }

  function handleItalicsToggle() {
    setUseItalics(!useItalics)
    updatePreview()
  }

  function handleSubmit() {
    let issue = activeIssue

    if (cssEmphasisIsValid(issue)) {
      let issue = activeIssue
      issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
      handleIssueSave(issue)
    }
    else {
      // push errors
      formErrors = []
      formErrors.push({ text: `${t('form.contrast.must_select')}`, type: 'error' })

      setCheckBoxErrors(formErrors)
    }
  }

  function processHtml(html) {
    let element = Html.toElement(html)

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    element.innerHTML = (useBold) ? `<strong>${element.innerHTML}</strong>` : element.innerHTML
    element.innerHTML = (useItalics) ? `<em>${element.innerHTML}</em>` : element.innerHTML

    return Html.toString(element)
  }

  function updatePreview() {
      let issue = activeIssue
      const html = Html.getIssueHtml(activeIssue)
  
      issue.newHtml = processHtml(html)
      handleActiveIssue(issue)
  }

  function isBold() {
    const issue = activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    return ((Html.hasTag(element, 'strong')) || (metadata.fontWeight === 'bold'))
  }

  function isItalicized() {
    const issue = activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    return ((Html.hasTag(element, 'em')) || (metadata.fontStyle == 'italic'))
  }

  function cssEmphasisIsValid(issue) {
    if (issue.scanRuleId === 'style_color_misuse') {
      if (!useBold && !useItalics) {
        return false
      }
    }

    return true
  }

  const pending = (activeIssue && (activeIssue.pending == '1'))
  const buttonLabel = (pending) ? 'form.processing' : 'form.submit'

  return (
    <div padding="0 x-small" className='pt-0 pb-0 pl-1 pr-1'>
      <div id="flash-messages" role="alert"></div>

      <form onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}>
        <div className='mt-1 mb-1 ml-0 mr-0'>
          <input id='bold-checkbox' type='checkbox' name={t('form.contrast.bolden_text')} checked={useBold} onChange={handleBoldToggle}/>
          <label htmlFor='bold-checkbox'>{t('form.contrast.bolden_text')}</label>
        </div>

        <div className='mt-1 mb-1 ml-0 mr-0'>
          <input id='italicize-checkbox' type='checkbox' name={t('form.contrast.italicize_text')} checked={useItalics} onChange={handleItalicsToggle}/>
          <label htmlFor='italicize-checkbox'>{t('form.contrast.italicize_text')}</label>
        </div>

        <div className='mt-2 mb-1 ml-0 mr-0'>
          <button className={(useBold === false && useItalics === false) || pending || activeIssue?.status === 2 ? 'btn btn-secondary disabled' : 'btn btn-primary'} disabled={pending || activeIssue?.status === 2 || useBold === false && useItalics === false} type='submit'>
            {('1' == pending) && <div className='spinner'><ProgressIcon /></div>}
            {t(buttonLabel)}
          </button>
          {activeIssue && activeIssue?.recentlyUpdated &&
            <div className='mt-1 mb-1 ml-0 mr-0'>
              <ResolvedIcon />
              <span className='mt-1 mb-1 ml-0 mr-0'>{t('label.fixed')}</span>
            </div>
          }
        </div>
      </form>
    </div>
  )
}