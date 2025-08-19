import React, { useState, useEffect } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import * as Text from '../../Services/Text'

export default function LanguageForm ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
 }) {

  // As of 2025-07-15, this is the list of officially accepted primary languages from:
  // https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
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

    'aa': 'Afar',
    'ab': 'Abkhazian',
    'ae': 'Avestan',
    'af': 'Afrikaans',
    'ak': 'Akan',
    'am': 'Amharic',
    'an': 'Aragonese',
    // 'ar': 'Arabic',     // Included in the short list above
    'as': 'Assamese',
    'av': 'Avaric',
    'ay': 'Aymara',
    'az': 'Azerbaijani',
    'ba': 'Bashkir',
    'be': 'Belarusian',
    'bg': 'Bulgarian',
    'bh': 'Bihari',
    'bi': 'Bislama',
    'bm': 'Bambara',
    'bn': 'Bengali',
    'bo': 'Tibetan',
    'br': 'Breton',
    'bs': 'Bosnian',
    'ca': 'Catalan',
    'ce': 'Chechen',
    'ch': 'Chamorro',
    'co': 'Corsican',
    'cr': 'Cree',
    'cs': 'Czech',
    'cu': 'Church Slavic',
    'cv': 'Chuvash',
    'cy': 'Welsh',
    'da': 'Danish',
    // 'de': 'German',     // Included in the short list above
    'dv': 'Divehi',
    'dz': 'Dzongkha',
    'ee': 'Ewe',
    'el': 'Greek',
    // 'en': 'English',    // Included in the short list above
    'eo': 'Esperanto',
    // 'es': 'Spanish',    // Included in the short list above
    'et': 'Estonian',
    'eu': 'Basque',
    'fa': 'Persian',
    'ff': 'Fulah',
    'fi': 'Finnish',
    'fj': 'Fijian',
    'fo': 'Faroese',
    // 'fr': 'French',     // Included in the short list above
    'fy': 'Western Frisian',
    'ga': 'Irish',
    'gd': 'Scottish Gaelic',
    'gl': 'Galician',
    'gn': 'Guarani',
    'gu': 'Gujarati',
    'gv': 'Manx',
    'ha': 'Hausa',
    'he': 'Hebrew',
    // 'hi': 'Hindi',      // Included in the short list above
    'ho': 'Hiri Motu',
    'hr': 'Croatian',
    'ht': 'Haitian',
    'hu': 'Hungarian',
    'hy': 'Armenian',
    'hz': 'Herero',
    'ia': 'Interlingua',
    'id': 'Indonesian',
    'ie': 'Interlingue',
    'ig': 'Igbo',
    'ii': 'Sichuan Yi',
    'ik': 'Inupiaq',
    'io': 'Ido',
    'is': 'Icelandic',
    // 'it': 'Italian',    // Included in the short list above
    'iu': 'Inuktitut',
    'iw': 'Hebrew',
    // 'ja': 'Japanese',   // Included in the short list above
    'ji': 'Yiddish',
    'jv': 'Javanese',
    'jw': 'Javanese',
    'ka': 'Georgian',
    'kg': 'Kongo',
    'ki': 'Kikuyu',
    'kj': 'Kuanyama',
    'kk': 'Kazakh',
    'kl': 'Kalaallisut',
    'km': 'Khmer',
    'kn': 'Kannada',
    'ko': 'Korean',
    'kr': 'Kanuri',
    'ks': 'Kashmiri',
    'ku': 'Kurdish',
    'kv': 'Komi',
    'kw': 'Cornish',
    'ky': 'Kirghiz',
    'la': 'Latin',
    'lb': 'Luxembourgish',
    'lg': 'Ganda',
    'li': 'Limburgan',
    'ln': 'Lingala',
    'lo': 'Lao',
    'lt': 'Lithuanian',
    'lu': 'Luba-Katanga',
    'lv': 'Latvian',
    'mg': 'Malagasy',
    'mh': 'Marshallese',
    'mi': 'Maori',
    'mk': 'Macedonian',
    'ml': 'Malayalam',
    'mn': 'Mongolian',
    'mo': 'Moldavian',
    'mr': 'Marathi',
    'ms': 'Malay',
    'mt': 'Maltese',
    'my': 'Burmese',
    'na': 'Nauru',
    'nb': 'Norwegian Bokmål',
    'nd': 'North Ndebele',
    'ne': 'Nepali',
    'ng': 'Ndonga',
    'nl': 'Dutch',
    'nn': 'Norwegian Nynorsk',
    'no': 'Norwegian',
    'nr': 'South Ndebele',
    'nv': 'Navajo',
    'ny': 'Chichewa',
    'oc': 'Occitan',
    'oj': 'Ojibwa',
    'om': 'Oromo',
    'or': 'Oriya',
    'os': 'Ossetian',
    'pa': 'Punjabi',
    'pi': 'Pali',
    'pl': 'Polish',
    'ps': 'Pashto',
    // 'pt': 'Portuguese', // Included in the short list above
    'qu': 'Quechua',
    'rm': 'Romansh',
    'rn': 'Rundi',
    'ro': 'Romanian',
    // 'ru': 'Russian',    // Included in the short list above
    'rw': 'Kinyarwanda',
    'sa': 'Sanskrit',
    'sc': 'Sardinian',
    'sd': 'Sindhi',
    'se': 'Northern Sami',
    'sg': 'Sango',
    'sh': 'Serbo-Croatian',
    'si': 'Sinhala',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'sm': 'Samoan',
    'sn': 'Shona',
    'so': 'Somali',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'ss': 'Swati',
    'st': 'Southern Sotho',
    'su': 'Sundanese',
    'sv': 'Swedish',
    'sw': 'Swahili',
    'ta': 'Tamil',
    'te': 'Telugu',
    'tg': 'Tajik',
    'th': 'Thai',
    'ti': 'Tigrinya',
    'tk': 'Turkmen',
    'tl': 'Tagalog',
    'tn': 'Tswana',
    'to': 'Tonga',
    'tr': 'Turkish',
    'ts': 'Tsonga',
    'tt': 'Tatar',
    'tw': 'Twi',
    'ty': 'Tahitian',
    'ug': 'Uighur',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek',
    've': 'Venda',
    'vi': 'Vietnamese',
    'vo': 'Volapük',
    'wa': 'Walloon',
    'wo': 'Wolof',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'za': 'Zhuang',
    // 'zh': 'Chinese',    // Included in the short list above
    'zu': 'Zulu'
  }

  const [textInputValue, setTextInputValue] = useState('')
  const [isToggleChecked, setIsToggleChecked] = useState(false)

  const [formErrors, setFormErrors] = useState([])


  // When a new active issue is set, update the form with the issue's relevant data.
  useEffect(() => {
    if (!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let exampleTitleAttribute = Html.getAttribute(html, 'title') || ''

    setTextInputValue(exampleTitleAttribute)
    setIsToggleChecked(exampleTitleAttribute !== '')

    checkFormErrors()
  }, [activeIssue])


  // Whenever ANY valid input changes, check for errors and update the issue's HTML.
  // If additional variables are added, they must be included in the dependency array.
  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [textInputValue, isToggleChecked, markAsReviewed])


  // In order to get the new HTML to update in the preview pane, we have to send it back
  // to the parent component via the handleActiveIssue function.
  // We also must set a flag (isModified) so we know the issue has been changed.
  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    // The easiest way to manipulate the HTML is to convert it to an element.
    // From there, we can update attributes and values.
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    if (isToggleChecked) {
      element = Html.setAttribute(element, "role", "presentation")
      element = Html.setAttribute(element, 'alt', '')
      element = Html.setAttribute(element, 'title', '')
    } else {
      element = Html.removeAttribute(element, "role")
      element = Html.setAttribute(element, "alt", textInputValue)
      element = Html.setAttribute(element, "title", textInputValue)
    }

    // Convert back to a string and sent it on its way!
    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
  }


  // Whenever the input changes, and on initial load, we need to check for errors.
  // These errors are sent to the FormSaveOrReview component to be displayed to the user.
  const checkFormErrors = () => {
    let tempErrors = []
    
    // If the "No Changes Needed" checkbox is checked, we don't need to check for input errors
    if (!markAsReviewed) {
      if(Text.isTextEmpty(textInputValue)){
        tempErrors.push({ text: t('form.template_save.msg.text_empty'), type: 'error' })
      }
      if(Text.isTextTooLong(textInputValue, maxTextLength)){
        tempErrors.push({ text: t('form.template_save.msg.text_too_long'), type: 'error' })
      }
      // Make any other checks you have their own custom functions and error messages.
      if(!isSufficient()) {
        tempErrors.push({ text: t('form.template_save.msg.text_is_not_sufficient'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }


  const isSufficient = () => {
    // This is a placeholder for any custom logic you want to implement.
    // You may need to compare multiple values or check against a set of rules.
    return true
  }


  const handleSubmit = () => {
    if (markAsReviewed || formErrors.length === 0) {
      handleIssueSave(activeIssue)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
  }

  const handleCheckbox = () => {
    setIsToggleChecked(!isToggleChecked)
  }

  return (
    <>
      <label htmlFor="templateInput" className="instructions">{t('form.template_save.label.text')}</label>
      <div className="w-100 mt-2">
        <input
          type="text"
          tabIndex="0"
          id="templateInput"
          name="templateInput"
          className="w-100"
          value={textInputValue}
          disabled={isDisabled || isToggleChecked}
          onChange={handleInput} />
      </div>
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="templateCheckbox"
          name="templateCheckbox"
          tabIndex="0"
          disabled={isDisabled}
          checked={isToggleChecked}
          onChange={handleCheckbox} />
        <label htmlFor="templateCheckbox" className="instructions">{t('form.template_save.label.mark_decorative')}</label>
      </div>
      <FormSaveOrReview
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={formErrors}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed} />
    </>
  )
}