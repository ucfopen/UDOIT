import React, { act, useEffect, useState } from 'react'
import * as Html from '../../Services/Html'
import Combobox from '../Widgets/Combobox'
import FormSaveOrReview from './FormSaveOrReview'


const LanguageForm = ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
}) => {
    const [useBCP47, setUseBCP47] = useState(false) 
    const [textInputBCP47, setTextInputBCP47] = useState('') 
    const [removeLanguage, setRemoveLanguage] = useState(false) 
    const [language, setLanguage] = useState("") 
    const [inputErrors, setInputErrors] = useState([]) 
    const [options, setOptions] = useState([]); 

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
            name: "No Language Selected",
            selected: selectedLang === ''
        })
        for(const key in primaryLanguages){
            tempOptions.push({
                value: key,
                name: primaryLanguages[key],
                selected: selectedLang === key
            })
        }
        return tempOptions;
   }



    useEffect(() => {
       if(!activeIssue){
            return
       }

       const html = Html.getIssueHtml(activeIssue)
       const tagName = Html.getTagName(html)
       let rawLanguage = Html.getAttribute(html, "lang")
       rawLanguage = (typeof rawLanguage === 'string') ? rawLanguage : ''
       const langOption = (rawLanguage in primaryLanguages) ? rawLanguage : '' 
       let tempOptions = constructOptions(langOption);
       if(activeIssue.scanRuleId !== "element_lang_valid" || tagName === "HTML"){
            setIsHtml(true)
       }

       setOptions(tempOptions)
       setLanguage(langOption)
       setTextInputBCP47(rawLanguage)
       setRemoveLanguage(!checkLangAttr(html))
       setUseBCP47(false)
       setInputErrors([])

    }, [activeIssue])


useEffect(() => {
    updateActiveIssueHtml()
    checkFormErrors()
}, [language, removeLanguage, useBCP47, textInputBCP47])


const updateActiveIssueHtml = () => {
    let issue = activeIssue
    issue.isModified = true

    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)

    if(removeLanguage){ 
        element = Html.removeAttribute(element, "lang")
    }
    else if(useBCP47){ 
        element = Html.setAttribute(element, "lang", textInputBCP47)
    }
    else if(Html.getAttribute(element, "lang")) { 
        element = Html.setAttribute(element, "lang", language)
    }

    issue.newHtml = Html.toString(element)
    handleActiveIssue(issue)
}



  const checkFormErrors = () => {
    let tempErrors = [] 

    if(!removeLanguage){
        if(useBCP47 && !validBCP47()){ 
            tempErrors.push({text: t('form.language.error.invalidBCP'), type: "error"})
        }
        else if(!useBCP47 && !primaryLanguages[language]){ 
            tempErrors.push({text: t(`form.language.error.invalidLang`), type: "error"})
        }
    }
    setInputErrors(tempErrors)
  }

  const validBCP47 = () => {
        if(!textInputBCP47 || textInputBCP47 == ""){
            return false
        }
        return /^(([a-zA-Z]{2,3}(-[a-zA-Z](-[a-zA-Z]{3}){0,2})?|[a-zA-Z]{4}|[a-zA-Z]{5,8})(-[a-zA-Z]{4})?(-([a-zA-Z]{2}|[0-9]{3}))?(-([0-9a-zA-Z]{5,8}|[0-9][a-zA-Z]{3}))*(-[0-9a-wy-zA-WY-Z](-[a-zA-Z0-9]{2,8})+)*(-x(-[a-zA-Z0-9]{1,8})+)?|x(-[a-zA-Z0-9]{1,8})+|(en-GB-oed|i-ami|i-bnn|i-default|i-enochian|i-hak|i-klingon|i-lux|i-mingo|i-navajo|i-pwn|i-tao|i-tay|i-tsu|sgn-BE-FR|sgn-BE-NL|sgn-CH-DE|art-lojban|cel-gaulish|no-bok|no-nyn|zh-guoyu|zh-hakka|zh-min|zh-min-nan|zh-xiang))$/.test(textInputBCP47)
    }  

// Returns true if the element has a lang tag
  const checkLangAttr = (htmlString) => {
    const element = Html.toElement(htmlString)
    return element.hasAttribute('lang')
  }

  const handleLangChange = (id = null, value) => {
    setLanguage(value)
  }

  const handleSubmit = () => {
    if(inputErrors.length === 0){
        handleIssueSave(activeIssue)
    }
  }

  const handleCheckbox = () => {
    setRemoveLanguage(!removeLanguage)
  }

 
  return (
    <>
    <div className="w-100 mt-2">
        <Combobox 
            isDisabled={isDisabled || removeLanguage || useBCP47} 
            handleChange={handleLangChange} 
            id={activeIssue.id} 
            label={t(`form.language.label.select_language`)} 
            options={options} 
            settings={settings}
        />
    </div>
    <div className="separator mt-2">{t('fix.label.or')}</div>
    <div className='w-100 mt-2'>
        <input 
            type='checkbox'
            id='useBCPCheckbox'
            name='useBCPCheckbox'
            disabled={removeLanguage}
            tabIndex='0'
            checked={useBCP47}
            onChange={() => setUseBCP47(!useBCP47)}
        />
        <label htmlFor='useBCPCheckbox' className='instructions'>{t(`form.language.label.useBCP`)}</label>
        <input 
            type='text'
            disabled={isDisabled || removeLanguage || !useBCP47}
            id='bcpInput'
            name='bcpInput'
            placeholder='Enter valid BCP47'
            value={textInputBCP47}
            onChange={(e) => setTextInputBCP47(e.target.value)}
            className='w-100 p-2'
        />
    </div>
    <div className={isHtml ? `hidden`: ""}>
        <div className="separator mt-2">{t('fix.label.or')}</div>
        <div className="flex-row justify-content-start gap-1 mt-2">
        <input
          type="checkbox"
          id="removeLanguageCheckbox"
          name="removeLanguageCheckbox"
          tabIndex="0"
          checked={removeLanguage}
          onChange={handleCheckbox} />
          <label htmlFor="removeLanguageCheckbox" className="instructions">{t(`form.language.label.remove`)}</label>
     </div>

    </div>
        <FormSaveOrReview
                t={t}
                settings={settings}
                activeIssue={activeIssue}
                isDisabled={isDisabled}
                handleSubmit={handleSubmit}
                formErrors={inputErrors}
                markAsReviewed={markAsReviewed}
                setMarkAsReviewed={setMarkAsReviewed}
            />
     
    </>
  )
}

export default LanguageForm