import React, { useState, useEffect, useRef } from 'react'
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
  setMarkAsReviewed,
  parentBackground = false
}) {
  console.log("parentBackground", parentBackground)
  // Extract color strings from gradients
  const extractColors = (gradientString) => {
    const colorRegex = /#(?:[0-9a-fA-F]{3,8})\b|(?:rgba?|hsla?)\([^)]*\)/g
    return gradientString.match(colorRegex) || []
  }

  // Get all background colors (including gradients)
  const getBackgroundColors = () => {
    const html = Html.getIssueHtml(activeIssue)
    console.log("html", html)
    let element = Html.toElement(html)
    if (!element) return []
  
    let tempBackgroundColors = []
    let current = element
    let rawStyle = ''
    let bgMatch = null
  
    // Traverse up the DOM to find the first background(-color|-image)
    while (current) {
      rawStyle = current.getAttribute && current.getAttribute('style') || ''
      bgMatch = rawStyle.match(/background(-color|-image)?:\s*([^;]+);?/i)
      if (bgMatch) break
      current = current.parentElement
    }
  
    if (bgMatch) {
      const styleValue = bgMatch[2]
      const colors = extractColors(styleValue)
      colors.forEach(color => {
        const standardColor = Contrast.standardizeColor(color)
        if (standardColor) {
          tempBackgroundColors.push({
            originalString: styleValue,
            originalColorString: color,
            standardColor
          })
        }
      })
    }
  
    if (tempBackgroundColors.length === 0) {
      tempBackgroundColors.push({
        originalString: '',
        originalColorString: settings.backgroundColor,
        standardColor: settings.backgroundColor
      })
    }
    return tempBackgroundColors
  }

  // Get initial text color
  const getTextColor = () => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    console.log(html)
    const element = Html.toElement(html)
    if (element.style.color) {
      return Contrast.standardizeColor(element.style.color)
    }
    return metadata.color ? Contrast.standardizeColor(metadata.color) : settings.textColor
  }

  // Heading tags for contrast threshold
  const headingTags = ["H1", "H2", "H3", "H4", "H5", "H6"]

  // State
  const [originalBgColors, setOriginalBgColors] = useState([])
  const [currentBgColors, setCurrentBgColors] = useState([])
  const [textColor, setTextColor] = useState('')
  const [contrastRatio, setContrastRatio] = useState(null)
  const [ratioIsValid, setRatioIsValid] = useState(false)

  // Validate hex color
  const isValidHexColor = (color) => /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(color)

  // Generate updated HTML with new colors
  const processHtml = (html, bgColors) => {
    let element = Html.toElement(html)
    if (bgColors.length > 1) {
      let gradientHtml = originalBgColors[0].originalString
      originalBgColors.forEach((bg, idx) => {
        gradientHtml = gradientHtml.replace(bg.originalColorString, bgColors[idx])
      })
      element.style.background = gradientHtml
      element.style.backgroundColor = ''
    } else if (bgColors.length === 1) {
      element.style.backgroundColor = Contrast.convertShortenedHex(bgColors[0])
    } else {
      element.style.background = ''
    }
    element.style.color = Contrast.convertShortenedHex(textColor)
    return Html.toString(element)
  }

  // Update preview and contrast ratio
  const updatePreview = () => {
    const html = Html.getIssueHtml(activeIssue)
    let ratio = 1
    if (currentBgColors.length > 0 && textColor) {
      const ratios = currentBgColors.map(bg => Contrast.contrastRatio(bg, textColor))
      ratio = Math.min(...ratios)
    }
    const tagName = Html.toElement(html).tagName
    const valid = headingTags.includes(tagName) ? (ratio >= 3) : (ratio >= 4.5)
    setContrastRatio(ratio)
    setRatioIsValid(valid)

    const newHtml = processHtml(html, currentBgColors)
    if (activeIssue.newHtml !== newHtml) {
      const issue = { ...activeIssue, newHtml }
      handleActiveIssue(issue)
    }
  }

  // Handlers
  const updateText = (event) => {
    const value = event.target.value
    if (isValidHexColor(value)) setTextColor(value)
  }

  // On issue change, extract from original HTML
  useEffect(() => {
    console.log(activeIssue)
    const info = getBackgroundColors() // Use sourceHtml inside this function if available
    setOriginalBgColors(info)
    setCurrentBgColors(info.map(bg => bg.standardColor))
    setTextColor(getTextColor())
    // eslint-disable-next-line
  }, [activeIssue])

  // On user interaction, only update state (do NOT call getBackgroundColors again)
  const updateBackgroundColor = (idx, value) => {
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? value : c)
    )
  }

  const handleLightenText = () => setTextColor(Contrast.changehue(textColor, 'lighten'))
  const handleDarkenText = () => setTextColor(Contrast.changehue(textColor, 'darken'))

  const handleLightenBackground = idx => {
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? Contrast.changehue(c, 'lighten') : c)
    )
  }
  const handleDarkenBackground = idx => {
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? Contrast.changehue(c, 'darken') : c)
    )
  }

  const handleSubmit = () => {
    if (ratioIsValid || markAsReviewed) {
      const issue = { ...activeIssue, newHtml: Contrast.convertHtmlRgb2Hex(activeIssue.newHtml) }
      handleIssueSave(issue)
    }
  }

  // Debounce timer ref
  const debounceTimer = useRef(null)

  // Debounced updatePreview
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updatePreview()
    }, 150) // 150ms debounce, adjust as needed
    return () => clearTimeout(debounceTimer.current)
    // eslint-disable-next-line
  }, [textColor, currentBgColors])

  // Render
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
            tabIndex="0"
            disabled={isDisabled}
            value={textColor}
            onChange={updateText}
          />
        </div>
        <div className="flex-row gap-1">
          <div className="flex-column justify-content-center">
            <button
              className="btn-small btn-icon-left btn-secondary"
              tabIndex="0"
              disabled={isDisabled}
              onClick={handleLightenText}>
              <LightIcon className="icon-md" alt="" />
              {t('form.contrast.label.lighten')}
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button
              className="btn-small btn-icon-left btn-secondary"
              tabIndex="0"
              disabled={isDisabled}
              onClick={handleDarkenText}>
              <DarkIcon className="icon-md" alt="" />
              {t('form.contrast.label.darken')}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label>{t('form.contrast.replace_background')}</label>
      </div>
      {currentBgColors.map((color, idx) => (
        <div key={idx} className="flex-row justify-content-between mt-1">
          <input
            id={`backgroundColorInput${idx}`}
            aria-label={t('form.contrast.label.background.show_color_picker')}
            title={t('form.contrast.label.background.show_color_picker')}
            type="color"
            disabled={isDisabled}
            value={color}
            style={{ width: '2.5em', height: '2em' }}
            onChange={e => updateBackgroundColor(idx, e.target.value)}
          />
          <div className="flex-row gap-1">
            <button
              tabIndex="0"
              disabled={isDisabled}
              onClick={() => handleLightenBackground(idx)}
              className="btn-small btn-icon-left btn-secondary"
            >
              <LightIcon className="icon-md" alt="" />
              {t('form.contrast.label.lighten')}
            </button>
            <button
              tabIndex="0"
              disabled={isDisabled}
              onClick={() => handleDarkenBackground(idx)}
              className="btn-small btn-icon-left btn-secondary"
            >
              <DarkIcon className="icon-md" alt="" />
              {t('form.contrast.label.darken')}
            </button>
          </div>
        </div>
      ))}

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
              <div className={`ratio-status ${ratioIsValid ? 'valid' : 'invalid'}`}>
                {ratioIsValid ? t('form.contrast.feedback.valid') : t('form.contrast.feedback.invalid')}
              </div>
            </div>
            {currentBgColors.length > 1 && (
              <div className="flex-row justify-content-center">
                <small style={{ fontStyle: 'italic', color: '#666' }}>
                  * lowest among gradient colors
                </small>
              </div>
            )}
          </div>
        </div>
        <div className="flex-column justify-content-start">
          <div className="flex-row justify-content-between gap-1 mt-4">
            <div className="flex-column justify-content-center flex-grow-1 gap-1">
              {(activeIssue.status === 1 || activeIssue.status === 3) ? (
                <div className="flex-row justify-content-end pe-2">
                  <FixedIcon className="color-success icon-md flex-column align-self-center pe-2" />
                  <div className="flex-column align-self-center fw-bolder primary">
                    {t('filter.label.resolution.fixed_single')}
                  </div>
                </div>
              ) : activeIssue.status === 2 ? (
                <div className="flex-row justify-content-end pe-2">
                  <ResolvedIcon className="color-success icon-md flex-column align-self-center pe-2" />
                  <div className="flex-column align-self-center fw-bolder primary">
                    {t('filter.label.resolution.resolved_single')}
                  </div>
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