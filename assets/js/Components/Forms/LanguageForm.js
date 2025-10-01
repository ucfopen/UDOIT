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
    const [useBCP47, setUseBCP47] = useState(false) // If user wants to input custom BCP47 rule - deafault to false as most fauclty will just select language
    const [textInputBCP47, setTextInputBCP47] = useState("") // The text input for checking BCP47

    const [removeLanguage, setRemoveLanguage] = useState(false) // Checkbox for if we want to remove the language tag or not
    const [language, setLanguage] = useState("") // The actual language or language code that's being used 
    const [inputErrors, setInputErrors] = useState([]) // Populates if user has errors with inputs (BCP47 validity or somehow choosing an invalid language)
    const [options, setOptions] = useState([]); // Options used for combobox

    const [isHtml, setIsHtml] = useState(false); // Checks if it is a html tag

    // Only Construct on first load
    useEffect(() => {
        let tempOptions = constructOptions()
        setOptions(tempOptions)
    }, [])

  
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


// O(1) or however many languages there are when we first load in
const constructOptions = () => {
        let tempOptions = []
        tempOptions.push({
            value: "none",
            name: "No Language Selected"
        })
        for(const key in primaryLanguages){
            tempOptions.push({
                value: key,
                name: primaryLanguages[key]
            })
        }
        return tempOptions;
   }


// On every update of our activie issue, we want to set it to the language it's using (even if it's not an existing language)
    useEffect(() => {
       if(!activeIssue){
            return
       }

       const html = Html.getIssueHtml(activeIssue)
       const tagName = Html.getTagName(html)
       let rawLanguage = Html.getAttribute(html, "lang")
       rawLanguage = (typeof rawLanguage == 'string') ? rawLanguage : ""

       
       if(activeIssue.scanRuleId !== "element_lang_valid" || tagName === "HTML"){
            setIsHtml(true)
       }
       setLanguage(rawLanguage)
       setInputErrors([])

    }, [activeIssue])


useEffect(() => {
    updateActiveIssueHtml()
    checkFormErrors()
}, [language, removeLanguage, useBCP47, textInputBCP47])


const updateActiveIssueHtml = () => {
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)

    // Case 1: We are removing the lang tag
    if(removeLanguage){ 
        element = Html.removeAttribute(element, "lang")
    }
    else{ // We are not removing the language
        if(useBCP47){ // If we are change
            element = Html.setAttribute(element, "lang", textInputBCP47)
        }
        else{ // We are just changing through primary language change
            element = Html.setAttribute(element, "lang", language)
        }
    }

    let issue = activeIssue
    issue.newHtml = Html.toString(element)

    handleActiveIssue(issue)
}



  const checkFormErrors = () => {
    let tempErrors = [] 
    // Only check for errors if and only if we are STILL using the lang tag
    if(!removeLanguage){
        if(useBCP47){ // If we are using BCP47 textbox we must check for valid BCP47
            if(!validBCP47()){
                tempErrors.push({text: t('form.language.error.invalidBCP'), type: "error"})
            }
        }
        else{ // Otherwise we can just use the default languages
            if(!primaryLanguages[language]){
                tempErrors.push({text: t(`form.language.error.invalidLang`), type: "error"})
            }
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


  const handleLangChange = (id, value) => {
    // Set the new language selected by the user here 
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
            text={textInputBCP47}
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