import React, { act, useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
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
  // const [removeStyling, setRemoveStyling] = useState(false)
  const [checkBoxErrors, setCheckBoxErrors] = useState([])
  // const [styleAttribute, setStyleAttribute] = useState(Html.getAttribute(Html.getIssueHtml(activeIssue), "style"))

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
      // setStyleAttribute(Html.getAttribute(Html.getIssueHtml(activeIssue), "style"))
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

  // function handleStyleToggle() {
  //   setRemoveStyling(!removeStyling)
  //   updatePreview()
  // }

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

  // function removeStylingAttribute(element) {
  //   // remove styling recursively from all children (if they exist)
  //   let children = element.children
  //   if (children.length > 0) {
  //     for (let i = 0; i < children.length; i++) {
  //       removeStylingAttribute(children[i])
  //     }
  //   }

  //   Html.removeAttribute(element, "style")
  // }

  function processHtml(html) {
    let element = Html.toElement(html)

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    element.innerHTML = (useBold) ? `<strong>${element.innerHTML}</strong>` : element.innerHTML
    element.innerHTML = (useItalics) ? `<em>${element.innerHTML}</em>` : element.innerHTML

    // if (removeStyling) {
    //   removeStylingAttribute(element)
    // }
    // else {
    //   Html.setAttribute(element, "style", styleAttribute)
    // }

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

  // function hasStyleTag() {
  //   const html = Html.getIssueHtml(activeIssue)
  //   const element = Html.toElement(html)

  //   return (Html.getAttribute(element, "style") != null)
  // }

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

      {/* TODO: removeStyling would be cool IF IT WORKED */}
      {/* <div className='mt-1 mb-1 ml-0 mr-0'>
        <input id='styling-checkbox' type='checkbox' name={"Remove styling from element"} checked={removeStyling} onChange={handleStyleToggle}/>
        <label htmlFor='styling-checkbox'>{"Remove styling from element"}</label>
        {checkBoxErrors.forEach((error) => {
          if (error.type === 'error') {
            return <span className='text-danger'>{error.text}</span>
          }
        }
        )}
      </div> */}

    </div>
  )
}