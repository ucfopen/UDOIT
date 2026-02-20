import React, { useState, useEffect, useRef } from 'react'
import CheckIcon from '../Icons/CheckIcon'
import ContrastIcon from '../Icons/ContrastIcon'
import DarkIcon from '../Icons/DarkIcon'
import ErrorIcon from '../Icons/ErrorIcon'
import LightIcon from '../Icons/LightIcon'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'
import './ContrastForm.css'

export default function ContrastForm({
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
    SET_COLOR: settings.UFIXIT_OPTIONS.EDIT_ATTRIBUTE
  }

  // Extract color strings from gradients
  const extractColors = (gradientString) => {
    const colorRegex = /#(?:[0-9a-fA-F]{3,8})\b|(?:rgba?|hsla?)\([^)]*\)/g
    return gradientString.match(colorRegex) || []
  }

  // Get all background colors (including gradients)
  const getBackgroundColors = () => {
    const html = Html.getIssueHtml(activeIssue)
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
        const hsl = Contrast.toHSL(color)
        if (hsl) {
          tempBackgroundColors.push({
            originalString: styleValue,
            originalColorString: color,
            hsl
          })
        }
      })
    }
    if (tempBackgroundColors.length === 0) {
      tempBackgroundColors.push({
        originalString: '',
        originalColorString: settings.backgroundColor,
        hsl: Contrast.toHSL(settings.backgroundColor)
      })
    }
    return tempBackgroundColors
  }

  // Get initial text color
  const getTextColor = () => {
    const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {};
    const html = Html.getIssueHtml(activeIssue);
    const element = Html.toElement(html);

    let colorEl = element;
    if (metadata.textColorXpath && Html.findElementWithXpath) {
      const found = Html.findElementWithXpath(element, metadata.textColorXpath);
      if (found) colorEl = found;
    }

    if (colorEl && colorEl.style && colorEl.style.color) {
      return Contrast.toHSL(colorEl.style.color);
    }
    return Contrast.toHSL(settings.textColor);
  }

  // Heading tags for contrast threshold
  const headingTags = ["H1", "H2", "H3", "H4", "H5", "H6"]

  // State
  const [originalBgColors, setOriginalBgColors] = useState([])
  const [currentBgColors, setCurrentBgColors] = useState([])
  const [textColor, setTextColor] = useState(null)
  const [contrastRatio, setContrastRatio] = useState(null)
  const [ratioIsValid, setRatioIsValid] = useState(false)
  const [autoAdjustError, setAutoAdjustError] = useState(false)
  const [showAllColors, setShowAllColors] = useState(false)

  // Generate updated HTML with new colors
  const processHtml = (html, bgColors) => {
    let element = Html.toElement(html);
    if (bgColors.length > 1) {
      let gradientHtml = originalBgColors[0].originalString;
      // There is an issue where a simple string replace can overwrite things.
      // For example, I got: linear-gradient(to right, #404040, #004d4d, #4040400e5, #660066.....
      // The third color is an unholy mashup of two replacements.

      // Solution: Flag each original color with an index, then replace based on that index.
      let indices = []
      let minimumIndex = 0
      originalBgColors.forEach((bg, idx) => {
        const stringLocation = gradientHtml.indexOf(bg.originalColorString, minimumIndex)
        if(stringLocation !== -1) {
          minimumIndex = stringLocation + bg.originalColorString.length
        }
        indices.push(stringLocation)
      })

      // Now replace each color IN REVERSE ORDER (to avoid messing up indices)
      for (let i = originalBgColors.length - 1; i >= 0; i--) {
        gradientHtml = gradientHtml.substring(0, indices[i]) + Contrast.hslToHex(bgColors[i]) + gradientHtml.substring(indices[i] + originalBgColors[i].originalColorString.length);
        // gradientHtml = gradientHtml.replace(bg.originalColorString, Contrast.hslToHex(bgColors[idx]));
      }
      element.style.background = gradientHtml;
      element.style.backgroundColor = '';
    } else if (bgColors.length === 1) {
      element.style.backgroundColor = Contrast.hslToHex(bgColors[0]);
    } else {
      element.style.background = '';
    }

    // Set text color on the correct element
    let textColorXpath = null;
    try {
      const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {};
      textColorXpath = metadata.textColorXpath;
    } catch (e) {}
    let textEl = element;
    try {
      const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {};
      if (metadata.textColorXpath && Html.findElementWithXpath) {
        const found = Html.findElementWithXpath(element, metadata.textColorXpath);
        if (found) textEl = found;
      }
    } catch (e) {}
    textEl.style.color = Contrast.hslToHex(textColor);

    return Html.toString(element)
  }

  // Update preview and contrast ratio
  const updatePreview = () => {
    const html = Html.getIssueHtml(activeIssue)
    const newHtml = processHtml(html, currentBgColors)
    if (activeIssue.newHtml !== newHtml) {
      activeIssue.newHtml = newHtml
      handleActiveIssue(activeIssue)
    }
  }

  const checkContrastRatio = () => {
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    const minRatio = isLargeText(element) ? 3 : 4.5
    let ratio = 1
    if (currentBgColors.length > 0 && textColor) {
      const ratios = currentBgColors.map(bg => Contrast.contrastRatio(
        Contrast.hslToHex(bg), Contrast.hslToHex(textColor)
      ))
      ratio = Math.min(...ratios)
    }
    setContrastRatio(ratio)
    const validRatio = ratio >= minRatio
    setRatioIsValid(validRatio)
    return validRatio
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.SET_COLOR]: []
    }

    if(checkContrastRatio() === false) {
      tempErrors[FORM_OPTIONS.SET_COLOR].push({ text: t('form.contrast.feedback.invalid', { current: contrastRatio ? contrastRatio.toFixed(2) : 'N/A' }), type: 'error' })
    }

    setFormErrors(tempErrors)
  }

  // Handlers
  const updateText = (event) => {
    const value = event.target.value
    const hsl = Contrast.toHSL(value)
    if (hsl) setTextColor(hsl)
  }

  // On issue change, extract from original HTML
  useEffect(() => {
    const info = getBackgroundColors()
    setOriginalBgColors(info)
    setCurrentBgColors(info.map(bg => bg.hsl))
    setTextColor(getTextColor())
    setAutoAdjustError(false)
    setShowAllColors(false)
    setActiveOption(FORM_OPTIONS.SET_COLOR)
  }, [activeIssue])

  const updateBackgroundColor = (idx, value) => {
    const hsl = Contrast.toHSL(value)
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? hsl : c)
    )
  }

  const handleBackgroundChange = (idx, value) => {
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? Contrast.setLuminance(c, value) : c)
    )
  }

  const debounceTimer = useRef(null)
  // Debounced updatePreview
  useEffect(() => {
    checkFormErrors()
    updatePreview()
    // if (debounceTimer.current) clearTimeout(debounceTimer.current)
    // debounceTimer.current = setTimeout(() => {
    //   updatePreview()
    // }, 150)
    // return () => clearTimeout(debounceTimer.current)
  }, [textColor, currentBgColors])

  const handleAutoAdjustAll = () => {
    let newBgColors = [...currentBgColors]
    let failed = false
    const element = Html.toElement(Html.getIssueHtml(activeIssue))
    const minRatio = isLargeText(element) ? 3 : 4.5

    for (let i = 0; i < newBgColors.length; i++) {
      let bg = newBgColors[i]
      let ratio = Contrast.contrastRatio(bg, textColor)

      if(ratio >= minRatio) continue

      let changed = false
      let lighter = Contrast.changeLuminance(bg, 'lighten');
      let darker = Contrast.changeLuminance(bg, 'darken');

      const max_iterations = 21
      for(let attempts = 0; attempts < max_iterations; attempts++) {
        const lighterRatio = Contrast.contrastRatio(lighter, textColor)
        const darkerRatio = Contrast.contrastRatio(darker, textColor)
        if (lighterRatio > minRatio) {
          changed = true
          bg = lighter
          break
        } else if (darkerRatio > minRatio) {
          changed = true
          bg = darker
          break
        }
        lighter = Contrast.changeLuminance(lighter, 'lighten')
        darker = Contrast.changeLuminance(darker, 'darken')
      }
      if(!changed) {
        failed = true
      }
      newBgColors[i] = bg
    }
    setCurrentBgColors(newBgColors)
    if(failed) {
      checkFormErrors(true)
    }
  }

  function isLargeText(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    const fontSizePx = parseFloat(style.fontSize);
    const fontWeight = style.fontWeight;

    // Convert px to pt (1pt = 1.333px)
    const fontSizePt = fontSizePx / 1.333;

    // WCAG: large text is >= 18pt (24px) regular or >= 14pt (18.67px) bold
    const isBold = parseInt(fontWeight, 10) >= 700 || style.fontWeight === 'bold';
    return (fontSizePt >= 18) || (isBold && fontSizePt >= 14);
  }

  const maxColorsToShow = 4;
  const shouldShowExpand = currentBgColors.length > maxColorsToShow;
  const visibleBgColors = showAllColors ? currentBgColors : currentBgColors.slice(0, maxColorsToShow);
  const tagName = Html.toElement(Html.getIssueHtml(activeIssue)).tagName;
  const minRatio = headingTags.includes(tagName) ? 3 : 4.5;

  return (
    <>
      <div className="instructions">{t('form.contrast.label.adjust')}</div>
      <div className="flex-column">
        <label id="text-label">{t('form.contrast.replace_text')}</label>
        <div className="flex-row justify-content-between mt-1">
          <div className="flex-column justify-content-center">
            <input
              id="textColorInput"
              type="color"
              value={Contrast.hslToHex(textColor) || '#000000'}
              onChange={updateText}
              aria-labelledby="text-label"
              tabIndex="0"
              disabled={isDisabled}
            />
          </div>
          <div className="flex-row align-items-center gap-1">
            <DarkIcon className="icon-md" alt="" />
            <input
              type="range"
              id="textLumSlider"
              name="textLumSlider"
              aria-labelledby="text-label"
              min="0"
              max="1"
              step="0.025"
              value={textColor?.l || 0}
              onChange={(e) => {
                setTextColor(Contrast.setLuminance(textColor, e.target.value))
              }}
              />
            <LightIcon className="icon-md" alt="" />
          </div>
        </div>
      </div>

      <div className="flex-column">
        <label>{t('form.contrast.replace_background')}</label>
        {visibleBgColors.map((color, idx) => {
          let showStatus = currentBgColors.length > 1;
          let ratio = Contrast.contrastRatio(
            Contrast.hslToHex(color), Contrast.hslToHex(textColor)
          );
          let isValid = ratio >= minRatio;

          return (
            <div key={idx} className="flex-row justify-content-between gradient-row">
              <div className="flex-row align-items-center">
                <input
                  id={`backgroundColorInput${idx}`}
                  type="color"
                  value={Contrast.hslToHex(color) || '#ffffff'}
                  onChange={e => updateBackgroundColor(idx, e.target.value)}
                  aria-label={
                    t('form.contrast.label.background.show_color_picker') +
                    ' ' +
                    (isValid
                      ? t('form.contrast.feedback.valid')
                      : t('form.contrast.feedback.invalid'))
                  }
                  title={t('form.contrast.label.background.show_color_picker')}
                  disabled={isDisabled}
                />
                {showStatus && (
                  isValid ? (
                    <CheckIcon className="icon-md color-success ms-2" />
                  ) : (
                    <ErrorIcon className="icon-md udoit-issue-highlight ms-2" />
                  )
                )}
              </div>
              <div className="flex-row align-items-center gap-1">
                <DarkIcon className="icon-md" alt="" />
                <input
                  type="range"
                  id={`backgroundLumSlider${idx}`}
                  name={`backgroundLumSlider${idx}`}
                  min="0"
                  max="1"
                  step="0.025"
                  value={currentBgColors[idx]?.l || 0}
                  onChange={(e) => {
                    handleBackgroundChange(idx, e.target.value)
                  }}
                  />
                <LightIcon className="icon-md" alt="" />
              </div>
            </div>
          );
        })}
      </div>

      {shouldShowExpand && (
        <div className="flex-column align-items-center mb-2">
          <button
            className="btn-small text-center btn-secondary"
            onClick={() => setShowAllColors(v => !v)}
            aria-expanded={showAllColors}
            aria-controls="contrast-bgcolor-list"
          >
            {showAllColors ? t('form.contrast.hide') : t('form.contrast.show')}
          </button>
        </div>
      )}

      <div className="flex-row justify-content-end">
        <button
          className="btn-small btn-icon-left btn-secondary"
          disabled={isDisabled}
          onClick={handleAutoAdjustAll}
        >
          <ContrastIcon className="icon-md" alt="" />
          {t('form.contrast.label.auto_adjust_all')}
        </button>
      </div>

      <div className={`ratio-container flex-column ${ratioIsValid ? 'ratio-valid' : 'ratio-invalid'}`}>
          
        <div className="flex-row align-items-center gap-1">
            {ratioIsValid ? (
              <CheckIcon className="icon-md color-success" />
            ) : (
              <ErrorIcon className="icon-md udoit-issue-highlight" />
            )}
          <div className="ratio-label">{t('form.contrast.label.ratio')}</div>
        </div>
        
        <div className="ratio-value">{contrastRatio?.toFixed(2) + (currentBgColors.length > 1 ? '*' : '')}</div>
        
        <div className={`ratio-status ${ratioIsValid ? 'valid' : 'invalid'}`}>
          {ratioIsValid
            ? t('form.contrast.feedback.valid')
            : (
                <span>
                  {t('form.contrast.feedback.minimum', {
                    required: minRatio
                  })}
                </span>
              )
          }
        </div>

        {currentBgColors.length > 1 && (
          <div className="gradient-note">
            {t('form.contrast.ratio_note')}
          </div>
        )}
      </div>
    </>
  )
}