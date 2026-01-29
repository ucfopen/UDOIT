import React, { act, useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import Combobox from '../Widgets/Combobox'
import { validPrimaryLangs } from '../../Services/Lang'
import * as Html from '../../Services/Html'

export default function LanguageForm ({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
}) {

  const FORM_OPTIONS = {
    SELECT_LANGUAGE: settings.UFIXIT_OPTIONS.SELECT_LANGUAGE,
    ENTER_BCP47: settings.UFIXIT_OPTIONS.ADD_TEXT,
    REMOVE_LANGUAGE: settings.UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }
  const [language, setLanguage] = useState("")
  const [textInputBCP47, setTextInputBCP47] = useState('')
  const [selectOptions, setSelectOptions] = useState([])

  // This is a special trigger in the case we are dealing with a page where the lang attribute can be found in it's <html> tag
  const [isHtml, setIsHtml] = useState(false); 

  const primaryLanguages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ru': 'Russian',
      'ar': 'Arabic',
      'hi': 'Hindi',

      'ab':  'Abkhazian',
      'aa':  'Afar',
      'af':  'Afrikaans',
      'ak':  'Akan',
      'sq':  'Albanian',
      'am':  'Amharic',
      'an':  'Aragonese',
      'hy':  'Armenian',
      'as':  'Assamese',
      'av':  'Avaric',
      'ae':  'Avestan',
      'ay':  'Aymara',
      'az':  'Azerbaijani',
      'bm':  'Bambara',
      'ba':  'Bashkir',
      'eu':  'Basque',
      'be':  'Belarusian',
      'bn':  'Bengali',
      'bh':  'Bihari',
      'bi':  'Bislama',
      'bs':  'Bosnian',
      'br':  'Breton',
      'bg':  'Bulgarian',
      'my':  'Burmese',
      'ca':  'Catalan',
      'ch':  'Chamorro',
      'ce':  'Chechen',
      'ny':  'Chichewa',
      'cu':  'Church Slavic',
      'cv':  'Chuvash',
      'kw':  'Cornish',
      'co':  'Corsican',
      'cr':  'Cree',
      'hr':  'Croatian',
      'cs':  'Czech',
      'da':  'Danish',
      'dv':  'Divehi',
      'nl':  'Dutch',
      'dz':  'Dzongkha',
      'eo':  'Esperanto',
      'et':  'Estonian',
      'ee':  'Ewe',
      'fo':  'Faroese',
      'fj':  'Fijian',
      'fi':  'Finnish',
      'ff':  'Fulah',
      'gl':  'Galician',
      'lg':  'Ganda',
      'ka':  'Georgian',
      'el':  'Greek',
      'gn':  'Guarani',
      'gu':  'Gujarati',
      'ht':  'Haitian',
      'ha':  'Hausa',
      'he':  'Hebrew',
      'iw':  'Hebrew',
      'hz':  'Herero',
      'ho':  'Hiri Motu',
      'hu':  'Hungarian',
      'is':  'Icelandic',
      'io':  'Ido',
      'ig':  'Igbo',
      'id':  'Indonesian',
      'ia':  'Interlingua',
      'ie':  'Interlingue',
      'iu':  'Inuktitut',
      'ik':  'Inupiaq',
      'ga':  'Irish',
      'jv':  'Javanese',
      'jw':  'Javanese',
      'kl':  'Kalaallisut',
      'kn':  'Kannada',
      'kr':  'Kanuri',
      'ks':  'Kashmiri',
      'kk':  'Kazakh',
      'km':  'Khmer',
      'ki':  'Kikuyu',
      'rw':  'Kinyarwanda',
      'ky':  'Kirghiz',
      'kv':  'Komi',
      'kg':  'Kongo',
      'ko':  'Korean',
      'kj':  'Kuanyama',
      'ku':  'Kurdish',
      'lo':  'Lao',
      'la':  'Latin',
      'lv':  'Latvian',
      'li':  'Limburgan',
      'ln':  'Lingala',
      'lt':  'Lithuanian',
      'lu':  'Luba-Katanga',
      'lb':  'Luxembourgish',
      'mk':  'Macedonian',
      'mg':  'Malagasy',
      'ms':  'Malay',
      'ml':  'Malayalam',
      'mt':  'Maltese',
      'gv':  'Manx',
      'mi':  'Maori',
      'mr':  'Marathi',
      'mh':  'Marshallese',
      'mo':  'Moldavian',
      'mn':  'Mongolian',
      'na':  'Nauru',
      'nv':  'Navajo',
      'ng':  'Ndonga',
      'ne':  'Nepali',
      'nd':  'North Ndebele',
      'se':  'Northern Sami',
      'nb':  'Norwegian Bokmål',
      'nn':  'Norwegian Nynorsk',
      'no':  'Norwegian',
      'oc':  'Occitan',
      'oj':  'Ojibwa',
      'or':  'Oriya',
      'om':  'Oromo',
      'os':  'Ossetian',
      'pi':  'Pali',
      'ps':  'Pashto',
      'fa':  'Persian',
      'pl':  'Polish',
      'pa':  'Punjabi',
      'qu':  'Quechua',
      'ro':  'Romanian',
      'rm':  'Romansh',
      'rn':  'Rundi',
      'sm':  'Samoan',
      'sg':  'Sango',
      'sa':  'Sanskrit',
      'sc':  'Sardinian',
      'gd':  'Scottish Gaelic',
      'sr':  'Serbian',
      'sh':  'Serbo-Croatian',
      'sn':  'Shona',
      'ii':  'Sichuan Yi',
      'sd':  'Sindhi',
      'si':  'Sinhala',
      'sk':  'Slovak',
      'sl':  'Slovenian',
      'so':  'Somali',
      'nr':  'South Ndebele',
      'st':  'Southern Sotho',
      'su':  'Sundanese',
      'sw':  'Swahili',
      'ss':  'Swati',
      'sv':  'Swedish',
      'tl':  'Tagalog',
      'tl':  'Tagalog',
      'ty':  'Tahitian',
      'ty':  'Tahitian',
      'tg':  'Tajik',
      'ta':  'Tamil',
      'tt':  'Tatar',
      'tt':  'Tatar',
      'te':  'Telugu',
      'th':  'Thai',
      'bo':  'Tibetan',
      'ti':  'Tigrinya',
      'to':  'Tonga',
      'to':  'Tonga',
      'ts':  'Tsonga',
      'ts':  'Tsonga',
      'tn':  'Tswana',
      'tn':  'Tswana',
      'tr':  'Turkish',
      'tr':  'Turkish',
      'tk':  'Turkmen',
      'tw':  'Twi',
      'tw':  'Twi',
      'ug':  'Uighur',
      'ug':  'Uighur',
      'uk':  'Ukrainian',
      'uk':  'Ukrainian',
      'ur':  'Urdu',
      'ur':  'Urdu',
      'uz':  'Uzbek',
      'uz':  'Uzbek',
      've':  'Venda',
      've':  'Venda',
      'vi':  'Vietnamese',
      'vi':  'Vietnamese',
      'vo':  'Volapük',
      'vo':  'Volapük',
      'wa':  'Walloon',
      'wa':  'Walloon',
      'cy':  'Welsh',
      'fy':  'Western Frisian',
      'wo':  'Wolof',
      'wo':  'Wolof',
      'xh':  'Xhosa',
      'xh':  'Xhosa',
      'ji':  'Yiddish',
      'yi':  'Yiddish',
      'yi':  'Yiddish',
      'yo':  'Yoruba',
      'yo':  'Yoruba',
      'za':  'Zhuang',
      'za':  'Zhuang',
      'zu':  'Zulu'
  }

  // Returns an array of language options that is used by the combobox
  // selectedLang is a string that can either be an empty string or one of the abberiviated languages and indicates which language is selected
  const constructOptions = (selectedLang) => {
    let tempOptions = []
    tempOptions.push({
      value: "",
      name: `${t(`form.language.label.none_selected`)}`,
      selected: selectedLang === ''
    })
    for(const key in primaryLanguages){
      tempOptions.push({
        value: key,
        name: primaryLanguages[key],
        selected: selectedLang === key
      })
    }
    return tempOptions
  }

  useEffect(() => {
    if(!activeIssue){
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    const tagName = Html.getTagName(html)
    const hasLangAttr = Html.hasAttribute(html, "lang")
    let rawLanguage = Html.getAttribute(html, "lang")
    rawLanguage = (typeof rawLanguage === 'string') ? rawLanguage : ''
    const langOption = (rawLanguage in primaryLanguages) ? rawLanguage : '' 
    let tempOptions = constructOptions(langOption)
    let tempIsHtml = (activeIssue.scanRuleId !== "element_lang_valid" || tagName === "HTML")
    
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (langOption !== '') {
      setActiveOption(FORM_OPTIONS.SELECT_LANGUAGE)
    }
    else if (activeIssue.status !== 0 && rawLanguage !== '') {
      setActiveOption(FORM_OPTIONS.ENTER_BCP47)
    }
    else if (!hasLangAttr && !tempIsHtml) {
      setActiveOption(FORM_OPTIONS.REMOVE_LANGUAGE)
    }
    else {
      setActiveOption('')
    }

    setSelectOptions(tempOptions)
    setLanguage(langOption)
    setTextInputBCP47(rawLanguage)
    setIsHtml(tempIsHtml)

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [language, textInputBCP47, activeOption])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

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

    const tempSelectOptions = constructOptions(value)
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
          labelId = 'combo-label-heading-select'
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
              settings={settings}
            />
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.SELECT_LANGUAGE]} />
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
              onChange={handleInput} />
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.ENTER_BCP47]} />
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