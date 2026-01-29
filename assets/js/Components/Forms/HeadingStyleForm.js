import React, { useState, useEffect } from 'react'
import OptionFeedback from '../Widgets/OptionFeedback'
import Combobox from '../Widgets/Combobox'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Html from '../../Services/Html'

export default function HeadingStyleForm ({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid
 }) {

  const styleTags = ["strong", "b", "i", "em", "mark", "small", "del", "ins", "sub", "sup"]
  const tagOptions = ["H2", "H3", "H4", "H5", "H6"]
  const allHeadings = ["H1", "H2", "H3", "H4", "H5", "H6", "h1", "h2", "h3", "h4", "h5", "h6"]
  const FORM_OPTIONS = {
    SELECT_LEVEL: 'select-level',
    MARK_AS_REVIEWED: 'mark-as-reviewed'
  }
  
  const [activeOption, setActiveOption] = useState('')
  const [selectOptions, setSelectOptions] = useState([])
  const [selectedValue, setSelectedValue] = useState('')
  const [hasStyling, setHasStyling] = useState(false)
  const [removeStyling, setRemoveStyling] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  const STYLE_ATTRIBUTES = ['color:', 'background:', 'background-color:', 'font-size:', 'font-weight:', 'font-style:', 'text-decoration:', 'text-transform:']
  const CHILD_TAGS = ['span', 'div', 'p', 'strong', 'em', 'b', 'i', 'u']

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    const hasStyle = Html.elementOrChildrenHasStyleAttributes(element, STYLE_ATTRIBUTES, CHILD_TAGS)
    const tagName = Html.getTagName(element).toUpperCase()
    
    const tagSelection = tagOptions.includes(tagName) ? tagName : ''
    let tempSelectOptions = computeSelectOptions(tagSelection)

    if (activeIssue.status === 1 || activeIssue.status === 3) {
      setActiveOption(FORM_OPTIONS.SELECT_LEVEL)
    }
    else if (markAsReviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else {
      setActiveOption('')
    }

    setSelectOptions(tempSelectOptions)
    setSelectedValue(tagSelection)
    setHasStyling(hasStyle)
    setRemoveStyling(!hasStyle)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [selectedValue, removeStyling, markAsReviewed])

  useEffect(() => {
    let invalid = false
    if(!markAsReviewed) {
      Object.keys(formErrors).forEach(optionKey => {
        if(formErrors[optionKey].length > 0) {
          invalid = true
        }
      })
    }
    setFormInvalid(invalid)
  }, [formErrors, markAsReviewed])

  const handleOptionChange = (option) => {
    setActiveOption(option)

    if (option === FORM_OPTIONS.SELECT_LEVEL) {
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_AS_REVIEWED) {
      setMarkAsReviewed(true)
    }
  }

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    issue.newHtml = processHtml(issue.initialHtml)
    handleActiveIssue(issue)
  }
  
  const processHtml = (html) => {
    let newHeader
    const element = Html.toElement(html)

    if (selectedValue) {
      newHeader = document.createElement(selectedValue)
      newHeader.innerHTML = element.innerHTML
    }
    else {
      newHeader = Html.toElement(activeIssue.sourceHtml)

      if(allHeadings.includes(newHeader.tagName)) {
        const innerHtml = newHeader.innerHTML
        newHeader = document.createElement('p')
        newHeader.innerHTML = innerHtml
      }
    }

    if (removeStyling) {
      Html.removeStyleAttributesFromElementAndChildren(newHeader, STYLE_ATTRIBUTES, CHILD_TAGS)
    }

    return Html.toString(newHeader)
  }

  const computeSelectOptions = (currentSelection) => {
    let tempSelectOptions = [
      { value: '', name: t('form.heading_style.label.none_selected'), selected: currentSelection === '' }
    ]
    tagOptions.forEach(tag => {
      tempSelectOptions.push({
        value: tag,
        name: tag,
        selected: tag === currentSelection
      })
    })
    return tempSelectOptions
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.SELECT_LEVEL]: [],
    }
    
    if (!markAsReviewed) {
      // If the error type is "heading_markup_misuse", then we WANT the heading to be removed.
      if(activeIssue.scanRuleId === 'heading_markup_misuse' && selectedValue !== '') {
        tempErrors[FORM_OPTIONS.SELECT_LEVEL].push({ text: t('form.heading_style.msg.level_remove'), type: 'error' })
      }
      // If the error type is "text_block_heading", then we WANT a heading to be selected.
      if(activeIssue.scanRuleId === 'text_block_heading' && selectedValue === '') {
        tempErrors[FORM_OPTIONS.SELECT_LEVEL].push({ text: t('form.heading_style.msg.level_select'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleComboboxSelect = (id, value) => {
    setSelectedValue(value)

    // This recomputes the select options to update which one is marked as selected
    // That way if the user switches between options, the one they previously chose remains selected
    const tempSelectOptions = computeSelectOptions(value)
    setSelectOptions(tempSelectOptions)
  }

  return (
    <>
      {/* OPTION 1: Select heading level. ID: "select-level" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.SELECT_LEVEL ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')} id='combo-label-heading-select'>
          <input
            type="radio"
            id={FORM_OPTIONS.SELECT_LEVEL}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.SELECT_LEVEL}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.SELECT_LEVEL)
            }} />
          {t('form.heading_style.label.select')}
        </label>
        {activeOption === FORM_OPTIONS.SELECT_LEVEL && (
          <>
            <Combobox
              handleChange={handleComboboxSelect}
              id='heading-select'
              isDisabled={isDisabled}
              label=''
              options={selectOptions}
              settings={settings}
            />
            { hasStyling && (
              <div className="flex-row justify-content-start gap-1 mt-3">
                <ToggleSwitch
                  labelId="removeStylingCheckbox"
                  initialValue={removeStyling}
                  updateToggle={setRemoveStyling}
                  disabled={isDisabled}
                  small={true} />
                <label htmlFor="removeStylingCheckbox" className="ufixit-instructions">{t('form.heading_style.label.remove_styling')}</label>
              </div>
            )}
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.SELECT_LEVEL]} />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Reviewed. ID: "mark-as-reviewed" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.MARK_AS_REVIEWED}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.MARK_AS_REVIEWED}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.MARK_AS_REVIEWED)
            }} />
          {t('fix.label.no_changes')}
        </label>
      </div>
    </>
  )
}