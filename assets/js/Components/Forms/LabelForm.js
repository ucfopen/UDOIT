import React, { useEffect, useState } from 'react'
import * as Html from '../../Services/Html'
// import ProcessIcon from '../Icons/ProgressIcon'
// import ResolvedIcon from '../Icons/ResolvedIcon'

export default function LabelForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
}) {
  let html = activeIssue.newHtml ? activeIssue.newHtml : activeIssue.sourceHtml
  
  if (activeIssue.status === '1') {
    html = activeIssue.newHtml
  }

  let element = Html.toElement(html)

  const [textInputValue, setTextInputValue] = useState(element && element.getAttribute("aria-label") ? element.getAttribute("aria-label") : "")
  const [textInputErrors, setTextInputErrors] = useState([])
  const [ariaLabelExists, setAriaLabelExists] = useState((element && element.getAttribute("aria-label")) != null)

  let formErrors = []

  useEffect(() => {
    let html = activeIssue.newHtml ? activeIssue.newHtml : activeIssue.sourceHtml
    if (activeIssue.status === 1) {
      html = activeIssue.newHtml
    }

    let element = Html.toElement(html)

    if (element && element.getAttribute("aria-label")) {
      setTextInputValue(element.getAttribute("aria-label"))
    }
    else {
      setTextInputValue("")
    }

    formErrors = []

  }, [activeIssue])

  useEffect(() => {
    handleHtmlUpdate()
  }, [textInputValue])

  const handleHtmlUpdate = () => {
    let updatedElement = Html.toElement(html)

    if (ariaLabelExists) {
      updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)
      setAriaLabelExists(true)
    }
    else {
      updatedElement = Html.removeAttribute(updatedElement)
      setAriaLabelExists(true)
    }
    
    let issue = activeIssue
    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const handleButton = () => {
    formErrors = []

    checkTextNotEmpty()
    checkLabelIsUnique()

    if (formErrors.length > 0) {
      setTextInputErrors(formErrors)
    }
    else {
      formErrors = []
      setTextInputErrors(formErrors)
      handleIssueSave(activeIssue)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const checkTextNotEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      formErrors.push({ text: "Empty label text.", type: "error" })
    }
  }

  const checkLabelIsUnique = () => {
    // in the case of aria_*_label_unique, messageArgs (from metadata) should have the offending label (at the first index)
    // i guess we could get it from the aria-label itself as well...
    const issue = activeIssue
    const metadata = issue.metadata ? JSON.parse(issue.metadata) : {}
    const labelFromMessageArgs = metadata.messageArgs ? metadata.messageArgs[0] : null
    const text = textInputValue.trim().toLowerCase()

    if (labelFromMessageArgs) {
      if (text == labelFromMessageArgs) {
        formErrors.push({ text: "Cannot reuse label text.", type: "error" })
      }
    }
  }

  const pending = activeIssue.pending == "1"
  const buttonLabel = pending ? "form.processing" : "form.submit"
  
  return (
    <div className='pt-0 pb-0 pl-1 pr-1'>

      <form onSubmit={(e) => {
        e.preventDefault()
        handleButton()
      }}>
        <div className='mt-1 mb-1 ml-0 mr-0 flex-col gap-1'>
          <label htmlFor='label-value'>New Label Text</label>
          <input id='label-value' type='text' name="New Label Text" value={textInputValue} onChange={handleInput} />
          <div id="flash-messages" role="alert">
            {textInputErrors.map((error, index) => (
              <div key={index} className='color-issue'>
                {error.text}
              </div>
            ))}
          </div>
        </div>

        <div className='mt-2 mb-1 ml-0 mr-0'>
          <button 
            className={(formErrors.length > 0) || pending || activeIssue?.status == "2" ? 'btn btn-secondary disabled' : 'btn btn-primary'} 
            disabled={pending || activeIssue?.status == 2 || formErrors.length > 0} 
            type='submit'
          >
            {/* {('1' == pending) && <div className='spinner'><ProcessIcon /></div>} */}
            {t(buttonLabel)}
          </button>
          {/* {activeIssue && activeIssue?.recentlyUpdated &&
            <div className='mt-1 mb-1 ml-0 mr-0'>
              <ResolvedIcon />
              <span className='mt-1 mb-1 ml-0 mr-0'>{t('label.fixed')}</span>
            </div>
          } */}
        </div>
      </form>
    </div>


  );
}