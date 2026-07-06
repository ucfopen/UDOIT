import React, { act, useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import Combobox from '../Widgets/Combobox'
import { primaryLanguages, validPrimaryLangs } from '../../Services/Lang'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function LanguageForm ({
  t,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
}) {

  const FORM_OPTIONS = {
    SELECT_LANGUAGE: UFIXIT_OPTIONS.SELECT_ATTRIBUTE_VALUE,
    ENTER_BCP47: UFIXIT_OPTIONS.ADD_TEXT,
    REMOVE_LANGUAGE: UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    MARK_AS_REVIEWED: UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }
  const [language, setLanguage] = useState("")
  const [textInputBCP47, setTextInputBCP47] = useState('')
  const [selectOptions, setSelectOptions] = useState([])

  // This is a special trigger in the case we are dealing with a page where the lang attribute can be found in it's <html> tag
  const [isHtml, setIsHtml] = useState(false); 

  // Returns an array of language options that is used by the combobox
  // selectedLang is a string that can either be an empty string or one of the abberiviated languages and indicates which language is selected
  const computeSelectOptions = (currentSelection) => {
    let tempOptions = []
    tempOptions.push({
      value: "",
      name: `${t(`form.language.label.none_selected`)}`,
      selected: currentSelection === ''
    })
    for(const key in primaryLanguages){
      tempOptions.push({
        value: key,
        name: primaryLanguages[key],
        selected: currentSelection === key
      })
    }
    return tempOptions
  }

  useEffect(() => {
    if(!activeIssue){
      return
    }

    const attributeName = "lang"

    const html = Html.getIssueHtml(activeIssue)
    const tagName = Html.getTagName(html)
    const hasLangAttr = Html.hasAttribute(html, attributeName)
    let rawLanguage = Html.getAttribute(html, attributeName)
    rawLanguage = (typeof rawLanguage === 'string') ? rawLanguage : ''
    const langOption = (rawLanguage in primaryLanguages) ? rawLanguage : '' 
    let tempOptions = computeSelectOptions(langOption)
    let tempIsHtml = (activeIssue.scanRuleId !== "element_lang_valid" || tagName === "HTML")
    setSelectOptions(tempOptions)
    setLanguage(langOption)
    setTextInputBCP47(rawLanguage)
    setIsHtml(tempIsHtml)
    
    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)
    let startingOption = ''

    if (reviewed) {
      startingOption = FORM_OPTIONS.MARK_AS_REVIEWED
    }
    if (fixed) {
      if (langOption !== '') {
        startingOption = FORM_OPTIONS.SELECT_LANGUAGE
      }
      else if (rawLanguage !== '') {
        startingOption = FORM_OPTIONS.ENTER_BCP47
      }
      else if (!hasLangAttr && !tempIsHtml) {
        startingOption = FORM_OPTIONS.REMOVE_LANGUAGE
      }
    }
    setActiveOption(startingOption)

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, language, textInputBCP47])

  const updateHtmlContent = () => {
    let issue = activeIssue

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)

    if(activeOption === FORM_OPTIONS.REMOVE_LANGUAGE){ 
      element = Html.removeAttribute(element, "lang")
    }
    else if(activeOption === FORM_OPTIONS.SELECT_LANGUAGE){
      element = Html.setAttribute(element, "lang", language)
    }
    else if(activeOption === FORM_OPTIONS.ENTER_BCP47){ 
      element = Html.setAttribute(element, "lang", textInputBCP47)
    }

    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.SELECT_LANGUAGE]: [],
      [FORM_OPTIONS.ENTER_BCP47]: [],
      [FORM_OPTIONS.REMOVE_LANGUAGE]: []
    }

    if(activeOption === FORM_OPTIONS.SELECT_LANGUAGE) {
      if(!primaryLanguages[language]){ 
        tempErrors[FORM_OPTIONS.SELECT_LANGUAGE].push({text: t(`form.language.error.invalidLang`), type: "error"})
      }
    }
    if(activeOption === FORM_OPTIONS.ENTER_BCP47) {
      if(!validBCP47()){ 
        tempErrors[FORM_OPTIONS.ENTER_BCP47].push({text: t('form.language.error.invalidBCP'), type: "error"})
      }
    }

    setFormErrors(tempErrors)
  }

  const validBCP47 = () => {
    if(textInputBCP47 == ""){
        return false
    }

    let primary = textInputBCP47.toLowerCase();
    if (primary.includes("-")) {
        primary = primary.split("-")[0];
    }

    if (!primary.match(/[a-z]{2,3}/)) return false;

    // qaa..qtz custom language check
    if (primary.length === 3 
        && primary.charAt(0) === "q"
        && primary.charCodeAt(1) >= 97 && primary.charCodeAt(1) <= 116
        && primary.charCodeAt(2) >= 97 && primary.charCodeAt(2) <= 122) {
            return true;
    }

    // Checks to make sure language is valid
    let validPrimaryLangCheck = validPrimaryLangs[primary.charCodeAt(0)-97].includes(primary);

    // Checks it follows BCP47 regex
    return validPrimaryLangCheck && /^(([a-zA-Z]{2,3}(-[a-zA-Z](-[a-zA-Z]{3}){0,2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-([0-9a-zA-Z]{5,8}|[0-9][a-zA-Z]{3}))*(-[0-9a-wy-zA-WY-Z](-[a-zA-Z0-9]{2,8})+)*(-x(-[a-zA-Z0-9]{1,8})+)?|x(-[a-zA-Z0-9]{1,8})+|(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE|art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))$/.test(textInputBCP47)
  }

  const handleComboboxSelect = (id, value) => {
    setLanguage(value)

    const tempSelectOptions = computeSelectOptions(value)
    setSelectOptions(tempSelectOptions)
  }

  const handleInput = (event) => {
    setTextInputBCP47(event.target.value)
  }

  return (
    <>
      {/* OPTION 1: Select language. ID: "SELECT_LANGUAGE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.SELECT_LANGUAGE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.SELECT_LANGUAGE}
          labelId = 'combo-label-language-select'
          labelText = {t(`form.language.label.select_language`)} 
        />
        {activeOption === FORM_OPTIONS.SELECT_LANGUAGE && (
          <>
            <Combobox 
              isDisabled={isDisabled} 
              handleChange={handleComboboxSelect} 
              id='language-select'
              label=''
              options={selectOptions} 
            />
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.SELECT_LANGUAGE]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Enter BCP47. ID: "ENTER_BCP47" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.ENTER_BCP47 ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.ENTER_BCP47}
          labelId = 'add-text-label'
          labelText = {t(`form.language.label.useBCP`)}
        />

        {activeOption === FORM_OPTIONS.ENTER_BCP47 && (
          <>
            <input
              aria-labelledby="add-text-label"
              type="text"
              tabIndex="0"
              id="altTextInput"
              name="altTextInput"
              className="w-100"
              value={textInputBCP47}
              disabled={isDisabled}
              onChange={handleInput}
            />
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.ENTER_BCP47]}
            />
          </>
        )}
      </div>

      {/* OPTION 3: Remove lang attribute. ONLY when not on the HTML tag. ID: "REMOVE_LANGUAGE" */}
      {!isHtml && (
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_LANGUAGE ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={setActiveOption}
            option={FORM_OPTIONS.REMOVE_LANGUAGE}
            labelText = {t(`form.language.label.remove`)}
          />
        </div>
      )}

      {/* OPTION 4: Mark as Reviewed. ID: "mark-as-reviewed" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('fix.label.no_changes')}
        />
      </div>
    </>
  )
}