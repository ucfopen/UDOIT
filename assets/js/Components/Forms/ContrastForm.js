import React, { useState, useEffect } from 'react'
import DarkIcon from '../Icons/DarkIcon'
import LightIcon from '../Icons/LightIcon'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import FixedIcon from '../Icons/FixedIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
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
  const [contrastRatio, setContrastRatio] = useState(null)
  const [ratioIsValid, setRatioIsValid] = useState(false)
  
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

  const updateText = (event) => {
    const value = event.target.value
    if(!isValidHexColor(value)) {
      return
    }
    setTextColor(value)
  }

  const updateBackground = (event) => {
    const value = event.target.value
    if(!isValidHexColor(value)) {
      return
    }
    setBackgroundColor(value)
  }

  const handleLightenText = () => {
    const newColor = Contrast.changehue(textColor, 'lighten')
    setTextColor(newColor)
  }

  const handleDarkenText = () => {
    const newColor = Contrast.changehue(textColor, 'darken')
    setTextColor(newColor)
  }

  const handleLightenBackground = () => {
    const newColor = Contrast.changehue(backgroundColor, 'lighten')
    setBackgroundColor(newColor)
  }

  const handleDarkenBackground = () => {
    const newColor = Contrast.changehue(backgroundColor, 'darken')
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
          <input
            id="textColorInput"
            aria-label={t('form.contrast.label.text.show_color_picker')}
            title={t('form.contrast.label.text.show_color_picker')}
            type="color"
            value={textColor}
            onChange={updateText} />
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

      <div className="mt-3">
        <label htmlFor="backgroundColorInput">{t('form.contrast.replace_background')}</label>
      </div>
      <div className="flex-row justify-content-between mt-1">
        <div className="flex-column justify-content-center">
          <input
            id="backgroundColorInput"
            aria-label={t('form.contrast.label.background.show_color_picker')}
            title={t('form.contrast.label.background.show_color_picker')}
            type="color"
            value={backgroundColor}
            onChange={updateBackground} />
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
          <div className="flex-row justify-content-between gap-1 mt-4">
            <div className="flex-column justify-content-center flex-grow-1 gap-1">
              { (activeIssue.status === 1 || activeIssue.status === 3) ? (
                  <div className="flex-row justify-content-end pe-2">
                    <FixedIcon className="color-success icon-md flex-column align-self-center pe-2"/>
                    <div className="flex-column align-self-center fw-bolder primary">{t('filter.label.resolution.fixed_single')}</div>
                  </div>
                ) : activeIssue.status === 2 ? (
                  <div className="flex-row justify-content-end pe-2">
                    <ResolvedIcon className="color-success icon-md flex-column align-self-center pe-2"/>
                    <div className="flex-column align-self-center fw-bolder primary">{t('filter.label.resolution.resolved_single')}</div>
                  </div>
                ) : ''}
            </div>
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
      </div>
    </>
  )
}