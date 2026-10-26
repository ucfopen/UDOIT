import React, { useState, useEffect, useRef } from 'react'
import { UFIXIT_OPTIONS } from '../../Services/Constants'
import CheckIcon from '../Icons/CheckIcon'
import DarkIcon from '../Icons/DarkIcon'
import ErrorIcon from '../Icons/ErrorIcon'
import LightIcon from '../Icons/LightIcon'
import MagicIcon from '../Icons/MagicIcon'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'
import SliderSelect from '../Widgets/SliderSelect'
import InfoPopover from '../Widgets/InfoPopover'
import './ContrastForm.css'

export default function ContrastForm({
  t,
  instanceInfo, 
  activeIssue,
  activeContentItem,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  setFormErrors
}) {

  const FORM_OPTIONS = {
    SET_COLOR: UFIXIT_OPTIONS.EDIT_ATTRIBUTE
  }

  // Get all background colors (including gradients)
  const getBackgroundColors = () => {
    let metadata = {}
    try {
      metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {}
    } catch {
      // Continue with issue-level foreground/background data if metadata is invalid.
    }
    const relativeTextXpath = metadata.textColorXpath
      ? Contrast.joinXpath(activeIssue.xpath, metadata.textColorXpath)
      : ''
    const messageArgs = metadata.messageArgs || []
    const contentDoc = new DOMParser().parseFromString(activeContentItem?.body || '', 'text/html')
    const issueElement = Html.findElementWithXpath(contentDoc, activeIssue.xpath)
    const textColorElement = issueElement
      ? Contrast.findTextColorElement(issueElement, messageArgs[3])
      : null
    const textColorXpath = textColorElement ? Html.findXpathFromElement(textColorElement) : ''
    const focusXpath = relativeTextXpath
      || (metadata.focusXpath && metadata.focusXpath !== activeIssue.xpath ? metadata.focusXpath : '')
      || textColorXpath
      || metadata.focusXpath
    const effectiveFocusXpath = focusXpath || activeIssue.xpath
    const declaration = Contrast.findBackgroundDeclaration(
      activeContentItem?.body,
      activeIssue.xpath,
      effectiveFocusXpath,
      messageArgs[4],
    )
    if (declaration) {
      const colors = Contrast.extractGradientColors(declaration.styleValue)
      const parsedColors = colors.map((color) => ({
        originalString: declaration.styleValue,
        originalColorString: color,
        propertyName: declaration.propertyName,
        ownerXpath: declaration.ownerXpath,
        hsl: Contrast.toHSL(color),
      })).filter((color) => color.hsl)
      if (parsedColors.length) return parsedColors
    }

    const targetXpath = effectiveFocusXpath || activeIssue.xpath
    const computedStyle = Contrast.getComputedStyle(activeContentItem?.body, targetXpath)
    const computedColor = messageArgs[4] || computedStyle?.backgroundColor
    const hasComputedColor = computedColor && !/^rgba?\(0\s*,\s*0\s*,\s*0(?:\s*,\s*0)?\)$/i.test(computedColor)
    return [{
      originalString: '',
      originalColorString: hasComputedColor ? computedColor : instanceInfo.backgroundColor,
      propertyName: 'background-color',
      ownerXpath: activeIssue.xpath,
      hsl: Contrast.toHSL(hasComputedColor ? computedColor : instanceInfo.backgroundColor),
    }]
  }

  // Get initial text color
  const getTextColor = (elementStyle, metadata, hasFocusedText) => {
    if (hasFocusedText && elementStyle?.color) {
      return Contrast.toHSL(elementStyle.color)
    }
    if (metadata?.messageArgs && metadata.messageArgs.length > 3 && metadata.messageArgs[3]) {
      return Contrast.toHSL(metadata.messageArgs[3])
    }
    if (elementStyle?.color) return Contrast.toHSL(elementStyle.color)
    return Contrast.toHSL(instanceInfo.textColor);
  }

  // State
  const [originalBgColors, setOriginalBgColors] = useState([])
  const [originalTextColor, setOriginalTextColor] = useState(null)
  const [currentBgColors, setCurrentBgColors] = useState([])
  const [textColor, setTextColor] = useState(null)
  const [contrastRatio, setContrastRatio] = useState(null)
  const [minRatio, setMinRatio] = useState(4.5)
  const [minAAARatio, setMinAAARatio] = useState(7)
  const [ratioIsValid, setRatioIsValid] = useState(false)
  const [showAllColors, setShowAllColors] = useState(false)
  const [contrastTarget, setContrastTarget] = useState('AA')
  const [autoAdjustFeedbackKey, setAutoAdjustFeedbackKey] = useState(null)
  const lastProcessedPreview = useRef('')
  const sameColor = (first, second) => first && second && ['h', 's', 'l'].every((key) =>
    Object.is(first[key], second[key]) || (Number.isNaN(first[key]) && Number.isNaN(second[key]))
  )
  const hasColorChanges = Boolean(originalTextColor && textColor && (
    !sameColor(textColor, originalTextColor)
    || currentBgColors.length !== originalBgColors.length
    || currentBgColors.some((color, index) => !sameColor(color, originalBgColors[index]?.hsl))
  ))

  // Build the full-page preview so background colors on containing ancestors are edited too.
  const processHtml = () => {
    const doc = new DOMParser().parseFromString(activeContentItem?.body || '', 'text/html')
    const target = Html.findElementWithXpath(doc, activeIssue.xpath)
    const element = Html.toElement(Html.getIssueHtml(activeIssue))
    if (!target || !element || element.nodeType !== Node.ELEMENT_NODE) return null

    const backgroundOwnerXpath = originalBgColors[0]?.ownerXpath
    const backgroundOwnerIsTarget = backgroundOwnerXpath === activeIssue.xpath
    target.replaceWith(element)

    // Prefer scanner focus metadata; otherwise locate the matching styled text descendant.
    let textEl = null
    try {
      const metadata = activeIssue.metadata ? JSON.parse(activeIssue.metadata) : {};
      if (metadata.textColorXpath && Html.findElementWithXpath) {
        const found = Html.findElementWithXpath(element, metadata.textColorXpath)
        if (found) textEl = found
      }
      if (!textEl) textEl = Contrast.findTextColorElement(element, metadata.messageArgs?.[3])
      if (!textEl && metadata.focusXpath) {
        const focused = Html.findElementWithXpath(doc, metadata.focusXpath)
        if (focused && element.contains(focused)) textEl = focused
      }
    } catch {
      // Fall back to the root element if issue metadata cannot be parsed.
    }
    ;(textEl || element).style.color = Contrast.hslToHex(textColor)

    const backgroundOwner = backgroundOwnerIsTarget
      ? element
      : Html.findElementWithXpath(doc, backgroundOwnerXpath)
    if (backgroundOwner && currentBgColors.length) {
      const backgroundInfo = originalBgColors[0]
      const replacementColors = currentBgColors.map((color) => Contrast.hslToHex(color))
      const isGradient = /(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(backgroundInfo.originalString)
      if (isGradient) {
        const revisedGradient = Contrast.replaceColorStops(
          backgroundInfo.originalString,
          originalBgColors.map((color) => color.originalColorString),
          replacementColors,
        )
        backgroundOwner.style.setProperty(backgroundInfo.propertyName, revisedGradient)
      } else {
        backgroundOwner.style.setProperty(backgroundInfo.propertyName || 'background-color', replacementColors[0])
      }
    }

    return { issueHtml: Html.toString(element), fullPageHtml: doc.body.innerHTML }
  }

  // Update preview and contrast ratio
  const updatePreview = () => {
    if (!activeContentItem?.body || !activeIssue || !textColor || !currentBgColors.length) return
    const updated = processHtml()
    if (!updated) return
    const signature = `${updated.issueHtml}\u0000${updated.fullPageHtml}`
    if (signature !== lastProcessedPreview.current) {
      lastProcessedPreview.current = signature
      activeIssue.newHtml = updated.issueHtml
      handleActiveIssue(activeIssue, activeOption, {
        ...activeContentItem,
        body: updated.fullPageHtml,
      })
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
    
    setRatioIsValid(validRatio)
    return validRatio
  }

  const getContrastTargetMessage = (ratio) => {
    if (ratio < minRatio) return t('form.contrast.feedback.minimum', { required: minRatio })
    if (contrastTarget === 'AAA' && ratio < minAAARatio) {
      return t('form.contrast.feedback.aaa_target_not_met')
    }
    if (ratio >= minAAARatio) return t('form.contrast.feedback.excellent')
    return t('form.contrast.feedback.aa_target_met')
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
    if (hsl) {
      setAutoAdjustFeedbackKey(null)
      setTextColor(hsl)
    }
  }

  // On issue change, extract from original HTML
  useEffect(() => {
    if (!activeIssue || !activeContentItem) {
      return
    }

    let fullPageHtml = activeContentItem.body || ''
    let metadata = {}
    if (activeIssue.metadata) {
      try {
        metadata = JSON.parse(activeIssue.metadata)
      } catch {
        // Use scanner-provided foreground data if metadata is unavailable.
      }
    }

    const relativeTextXpath = metadata.textColorXpath
      ? Contrast.joinXpath(activeIssue.xpath, metadata.textColorXpath)
      : ''
    const contentDoc = new DOMParser().parseFromString(fullPageHtml, 'text/html')
    const issueElement = Html.findElementWithXpath(contentDoc, activeIssue.xpath)
    const scannerTextElement = issueElement
      ? Contrast.findTextColorElement(issueElement, metadata.messageArgs?.[3])
      : null
    const scannerTextXpath = scannerTextElement ? Html.findXpathFromElement(scannerTextElement) : ''
    const metadataFocusXpath = metadata.focusXpath && metadata.focusXpath !== activeIssue.xpath
      ? metadata.focusXpath
      : ''
    const focusXpath = relativeTextXpath || metadataFocusXpath || scannerTextXpath || metadata.focusXpath
    const foregroundElementStyle = Contrast.getComputedStyle(fullPageHtml, focusXpath || activeIssue.xpath)
    const hasFocusedText = Boolean(
      (focusXpath && focusXpath !== activeIssue.xpath) ||
      (activeIssue.status > 0 && activeIssue.newHtml !== ''))

    const sizeFromScanner = Number(metadata.messageArgs?.[1])
    const weightFromScanner = metadata.messageArgs?.[2]
    const textStyleForThreshold = Number.isFinite(sizeFromScanner) && weightFromScanner !== undefined
      ? { fontSize: `${sizeFromScanner}px`, fontWeight: weightFromScanner }
      : foregroundElementStyle
    const isLarge = isLargeText(textStyleForThreshold)
    setMinRatio(isLarge ? 3 : 4.5)
    setMinAAARatio(isLarge ? 4.5 : 7)

    const tempBackgroundColors = getBackgroundColors()
    setOriginalBgColors(tempBackgroundColors)
    setCurrentBgColors(tempBackgroundColors.map(bg => bg.hsl))

    let tempTextColor = getTextColor(foregroundElementStyle, metadata, hasFocusedText)
    setTextColor(tempTextColor)
    setOriginalTextColor(tempTextColor ? { ...tempTextColor } : null)
    
    setShowAllColors(false)
    setAutoAdjustFeedbackKey(null)
    lastProcessedPreview.current = ''
    setActiveOption(FORM_OPTIONS.SET_COLOR)
  }, [activeIssue])

  const updateBackgroundColor = (idx, value) => {
    const hsl = Contrast.toHSL(value)
    setAutoAdjustFeedbackKey(null)
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? hsl : c)
    )
  }

  const handleBackgroundChange = (idx, value) => {
    setAutoAdjustFeedbackKey(null)
    setCurrentBgColors(colors =>
      colors.map((c, i) => i === idx ? Contrast.setLuminance(c, value) : c)
    )
  }

  const handleContrastTarget = (newTarget) => {
    setContrastTarget(newTarget);
    setAutoAdjustFeedbackKey(null);
  }

  useEffect(() => {
    checkFormErrors()
    updatePreview()
  }, [textColor, currentBgColors])

  const handleAutoAdjust = (target) => {
    const targetRatio = Contrast.targetRatioForLevel(contrastTarget, minRatio, minAAARatio)
    setAutoAdjustFeedbackKey(null)
    let didAdjust

    if (target === 'text') {
      const adjustedText = Contrast.findColorForContrast(textColor, currentBgColors, targetRatio)
      if (adjustedText) {
        didAdjust = adjustedText.l !== textColor.l
        if (didAdjust) setTextColor(adjustedText)
        else setAutoAdjustFeedbackKey('form.contrast.auto_adjust.text_already')
      } else {
        setAutoAdjustFeedbackKey('form.contrast.auto_adjust.text_unavailable')
      }
    } else {
      let unadjustableColors = 0
      const adjustedBackgrounds = currentBgColors.map((background) => {
        const adjusted = Contrast.findColorForContrast(background, [textColor], targetRatio)
        if (!adjusted) {
          unadjustableColors += 1
          return background
        }
        return adjusted
      })
      didAdjust = adjustedBackgrounds.some((color, index) => color.l !== currentBgColors[index].l)
      if (didAdjust) setCurrentBgColors(adjustedBackgrounds)
      if (unadjustableColors > 0) {
        setAutoAdjustFeedbackKey(didAdjust
          ? 'form.contrast.auto_adjust.background_partial'
          : 'form.contrast.auto_adjust.background_unavailable')
      } else if (!didAdjust) {
        setAutoAdjustFeedbackKey('form.contrast.auto_adjust.background_already')
      }
    }

  }

  const undoChanges = () => {
    if (!originalTextColor) return
    setTextColor({ ...originalTextColor })
    setCurrentBgColors(originalBgColors.map((color) => ({ ...color.hsl })))
    setAutoAdjustFeedbackKey(null)
  }

  function isLargeText(style) {
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

  const advancedColorControls = (
    <details className="contrast-advanced-options">
      <summary>{t('form.contrast.label.advanced_options')}</summary>
      <div className="contrast-advanced-options-content">
        <div id="contrast-bgcolor-list" className="flex-column">
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
              <DarkIcon className="icon-md secondary" alt="" aria-hidden="true"/>
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
                  setAutoAdjustFeedbackKey(null)
                  setTextColor(Contrast.setLuminance(textColor, e.target.value))
                }}
                />
              <LightIcon className="icon-md secondary" alt="" aria-hidden="true"/>
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
                      getContrastTargetMessage(ratio)
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
                  <DarkIcon className="icon-md secondary" alt="" aria-hidden="true"/>
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
                  <LightIcon className="icon-md secondary" alt="" aria-hidden="true"/>
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
      </div>
    </details>
  )

  return (
    <>
      <section className="contrast-adjustment">
        <div className="flex-row flex-wrap justify-content-between align-items-center gap-2">
          <div className="flex-row align-items-center gap-1">
            <div id="target-level">
              {t('form.contrast.label.target_level')}
            </div>
            <InfoPopover
              t={t}
              title={t('form.contrast.label.target_help')}
              content={t('form.contrast.tooltip.target', { aa: minRatio, aaa: minAAARatio })}
              triggerAriaLabel={t('form.contrast.label.target_help')}
            />
          </div>

          <SliderSelect
            labelId = 'target-level'
            groupName = 'contrastTargetSelect'
            activeOption = {contrastTarget}
            setActiveOption = {handleContrastTarget}
            options = {[
              {name: t('form.contrast.label.target_aa'), value: 'AA'},
              {name: t('form.contrast.label.target_aaa'), value: 'AAA'},]}
            isDisabled = {isDisabled}
          />
        </div>
        <div className="contrast-adjustment-actions">
          <button
            className="btn-small btn-icon-left btn-secondary"
            disabled={isDisabled}
            onClick={() => handleAutoAdjust('background')}
          >
            <MagicIcon className="icon-md" alt="" aria-hidden="true"/>
            {t('form.contrast.label.auto_adjust_all')}
          </button>
          <button
            className="btn-small btn-icon-left btn-secondary"
            disabled={isDisabled}
            onClick={() => handleAutoAdjust('text')}
          >
            <MagicIcon className="icon-md" alt="" aria-hidden="true"/>
            {t('form.contrast.label.auto_adjust_text')}
          </button>
        </div>
        <button
          className="btn-small btn-link contrast-undo-button"
          disabled={isDisabled || !hasColorChanges}
          onClick={undoChanges}
        >
          {t('form.contrast.label.undo_changes')}
        </button>
        {autoAdjustFeedbackKey && (
          <div className="instructions" role="status" aria-live="polite">
            {t(autoAdjustFeedbackKey)}
          </div>
        )}
      </section>

      {advancedColorControls}

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
          {getContrastTargetMessage(contrastRatio || 0)}
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
