import React, { useState, useEffect } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function HeadingStyleForm ({
  t,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
 }) {

  const styleTags = ["strong", "b", "i", "em", "mark", "small", "del", "ins", "sub", "sup"]
  const selectOptions = ["H2", "H3", "H4", "H5", "H6"]
  const allHeadings = ["H1", "H2", "H3", "H4", "H5", "H6", "h1", "h2", "h3", "h4", "h5", "h6"]

  const [selectedValue, setSelectedValue] = useState('')
  const [removeStyling, setRemoveStyling] = useState(false)

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    const tagName = Html.getTagName(element).toUpperCase()
    
    const tagSelection = selectOptions.includes(tagName) ? tagName : ''
    setSelectedValue(tagSelection)
    setRemoveStyling(false)
  }, [activeIssue])

  useEffect(() => {
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }, [selectedValue, removeStyling])

  const processHtml = () => {
    let newHeader
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    if (selectedValue) {
      newHeader = document.createElement(selectedValue)
      newHeader.innerHTML = element.innerHTML

      for (let styleTag of styleTags) {
        newHeader = Html.removeTag(newHeader, styleTag)
      }
    }
    else {
      newHeader = Html.toElement(activeIssue.sourceHtml)

      if(allHeadings.includes(newHeader.tagName)) {
        const innerHtml = newHeader.innerHTML
        newHeader = document.createElement('p')
        newHeader.innerHTML = innerHtml
      }

      if (removeStyling) {
        for (let styleTag of styleTags) {
          newHeader = Html.removeTag(newHeader, styleTag)
        }
        if (newHeader.hasAttribute('style')) {
          newHeader.removeAttribute('style')
        }
      }
    }

    return Html.toString(newHeader)
  }

  const handleCheckbox = () => {
    setRemoveStyling(!removeStyling)
  }

  const handleSelect = (value) => {
    setSelectedValue(value)
  }

  const handleSubmit = () => {
    handleIssueSave(activeIssue)
  }

  return (
    <>
      <label className="instructions" htmlFor="heading-select">{t('form.heading_style.label.select')}</label>
      <select
        id="heading-select"
        name="heading-select"
        className="w-100 mt-2"
        value={selectedValue}
        tabindex="0"
        onChange={(e) => handleSelect(e.target.value)}
        disabled={isDisabled}>
          <option key='empty' id='opt-empty' value=''>
            {t('form.heading_style.label.none_selected')}
          </option>
          {selectOptions.map((opt, index) => (
            <option key={index} id={`opt-${index}`} value={opt}>
              {opt}
            </option>
          ))}
      </select>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="removeStylingCheckbox"
          name="removeStylingCheckbox"
          checked={removeStyling}
          tabindex="0"
          disabled={isDisabled}
          onChange={handleCheckbox} />
        <label htmlFor="removeStylingCheckbox" className="instructions">{t('form.heading_style.label.remove_styling')}</label>
      </div>
      <div className="flex-row justify-content-start mt-3 mb-3">
        <button
          className="btn btn-primary"
          disabled={isDisabled}
          tabindex="0"
          onClick={handleSubmit}>
          {t('form.submit')}
        </button>
      </div>
    </>
  )
}