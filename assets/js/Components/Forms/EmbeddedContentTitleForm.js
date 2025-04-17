import React, { useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import * as Html from '../../Services/Html'



export default function EmbeddedContentTitleForm(props) {
  let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml
  
  if (props.activeIssue.status === '1') {
    html = props.activeIssue.newHtml
  }
  let element = Html.toElement(html)
  const [textInputValue, setTextInputValue] = useState(element ? Html.getAttribute(element, "aria-label") : "")
  // const [deleteLabel, setDeleteLabel] = useState(!element && (props.activeIssue.status === "1"))
  const [textInputErrors, setTextInputErrors] = useState([])
  let formErrors = []
  useEffect(() => {
    let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml
    if (props.activeIssue.status === 1) {
      html = props.activeIssue.newHtml
    }
    let element = Html.toElement(html)
    setTextInputValue(element ? Html.getAttribute(element, "aria-label") : "")
    // setDeleteLabel(!element && props.activeIssue.status === 1)
    formErrors = []
  }, [props.activeIssue])
  useEffect(() => {
    handleHtmlUpdate()
  }, [textInputValue])
  const handleHtmlUpdate = () => {
    console.log(textInputValue)
    let updatedElement = Html.toElement(html)

    if (props.activeIssue.scanRuleId == 'media_alt_exists') {
        updatedElement = Html.setAttribute(updatedElement, "label", textInputValue)
    }
    else {
        updatedElement = Html.setAttribute(updatedElement, "title", textInputValue)
    }
    
    // if (deleteLabel) {
    //   updatedElement = Html.removeAttribute(updatedElement, "aria-label")
    // }
    // else {
    //   updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)
    // }
    let issue = props.activeIssue
    issue.newHtml = Html.toString(updatedElement)
    props.handleActiveIssue(issue)
  }
  const handleButton = () => {
    formErrors = []
    // if (!deleteLabel) {
    //   checkTextNotEmpty()
    // }
    checkTextNotEmpty()
    checkLabelIsUnique()
    if (formErrors.length > 0) {
      setTextInputErrors(formErrors)
    }
    else {
      props.handleIssueSave(props.activeIssue)
    }
  }
  const handleInput = (event) => {
    setTextInputValue(event.target.value)
    // handleHtmlUpdate()
  }
  // const handleCheckbox = () => {
  //   setDeleteLabel(!deleteLabel)
  //   // handleHtmlUpdate()
  // }
  const checkTextNotEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      formErrors.push({ text: "Empty label text.", type: "error" })
    }
  }
  const checkLabelIsUnique = () => {
    // in the case of aria_*_label_unique, messageArgs (from metadata) should have the offending label (at the first index)
    // i guess we could get it from the aria-label itself as well...
    const issue = props.activeIssue
    const metadata = issue.metadata ? JSON.parse(issue.metadata) : {}
    const labelFromMessageArgs = metadata.messageArgs ? metadata.messageArgs[0] : null
    const text = textInputValue.trim().toLowerCase()
    if (labelFromMessageArgs) {
      if (text == labelFromMessageArgs) {
        formErrors.push({ text: "Cannot reuse label text.", type: "error" })
      }
    }
  }
  const pending = props.activeIssue && props.activeIssue.pending == "1"
  const buttonLabel = pending ? "form.processing" : "form.submit"
  
  return (
    <div className='p-3'>
      <div>
        <label htmlFor="textInputValue">
          {props.activeIssue.scanRuleId === 'media_alt_exists'
            ? 'New Label Text'
            : 'New Title Text'}
        </label>
        <input
          type="text"
          id="textInputValue"
          value={textInputValue}
          onChange={handleInput}
          style={{ width: '100%', padding: '4px', marginTop: '4px' }}
        />
        {textInputErrors.length > 0 && (
          <ul style={{ color: 'red', marginTop: '4px' }}>
            {textInputErrors.map((err, i) => (
              <li key={i}>{err.text}</li>
            ))}
          </ul>
        )}
      </div>

      <div className='mt-2'>
        <button
          onClick={handleButton}
          disabled={pending || props.activeIssue.status === 2}
          className='btn btn-primary'
        >
          {pending ? 'Processing...' : props.t(buttonLabel)}
        </button>
      </div>
    </div>
  );
}