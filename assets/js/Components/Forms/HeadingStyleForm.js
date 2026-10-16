import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import Combobox from '../Widgets/Combobox'
import ToggleSwitch from '../Widgets/ToggleSwitch'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function HeadingStyleForm ({
  t,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {

  const styleTags = ["strong", "b", "i", "em", "mark", "small", "del", "ins", "sub", "sup"]
  const tagOptions = ["H2", "H3", "H4", "H5", "H6"]
  const allHeadings = ["H1", "H2", "H3", "H4", "H5", "H6", "h1", "h2", "h3", "h4", "h5", "h6"]
  const FORM_OPTIONS = {
    SELECT_LEVEL: UFIXIT_OPTIONS.SELECT_TAG,
    MARK_AS_REVIEWED: UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }
  
  const [selectOptions, setSelectOptions] = useState([])
  const [selectedValue, setSelectedValue] = useState('')
  const [hasStyling, setHasStyling] = useState(false)
  const [removeStyling, setRemoveStyling] = useState(false)

  const STYLE_ATTRIBUTES = ['color:', 'background:', 'background-color:', 'font-size:', 'font-weight:', 'font-style:', 'text-decoration:', 'text-transform:']
  const CHILD_TAGS = ['span', 'div', 'p', 'strong', 'em', 'b', 'i', 'u']
  const STYLE_TAGS = ['strong', 'b', 'em', 'i', 'del', 's', 'u', 'mark']

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    const hasStyleAttributes = Html.elementOrChildrenHasStyleAttributes(element, STYLE_ATTRIBUTES, CHILD_TAGS)
    const hasStyleTags = (element.querySelectorAll((STYLE_TAGS.join(','))).length > 0);
    const hasStyle = hasStyleAttributes || hasStyleTags;
    const tagName = Html.getTagName(element)?.toUpperCase()
    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)
    let startingOption = ''
    
    const tagSelection = tagOptions.includes(tagName) ? tagName : ''
    const tempSelectOptions = computeSelectOptions(tagSelection)

    if (fixed || reviewed) {
      if (tagOptions.includes(tagName)) {
        startingOption = FORM_OPTIONS.SELECT_LEVEL;
      }
      else {
        startingOption = FORM_OPTIONS.MARK_AS_REVIEWED;
      }
    }
    setActiveOption(startingOption);

    setSelectOptions(tempSelectOptions)
    setSelectedValue(tagSelection)
    setHasStyling(hasStyle)
    setRemoveStyling(!hasStyle)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, selectedValue, removeStyling])

  const updateHtmlContent = () => {
    let issue = activeIssue

    if (activeOption === '') {
      handleActiveIssue(issue);
      return;
    }

    let newHeader
    const element = Html.toElement(issue.initialHtml)

    if (activeOption === FORM_OPTIONS.SELECT_LEVEL) {
      if (selectedValue !== '') {
        newHeader = document.createElement(selectedValue);
        newHeader.innerHTML = element.innerHTML;
      }
      else {
        newHeader = element;
      }
    }

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      if (allHeadings.includes(element.tagName)) {
        newHeader = document.createElement('p');
        newHeader.innerHTML = element.innerHTML;
      }
      else {
        newHeader = element;
      }
    }

    if (newHeader && (activeOption === FORM_OPTIONS.SELECT_LEVEL || removeStyling)) {
      newHeader = Html.removeStyleAttributesFromElementAndChildren(newHeader, STYLE_ATTRIBUTES, CHILD_TAGS);
      newHeader = Html.removeStyleTags(newHeader, STYLE_TAGS);
    }

    issue.newHtml =  Html.toString(newHeader)

    handleActiveIssue(issue)
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
    
    if (activeOption === FORM_OPTIONS.SELECT_LEVEL) {
      if(selectedValue === '') {
        tempErrors[FORM_OPTIONS.SELECT_LEVEL].push({ text: t('form.heading_style.msg.level_select'), type: 'error' });
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
      {/* OPTION 1: Select heading level. ID: "SELECT_LEVEL" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.SELECT_LEVEL ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.SELECT_LEVEL}
          labelId = 'combo-label-heading-select'
          labelText = {t('form.heading_style.decision.heading')}
        />
        {activeOption === FORM_OPTIONS.SELECT_LEVEL && (
          <>
            <div className="instructions mb-2" id="combo-label-heading-select">{t('form.heading_style.label.select')}</div>
            <Combobox
              handleChange={handleComboboxSelect}
              id='heading-select'
              isDisabled={isDisabled}
              label=''
              options={selectOptions}
            />
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.SELECT_LEVEL]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('form.heading_style.decision.content')}
        />
        {activeOption === FORM_OPTIONS.MARK_AS_REVIEWED && (
          <>
            { hasStyling && (
              <div className="flex-row justify-content-start gap-1 mt-3">
                <ToggleSwitch
                  labelId="removeStylingCheckbox"
                  initialValue={removeStyling}
                  updateToggle={setRemoveStyling}
                  disabled={isDisabled}
                  small={true}
                />
                <label htmlFor="removeStylingCheckbox" className="ufixit-instructions">{t('form.heading_style.label.remove_styling')}</label>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}