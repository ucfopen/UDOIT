import React, { useState, useEffect } from 'react'
import PaletteIcon from '../Icons/PaletteIcon'
import DarkIcon from '../Icons/DarkIcon'
import LightIcon from '../Icons/LightIcon'
import ColorSelector from '../ColorSelector'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import FixedIcon from '../Icons/FixedIcon'
import SaveIcon from '../Icons/SaveIcon'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function ContrastForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  handleIssueSave,
  markAsReviewed,
  setMarkAsReviewed
}) {

  const getBackgroundColor = () => {
    const issue = activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    if (element?.style?.backgroundColor) {
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
    const newColor = Contrast.changehue(textColor, 'lighten')
    setTextColorInput(newColor)
    setTextColor(newColor)
  }

  const handleDarkenText = () => {
    const newColor = Contrast.changehue(textColor, 'darken')
    setTextColorInput(newColor)
    setTextColor(newColor)
  }

  const handleLightenBackground = () => {
    const newColor = Contrast.changehue(backgroundColor, 'lighten')
    setBackgroundColorInput(newColor)
    setBackgroundColor(newColor)
  }

  const handleDarkenBackground = () => {
    const newColor = Contrast.changehue(backgroundColor, 'darken')
    setBackgroundColorInput(newColor)
    setBackgroundColor(newColor)
  }

  const handleSubmit = () => {
    let issue = activeIssue
    if(ratioIsValid || markAsReviewed) {
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
      <div className="instructions">{t('form.contrast.label.adjust')}</div>
      
      <div className="mt-2">
        <label htmlFor="textColorInput">{t('form.contrast.replace_text')}</label>
      </div>
      <div className="flex-row justify-content-between mt-1">
        <div className="flex-column justify-content-center">
          <button
            className='btn-small btn-secondary btn-icon-left'
            title={showTextColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker') }
            aria-label={showTextColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker') }
            tabIndex="0"
            disabled={isDisabled}
            onClick={handleToggleTextColorSelector} >
            <PaletteIcon className="icon-md pe-1" alt=""/>
            <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(textColor), width: '4.5em', height: '1.75em', margin: '0 -0.25em', opacity: 1.0, display: 'block' }}></div>
          </button>
        </div>
        <div className="flex-row gap-1">
          <div className="flex-column justify-content-center">
            <button
              className="btn-small btn-icon-left btn-secondary"
              tabIndex="0"
              disabled={isDisabled}
              onClick={handleLightenText}>
              <LightIcon className="icon-md" alt=""/>
              {t('form.contrast.label.lighten')}
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button
              className="btn-small btn-icon-left btn-secondary"
              tabIndex="0"
              disabled={isDisabled}
              onClick={handleDarkenText}>
              <DarkIcon className="icon-md" alt=""/>
              {t('form.contrast.label.darken')}
            </button>
          </div>
        </div>
      </div>
      {showTextColorSelector && (
        <div className="mt-1">
          <ColorSelector
            t={t}
            updateColor={updateText}
          />
        </div>
      )}

      <div className="mt-3">
        <label htmlFor="backgroundColorInput">{t('form.contrast.replace_background')}</label>
      </div>
      <div className="flex-row justify-content-between mt-1">
        <div className="flex-column justify-content-center">
          <button
            className='btn-small btn-secondary btn-icon-left'
            title={showBackgroundColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker') }
            aria-label={showBackgroundColorSelector ? t('form.contrast.label.hide_color_picker') : t('form.contrast.label.show_color_picker') }
            tabIndex="0"
            disabled={isDisabled}
            onClick={handleToggleBackgroundColorSelector} >
            <PaletteIcon className="icon-md pe-1" alt=""/>
            <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(backgroundColor), width: '4.5em', height: '1.75em', margin: '0 -0.25em', opacity: 1.0, display: 'block' }}></div>
          </button>
        </div>
        <div className="flex-row gap-1">
          <div className="flex-column justify-content-center">
            <button
              className="btn-small btn-icon-left btn-secondary"
              tabIndex="0"
              disabled={isDisabled}
              onClick={handleLightenBackground}>
              <LightIcon className="icon-md" alt=""/>
              {t('form.contrast.label.lighten')}
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button
              className="btn-small btn-icon-left btn-secondary"
              tabIndex="0"
              disabled={isDisabled}
              onClick={handleDarkenBackground}>
              <DarkIcon className="icon-md" alt=""/>
              {t('form.contrast.label.darken')}
            </button>
          </div>
        </div>
      </div>
      {showBackgroundColorSelector && (
        <div className="mt-1">
          <ColorSelector
            t={t}
            updateColor={updateBackground}
          />
        </div>
      )}

      <div className="flex-row justify-content-between mt-4 mb-3">
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
        <div className="flex-column justify-content-start">
          <button
            className="btn-primary btn-icon-left"
            onClick={handleSubmit}
            tabIndex="0"
            disabled={isDisabled || !ratioIsValid}>
            <SaveIcon className="icon-md" alt="" />
            {t('form.submit')}
          </button>
        </div>
      </div>
    </>
  )
}