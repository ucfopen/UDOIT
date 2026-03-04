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

  const GRADIENT_KEYWORDS = new Set([
    'linear', 'radial', 'repeating-linear', 'repeating-radial', 'gradient',
    'to', 'top', 'bottom', 'left', 'right', 'circle', 'ellipse', 'at', 'center'
  ])

  // Extract color strings from a CSS background value, handling nested color functions
  const extractColors = (str) => {
    const COLOR_FUNCTIONS = new Set([
      'rgb', 'rgba', 'hsl', 'hsla', 'lab', 'lch', 'oklab', 'oklch',
      'hwb', 'color', 'color-mix', 'color-contrast', 'device-cmyk'
    ])

    // Some color function can have colors nested inside, like: lch(from hsl(180 100% 50%) calc(l - 10) c h)
    // Once a color function is detected, we need to capture the entire block (including nested parentheses) as a single token.
    // This returns the full block string (including '(' and ')') and the index after the closing ')'.
    const extractBalancedBlock = (s, openIdx) => {
      let depth = 0
      for (let i = openIdx; i < s.length; i++) {
        if (s[i] === '(') depth++
        else if (s[i] === ')') {
          depth--
          if (depth === 0) return { block: s.slice(openIdx, i + 1), endIdx: i + 1 }
        }
      }
      return null
    }

    const results = []
    let i = 0

    while (i < str.length) {
      // Match hex color: #RGB, #RRGGBB, #RGBA, #RRGGBBAA
      if (str[i] === '#') {
        const hexMatch = str.slice(i).match(/^#[0-9a-fA-F]{3,8}\b/)
        if (hexMatch) {
          results.push(hexMatch[0])
          i += hexMatch[0].length
          continue
        }
      }

      // Match a word (function name, named color, or gradient keyword)
      const wordMatch = str.slice(i).match(/^[a-zA-Z][\w-]*/)
      if (wordMatch) {
        const word = wordMatch[0]
        const afterWord = i + word.length
        const wordLower = word.toLowerCase()

        if (str[afterWord] === '(') {
          if (COLOR_FUNCTIONS.has(wordLower)) {
            // Capture the entire color function as a single token (handles nesting)
            const balanced = extractBalancedBlock(str, afterWord)
            if (balanced) {
              results.push(word + balanced.block)
              i = balanced.endIdx
              continue
            }
          }
          // Non-color function (e.g. linear-gradient): skip the name and opening '(',
          // then continue scanning inside — the closing ')' is just skipped as unknown
          i = afterWord + 1
          continue
        }

        // Bare word not followed by '(' — emit if not a gradient keyword
        if (!GRADIENT_KEYWORDS.has(wordLower)) {
          results.push(word)
        }
        i = afterWord
        continue
      }

      i++
    }

    return results
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
  const [minRatio, setMinRatio] = useState(4.5)
  const [minAAARatio, setMinAAARatio] = useState(7)
  const [ratioIsValid, setRatioIsValid] = useState(false)
  const [ratioIsAAA, setRatioIsAAA] = useState(false)
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
    let ratio = 1
    if (currentBgColors.length > 0 && textColor) {
      const ratios = currentBgColors.map(bg => Contrast.contrastRatio(
        Contrast.hslToHex(bg), Contrast.hslToHex(textColor)
      ))
      ratio = Math.min(...ratios)
    }
    setContrastRatio(ratio)
    const validRatio = ratio >= minRatio
    const aaaRatio = ratio >= minAAARatio
    
    setRatioIsValid(validRatio)
    setRatioIsAAA(aaaRatio)
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
    if (!activeIssue) {
      return
    }

    const element = Html.toElement(Html.getIssueHtml(activeIssue))
    const isLarge = isLargeText(element)
    setMinRatio(isLarge ? 3 : 4.5)
    setMinAAARatio(isLarge ? 4.5 : 7)

    const info = getBackgroundColors()
    setOriginalBgColors(info)
    setCurrentBgColors(info.map(bg => bg.hsl))
    setTextColor(getTextColor())
    
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
    let adjustRatio = minRatio

    if(contrastRatio >= minAAARatio) {
      return
    }
    if(contrastRatio >= minRatio) {
      adjustRatio = minAAARatio
    }

    for (let i = 0; i < newBgColors.length; i++) {
      let bg = newBgColors[i]
      let ratio = Contrast.contrastRatio(bg, textColor)

      if(ratio >= adjustRatio) continue

      let changed = false
      let lighter = Contrast.changeLuminance(bg, 'lighten');
      let darker = Contrast.changeLuminance(bg, 'darken');

      const max_iterations = 41
      for(let attempts = 0; attempts < max_iterations; attempts++) {
        const lighterRatio = Contrast.contrastRatio(lighter, textColor)
        const darkerRatio = Contrast.contrastRatio(darker, textColor)
        if (lighterRatio > adjustRatio) {
          changed = true
          bg = lighter
          break
        } else if (darkerRatio > adjustRatio) {
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
            <DarkIcon className="icon-md" alt="" aria-hidden="true"/>
            <input
              type="range"
              id="textLumSlider"
              name="textLumSlider"
              aria-label={t('form.contrast.replace_text') + ' ' + t('form.contrast.label.brightness')}
              min="0"
              max="1"
              step="0.025"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={((textColor?.l || 0) * 100).toFixed(0) + '%' }
              value={textColor?.l || 0}
              onChange={(e) => {
                setTextColor(Contrast.setLuminance(textColor, e.target.value))
              }}
              />
            <LightIcon className="icon-md" alt="" aria-hidden="true"/>
          </div>
        </div>
      </div>

      <div className="flex-column">
        <label>{t('form.contrast.replace_background')}</label>
        {visibleBgColors.map((color, idx) => {
          let ratio = Contrast.contrastRatio(
            Contrast.hslToHex(color), Contrast.hslToHex(textColor)
          )
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
                      : t('form.contrast.feedback.invalid', { current: ratio ? ratio.toFixed(2) : 'N/A' }))
                  }
                  title={t('form.contrast.label.background.show_color_picker')}
                  disabled={isDisabled}
                />
                { currentBgColors.length > 1 && (
                  isValid ? (
                    <CheckIcon className="icon-md color-success ms-2" />
                  ) : (
                    <ErrorIcon className="icon-md udoit-issue-highlight ms-2" />
                  )
                )}
              </div>
              <div className="flex-row align-items-center gap-1">
                <DarkIcon className="icon-md" alt="" aria-hidden="true"/>
                <input
                  type="range"
                  id={`backgroundLumSlider${idx}`}
                  name={`backgroundLumSlider${idx}`}
                  min="0"
                  max="1"
                  step="0.025"
                  aria-label={t('form.contrast.replace_background') + ' ' + t('form.contrast.label.brightness')}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={((currentBgColors[idx]?.l || 0) * 100).toFixed(0) + '%'}
                  value={currentBgColors[idx]?.l || 0}
                  onChange={(e) => {
                    handleBackgroundChange(idx, e.target.value)
                  }}
                  />
                <LightIcon className="icon-md" alt="" aria-hidden="true"/>
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
          <ContrastIcon className="icon-md" alt="" aria-hidden="true"/>
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
            ? ( ratioIsAAA ? t('form.contrast.feedback.excellent') : t('form.contrast.feedback.valid') )
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