import React, { act, useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import ToggleSwitch from '../Widgets/ToggleSwitch'
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
    REMOVE_LANGUAGE: UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
  }
  const [language, setLanguage] = useState("")
  const [textInputBCP47, setTextInputBCP47] = useState('')
  const [manualEntry, setManualEntry] = useState(false)
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
    
    const fixed = activeIssue.newHtml && activeIssue.status > 0;
    let startingOption = ''
    let tempManualEntry = false

    if (fixed) {
      if (langOption !== '') {
        startingOption = FORM_OPTIONS.SELECT_LANGUAGE
      }
      else if (rawLanguage !== '') {
        startingOption = FORM_OPTIONS.SELECT_LANGUAGE
        tempManualEntry = true
      }
      else if (!hasLangAttr && !tempIsHtml) {
        startingOption = FORM_OPTIONS.REMOVE_LANGUAGE
      }
    }
    setActiveOption(startingOption)
    setManualEntry(tempManualEntry)

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, language, manualEntry, textInputBCP47])

  const updateHtmlContent = () => {
    let issue = activeIssue

    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)

    if(activeOption === FORM_OPTIONS.REMOVE_LANGUAGE){ 
      element = Html.removeAttribute(element, "lang")
    }
    else if(activeOption === FORM_OPTIONS.SELECT_LANGUAGE){
      if (manualEntry) { 
        element = Html.setAttribute(element, "lang", textInputBCP47)
      }
      else {
        element = Html.setAttribute(element, "lang", language)
      }
    }

    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.SELECT_LANGUAGE]: [],
      [FORM_OPTIONS.REMOVE_LANGUAGE]: []
    }

    if(activeOption === FORM_OPTIONS.SELECT_LANGUAGE) {
      if (manualEntry) {
        if(!validBCP47()){ 
          tempErrors[FORM_OPTIONS.SELECT_LANGUAGE].push({text: t('form.language.error.invalidBCP'), type: "error"})
        }
      }
      else {
        if(!primaryLanguages[language]){ 
          tempErrors[FORM_OPTIONS.SELECT_LANGUAGE].push({text: t(`form.language.error.invalidLang`), type: "error"})
        }
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
          labelText = {t(`form.language.decision.language`)}
        />
        { activeOption === FORM_OPTIONS.SELECT_LANGUAGE && (
          <>
            <div className="instructions mb-2">{t(`form.language.label.select_language`)} </div>
            <Combobox 
              isDisabled={isDisabled || manualEntry} 
              handleChange={handleComboboxSelect} 
              id='language-select'
              label=''
              options={selectOptions} 
            />

            <label>
              <ToggleSwitch
                initialValue={manualEntry}
                updateToggle={setManualEntry}
                disabled={isDisabled}
              />
              <div>{t(`form.language.label.useBCP`)}</div>
            </label>

            { manualEntry && (
              <>
                <input
                  aria-labelledby="add-text-label"
                  type="text"
                  tabIndex="0"
                  id="altTextInput"
                  name="altTextInput"
                  className="w-100 mt-2"
                  value={textInputBCP47}
                  disabled={isDisabled}
                  onChange={handleInput}
                  placeholder={t('form.language.label.BCP_placeholder')}
                />
              </>
            )}

            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.SELECT_LANGUAGE]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Remove lang attribute. ONLY when not on the HTML tag. ID: "REMOVE_LANGUAGE" */}
      {!isHtml && (
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_LANGUAGE ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={setActiveOption}
            option={FORM_OPTIONS.REMOVE_LANGUAGE}
            labelText = {t(`form.language.decision.no_language`)}
          />
        </div>
      )}
    </>
  )
}