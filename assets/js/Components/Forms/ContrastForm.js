import React, { useState, useEffect } from 'react'
import PaletteIcon from '../Icons/PaletteIcon'
import DarkIcon from '../Icons/DarkIcon'
import LightIcon from '../Icons/LightIcon'
import ColorSelector from '../ColorSelector'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import FixedIcon from '../Icons/FixedIcon'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function ContrastForm({
  t,
  settings,
  activeIssue,
  handleActiveIssue,
  handleIssueSave
}) {

  const getBackgroundColor = () => {
    const issue = activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    if (element.style.backgroundColor) {
      return Contrast.standardizeColor(element.style.backgroundColor)
    }
    else if (metadata.messageArgs) {
      // TODO: check if 4th argument exists
      // (Equal Access) text_contrast_sufficient: The 4th index in messageArgs is the background color
      return metadata.messageArgs[4]
    }
    else {
      return (metadata.backgroundColor) ? Contrast.standardizeColor(metadata.backgroundColor) : settings.backgroundColor
    }
  }

  const getTextColor = () => {
    const issue = activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    if (element.style.color) {
      return Contrast.standardizeColor(element.style.color)
    }
    else if (metadata.messageArgs) {
      // (Equal Access) text_contrast_sufficient: The 3rd index in messageArgs is the foreground color
      return metadata.messageArgs[3]
    }
    else {
      return (metadata.color) ? Contrast.standardizeColor(metadata.color) : settings.textColor
    }
  }

  const initialBackgroundColor = getBackgroundColor()
  const initialTextColor = getTextColor()
  const headingTags = ["H1", "H2", "H3", "H4", "H5", "H6"]

  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor)
  const [textColor, setTextColor] = useState(initialTextColor)
  const [backgroundColorInput, setBackgroundColorInput] = useState(initialBackgroundColor)
  const [textColorInput, setTextColorInput] = useState(initialTextColor)
  const [contrastRatio, setContrastRatio] = useState(null)
  const [ratioIsValid, setRatioIsValid] = useState(false)
  const [showTextColorSelector, setShowTextColorSelector] = useState(false)
  const [showBackgroundColorSelector, setShowBackgroundColorSelector] = useState(false)
  
  const isValidHexColor = (color) => {
    const hexColorPattern = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    let outcome = hexColorPattern.test(color)
    return outcome
  }

  const processHtml = (html) => {
    let element = Html.toElement(html)

    element.style.backgroundColor = Contrast.convertShortenedHex(backgroundColor)
    element.style.color = Contrast.convertShortenedHex(textColor)

    return Html.toString(element)
  }

  const updatePreview = () => {
    let issue = activeIssue
    const html = Html.getIssueHtml(activeIssue)
    let contrastRatio = Contrast.contrastRatio(backgroundColor, textColor)
    let tagName = Html.toElement(html).tagName
    let ratioIsValid = ratioIsValid
    
    if(headingTags.includes(tagName)) {
      ratioIsValid = (contrastRatio >= 3)
    } else {
      ratioIsValid = (contrastRatio >= 4.5)
    }

    setContrastRatio(contrastRatio)
    setRatioIsValid(ratioIsValid)

    issue.newHtml = processHtml(html)
    handleActiveIssue(issue)
  }

  const updateText = (value) => {
     setTextColor(value)
     setTextColorInput(value)
  }

  const updateBackground = (value) => {
    setBackgroundColor(value)
    setBackgroundColorInput(value)
  }

  const handleInputText = (event, value) => {
    setTextColorInput(value)
    if(isValidHexColor(value)) {
      setTextColor(value)
    }
  }

  const handleInputBackground = (event, value) => {
    setBackgroundColorInput(value)
    if(isValidHexColor(value)) {
      setBackgroundColor(value)
    }
  }

  const handleToggleTextColorSelector = () => {
    setShowTextColorSelector(!showTextColorSelector)
  }

  const handleToggleBackgroundColorSelector = () => {
    setShowBackgroundColorSelector(!showBackgroundColorSelector)
  }

  const handleLightenText = () => {
    setTextColor(Contrast.changehue(textColor, 'lighten'))
  }

  const handleDarkenText = () => {
    setTextColor(Contrast.changehue(textColor, 'darken'))
  }

  const handleLightenBackground = () => {
    setBackgroundColor(Contrast.changehue(backgroundColor, 'lighten'))
  }

  const handleDarkenBackground = () => {
    setBackgroundColor(Contrast.changehue(backgroundColor, 'darken'))
  }

  const handleSubmit = () => {
    let issue = activeIssue
    if(ratioIsValid) {
      issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
      handleIssueSave(issue)
    }
  }

  useEffect(() => {
    updatePreview()
  }, [textColor, backgroundColor])

  useEffect(() => {
    setBackgroundColor(getBackgroundColor())
    setTextColor(getTextColor())
  }, [activeIssue])

  return (
    <>
      {/* <div id="flash-messages" role="alert" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
        {t('form.contrast_ratio')}: {contrastRatio}
      </div> */}
      <label htmlFor="backgroundColorInput">{t('form.contrast.replace_background')}</label>
      <div className="flex-row justify-content-between mt-2">
        <div className="flex-row gap-2">
          <div className="flex-column justify-content-center ps-1">
            <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(backgroundColor), width: '20px', height: '20px', opacity: 1.0, display: 'inline-block' }}></div>
          </div>
          <div className="flex-column justify-content-center">
            <input id="backgroundColorInput" name="backgroundColorInput" className="w-50" type="text" value={backgroundColorInput} onChange={(e) => handleInputBackground(e, e.target.value)} />
          </div>
        </div>
        <div className="flex-row gap-1">
          <div className="flex-column justify-content-center">
            <button
              className={`btn-icon-only btn-transparent ${showBackgroundColorSelector ? 'active' : ''}`}
              title={showBackgroundColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker') }
              aria-label={showBackgroundColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker') }
              onClick={handleToggleBackgroundColorSelector} >
              <PaletteIcon className="icon-md" />
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.label.darken')} onClick={handleDarkenBackground}>
              <DarkIcon className="icon-md"/>
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.label.lighten')} onClick={handleLightenBackground}>
              <LightIcon className="icon-md"/>
            </button>
          </div>
        </div>
      </div>
      {showBackgroundColorSelector && (
        <div className="mt-2">
          <ColorSelector
            t={t}
            updateColor={updateBackground}
          />
        </div>
      )}

      <div className="mt-3 mb-0">
        <label htmlFor="textColorInput">{t('form.contrast.replace_text')}</label>
      </div>
      <div className="flex-row justify-content-between mt-2">
        <div className="flex-row gap-2">
          <div className="flex-column justify-content-center ps-1">
            <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(textColor), width: '20px', height: '20px', opacity: 1.0, display: 'inline-block' }}></div>
          </div>
          <div className="flex-column justify-content-center">
            <input id="textColorInput" name="textColorInput" className="w-50" type="text" value={textColorInput} onChange={(e) => handleInputText(e, e.target.value)} />
          </div>
        </div>
        <div className="flex-row gap-1">
          <div className="flex-column justify-content-center">
            <button
              className={`btn-icon-only btn-transparent ${showTextColorSelector ? 'active' : ''}`}
              title={showTextColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker')}
              aria-label={showTextColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker')}
              onClick={handleToggleTextColorSelector}>
              <PaletteIcon className="icon-md" />
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.label.darken')} onClick={handleDarkenText}>
              <DarkIcon className="icon-md"/>
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.label.lighten')} onClick={handleLightenText}>
              <LightIcon className="icon-md"/>
            </button>
          </div>
        </div>
      </div>
      {showTextColorSelector && (
        <div className="mt-2">
          <ColorSelector
            t={t}
            updateColor={updateText}
          />
        </div>
      )}
      <div className="flex-row justify-content-between mt-3 mb-3">
        <div className="flex-column justify-content-start">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!ratioIsValid}>{t('form.submit')}</button>
        </div>
        <div className="flex-column justify-content-start">
          <div className={`ratio-container flex-column ${ratioIsValid ? 'ratio-valid' : 'ratio-invalid'}`}>
            <div className="flex-row justify-content-center">
              <div className="ratio-label">{t('form.contrast.label.ratio')}</div>
            </div>
            <div className="flex-row justify-content-center gap-1">
              <div className="flex-column justify-content-center">
                {ratioIsValid ? (
                  <FixedIcon className="icon-md color-success" />
                ) : (
                  <SeverityIssueIcon className="icon-md color-issue" />
                )}
              </div>
              <div className="flex-column justify-content-center">
                <div className="ratio-value">{contrastRatio}</div>  
              </div>
            </div>
            <div className="flex-row justify-content-center">
              <div className={`ratio-status ${ratioIsValid ? 'valid' : 'invalid'}`}>{ratioIsValid ? t('form.contrast.feedback.valid') : t('form.contrast.feedback.invalid')}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}