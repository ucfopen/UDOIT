import React, { useState, useEffect, useRef } from 'react'
import DarkIcon from '../Icons/DarkIcon'
import LightIcon from '../Icons/LightIcon'
import CheckIcon from '../Icons/CheckIcon'
import CloseIcon from '../Icons/CloseIcon'
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
}) {
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

  // Generate updated HTML with new colors
  const processHtml = (html, bgColors) => {
    let element = Html.toElement(html);
    if (bgColors.length > 1) {
      let gradientHtml = originalBgColors[0].originalString;
      originalBgColors.forEach((bg, idx) => {
        gradientHtml = gradientHtml.replace(bg.originalColorString, Contrast.hslToHex(bgColors[idx]));
      });
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
    let ratio = 1
    if (currentBgColors.length > 0 && textColor) {
      const ratios = currentBgColors.map(bg => Contrast.contrastRatio(
        Contrast.hslToHex(bg), Contrast.hslToHex(textColor)
      ))
      ratio = Math.min(...ratios)
    }
    const element = Html.toElement(html);
    const minRatio = isLargeText(element) ? 3 : 4.5;
    setContrastRatio(ratio)
    setRatioIsValid(ratio >= minRatio)
  
    const newHtml = processHtml(html, currentBgColors)
    if (activeIssue.newHtml !== newHtml) {
      activeIssue.newHtml = newHtml
      handleActiveIssue(activeIssue)
    }
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
    // eslint-disable-next-line
  }, [activeIssue])

  const updateBackgroundColor = (idx, value) => {
    const hsl = Contrast.toHSL(value)
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? hsl : c)
    )
  }

  const handleLightenText = () => setTextColor(Contrast.changeLuminance(textColor, 'lighten'))
  const handleDarkenText = () => setTextColor(Contrast.changeLuminance(textColor, 'darken'))

  const handleLightenBackground = idx => {
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? Contrast.changeLuminance(c, 'lighten') : c)
    )
  }
  const handleDarkenBackground = idx => {
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? Contrast.changeLuminance(c, 'darken') : c)
    )
  }

  const handleSubmit = () => {
    if (ratioIsValid || markAsReviewed) {
      const issue = { ...activeIssue, newHtml: Contrast.convertHtmlRgb2Hex(activeIssue.newHtml) }
      handleIssueSave(issue)
    }
  }

  const debounceTimer = useRef(null)
  // Debounced updatePreview
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updatePreview()
    }, 150)
    return () => clearTimeout(debounceTimer.current)
    // eslint-disable-next-line
  }, [textColor, currentBgColors])

  const handleAutoAdjustAll = () => {
    let newBgColors = [...currentBgColors];
    let changed = false;
    let failed = false;
    const element = Html.toElement(Html.getIssueHtml(activeIssue));
    const minRatio = isLargeText(element) ? 3 : 4.5;
    for (let i = 0; i < newBgColors.length; i++) {
      let bg = newBgColors[i];
      let ratio = Contrast.contrastRatio(bg, textColor);
      let attempts = 0;
      while (ratio < minRatio && attempts < 20) {
        const lighter = Contrast.changeLuminance(bg, 'lighten');
        const darker = Contrast.changeLuminance(bg, 'darken');
        const lighterRatio = Contrast.contrastRatio(lighter, textColor);
        const darkerRatio = Contrast.contrastRatio(darker, textColor);
        if (lighterRatio > darkerRatio) {
          bg = lighter;
          ratio = lighterRatio;
        } else {
          bg = darker;
          ratio = darkerRatio;
        }
        attempts++;
      }
      if (ratio < minRatio) {
        failed = true;
        break;
      }
      if (attempts > 0) changed = true;
      newBgColors[i] = bg;
    }
    if (failed) {
      setCurrentBgColors(originalBgColors.map(bg => bg.hsl));
      setAutoAdjustError(true);
    } else if (changed) {
      setCurrentBgColors(newBgColors);
      setAutoAdjustError(false);
    }
  };

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
            type="color"
            value={Contrast.hslToHex(textColor) || '#000000'}
            onChange={updateText}
            aria-label={t('form.contrast.label.text.show_color_picker')}
            title={t('form.contrast.label.text.show_color_picker')}
            tabIndex="0"
            disabled={isDisabled}
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
      {currentBgColors.map((color, idx) => {
        let showStatus = currentBgColors.length > 1;
        let tagName = Html.toElement(Html.getIssueHtml(activeIssue)).tagName;
        let minRatio = headingTags.includes(tagName) ? 3 : 4.5;
        let ratio = Contrast.contrastRatio(
          Contrast.hslToHex(color), Contrast.hslToHex(textColor)
        );
        let isValid = ratio >= minRatio;

        return (
          <div key={idx} className="flex-row justify-content-between mt-1 gradient-row">
            <div className="flex-row align-items-center">
              <input
                id={`backgroundColorInput${idx}`}
                type="color"
                value={Contrast.hslToHex(color) || '#ffffff'}
                onChange={e => updateBackgroundColor(idx, e.target.value)}
                aria-label={t('form.contrast.label.background.show_color_picker')}
                title={t('form.contrast.label.background.show_color_picker')}
                disabled={isDisabled}
              />
              {showStatus && (
                isValid
                  ? <CheckIcon
                      className="icon-md color-success ms-2"
                      title={t('form.contrast.feedback.valid')}
                      aria-label={t('form.contrast.feedback.valid')}
                      alt={t('form.contrast.feedback.valid')}
                    />
                  : <CloseIcon
                      className="icon-md color-issue ms-2"
                      title={t('form.contrast.feedback.invalid')}
                      aria-label={t('form.contrast.feedback.invalid')}
                      alt={t('form.contrast.feedback.invalid')}
                    />
              )}
            </div>
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
        );
      })}

      {currentBgColors.length > 1 && (
        <div className="flex-row justify-content-end mt-2">
          <button
            className="btn-small btn-primary"
            disabled={isDisabled}
            onClick={handleAutoAdjustAll}
          >
            {t('form.contrast.label.auto_adjust_all')}
          </button>
        </div>
      )}

      {autoAdjustError && (
        <div className="flex-row justify-content-center">
          <div className="color-issue mt-2">
            {t('form.contrast.auto_adjust_error')}
          </div>
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
              <div className={`ratio-status ${ratioIsValid ? 'valid' : 'invalid'}`}>
                {ratioIsValid ? t('form.contrast.feedback.valid') : t('form.contrast.feedback.invalid')}
              </div>
            </div>
            {currentBgColors.length > 1 && (
              <div className="flex-row justify-content-center">
                <small className="gradient-note">
                  {t('form.contrast.ratio_note')}
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