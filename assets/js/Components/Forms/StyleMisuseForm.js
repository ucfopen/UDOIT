import React, { act, useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
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
  const [useBold, setUseBold] = useState(isBold())
  const [useItalics, setUseItalics] = useState(isItalicized())
  const [removeStyling, setRemoveStyling] = useState(false)
  const [checkBoxErrors, setCheckBoxErrors] = useState([])
  const [styleAttribute, setStyleAttribute] = useState(Html.getAttribute(Html.getIssueHtml(activeIssue), "style"))

  let formErrors = []

  useEffect(() => {
    updatePreview()
  }, [])

  useEffect(() => {
    if (activeIssue?.issue) {
      setUseBold(isBold())
      setUseItalics(isItalicized())
      setCheckBoxErrors([])
      setStyleAttribute(Html.getAttribute(Html.getIssueHtml(activeIssue), "style"))
    }

    formErrors = []
  }, [activeIssue])

  useEffect(() => {
    updatePreview()
  }, [useBold, useItalics, removeStyling])

  function handleBoldToggle() {
    setUseBold(!useBold)
    updatePreview()
  }

  function handleItalicsToggle() {
    setUseItalics(!useItalics)
    updatePreview()
  }

  function handleStyleToggle() {
    setRemoveStyling(!removeStyling)
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

    if (removeStyling) {
      Html.removeAttribute(element, "style")
    }
    else {
      Html.setAttribute(element, "style", styleAttribute)
    }

    return Html.toString(element)
  }

  function updatePreview() {
    if (activeIssue) {
      let issue = activeIssue
      const html = Html.getIssueHtml(activeIssue)
  
      issue.newHtml = processHtml(html)
      handleActiveIssue(issue)
    }
  }

  function isBold() {
    if (activeIssue) {
      const issue = activeIssue
      const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)

      return ((Html.hasTag(element, 'strong')) || (metadata.fontWeight === 'bold'))
    }
    
    return false
  }

  function isItalicized() {
    if (activeIssue) {
      const issue = activeIssue
      const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
      const html = Html.getIssueHtml(activeIssue)
      const element = Html.toElement(html)
  
      return ((Html.hasTag(element, 'em')) || (metadata.fontStyle == 'italic'))
    }

    return false
  }

  function hasStyleTag() {
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    return true

    // return (Html.getAttribute(element, "style") != null)
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
      <div className='mt-1 mb-1 ml-0 mr-0'>
        <Checkbox label={t('form.contrast.bolden_text')}
          checked={useBold}
          onChange={handleBoldToggle}>
        </Checkbox>
        {/* <input id='bold-checkbox' type='checkbox' name={t('form.contrast.bolden_text')} />
        <label htmlFor='bold-checkbox'>{t('form.contrast.bolden_text')}</label> */}
      </div>

      <View as="div" margin="small 0">
        <Checkbox label={t('form.contrast.italicize_text')}
          checked={useItalics}
          onChange={handleItalicsToggle}
          messages={checkBoxErrors}>
        </Checkbox>
      </View>

      <View as="div" margin="small 0">
        {/* TOOD: use t */}
        <Checkbox label={"Remove styling from element"}
          checked={removeStyling}
          onChange={handleStyleToggle}
          messages={checkBoxErrors}>
        </Checkbox>
      </View>

      <View as="div" margin="medium 0">
        <Button color="primary" onClick={handleSubmit} interaction={(!pending && activeIssue?.status !== 2) ? 'enabled' : 'disabled'}>
          {('1' == pending) && <Spinner size="x-small" renderTitle={buttonLabel} />}
          {t(buttonLabel)}
        </Button>
        {activeIssue && activeIssue?.recentlyUpdated &&
          <View margin="0 small">
            <IconCheckMarkLine color="success" />
            <View margin="0 x-small">{t('label.fixed')}</View>
          </View>
        }
      </View>
    </div>
  )
}