import chroma from "chroma-js";
import { findElementWithXpath, findXpathFromElement } from "./Html";

export function toHSL(color) {
  try {
    const chromaColor = chroma(color)
    const [h, s, l] = chromaColor.hsl()
    return { h, s, l }
  } catch {
    const tempDiv = document.createElement('div')
    tempDiv.style.color = color
    document.body.appendChild(tempDiv)
    const computedColor = getComputedStyle(tempDiv).color
    document.body.removeChild(tempDiv)
    try {
      const forcedChromaColor = chroma(computedColor)
      const [forcedH, forcedS, forcedL] = forcedChromaColor.hsl()
      return { h: forcedH, s: forcedS, l: forcedL }
    } catch {
      return { h: 0, s: 0, l: 0 }
    }
  }
}

export function hslToHex(hsl) {
  try {
    return chroma.hsl(hsl.h, hsl.s, hsl.l).hex();
  } catch {
    return null;
  }
}

export function changeLuminance(hsl, dir) {
  if (!hsl || typeof hsl.l !== 'number') return hsl;
  const step = 0.025;
  let newL = hsl.l;
  if (dir === "lighten") {
    newL = Math.min(1, newL + step);
  } else {
    newL = Math.max(0, newL - step);
  }
  return { h: hsl.h, s: hsl.s, l: newL };
}

export function findColorForContrast(color, otherColors, targetRatio) {
  const meetsRatio = (candidate) => otherColors.every((otherColor) =>
    contrastRatio(hslToHex(candidate), hslToHex(otherColor)) >= targetRatio
  )
  if (meetsRatio(color)) return color

  const candidates = []
  ;['lighten', 'darken'].forEach((direction) => {
    let candidate = color
    for (let attempt = 0; attempt < 41; attempt += 1) {
      candidate = changeLuminance(candidate, direction)
      if (meetsRatio(candidate)) {
        candidates.push(candidate)
        break
      }
    }
  })
  if (!candidates.length) return null
  return candidates.sort((first, second) =>
    Math.abs(first.l - color.l) - Math.abs(second.l - color.l)
  )[0]
}

export function targetRatioForLevel(level, aaRatio, aaaRatio) {
  return level === 'AAA' ? aaaRatio : aaRatio
}

const GRADIENT_KEYWORDS = new Set([
  'linear', 'radial', 'conic', 'repeating-linear', 'repeating-radial', 'repeating-conic', 'gradient',
  'to', 'top', 'bottom', 'left', 'right', 'circle', 'ellipse', 'at', 'center', 'from', 'in',
  'hue', 'shorter', 'longer', 'increasing', 'decreasing', 'deg', 'grad', 'rad', 'turn',
  'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'srgb', 'srgb-linear',
  'xyz', 'xyz-d50', 'xyz-d65',
])

export function extractGradientColors(value) {
  const colorFunctions = new Set([
    'rgb', 'rgba', 'hsl', 'hsla', 'lab', 'lch', 'oklab', 'oklch',
    'hwb', 'color', 'color-mix', 'color-contrast', 'device-cmyk',
  ])
  const colors = []
  let index = 0

  while (index < value.length) {
    if (value[index] === '#') {
      const match = value.slice(index).match(/^#[0-9a-fA-F]{3,8}\b/)
      if (match) {
        colors.push(match[0])
        index += match[0].length
        continue
      }
    }

    const match = value.slice(index).match(/^[a-zA-Z][\w-]*/)
    if (!match) {
      index += 1
      continue
    }

    const word = match[0]
    const lowerWord = word.toLowerCase()
    const afterWord = index + word.length
    if (value[afterWord] === '(') {
      if (colorFunctions.has(lowerWord)) {
        let depth = 0
        for (let end = afterWord; end < value.length; end += 1) {
          if (value[end] === '(') depth += 1
          else if (value[end] === ')') {
            depth -= 1
            if (depth === 0) {
              colors.push(value.slice(index, end + 1))
              index = end + 1
              break
            }
          }
        }
        if (depth === 0) continue
      }
      index = afterWord + 1
      continue
    }

    if (!GRADIENT_KEYWORDS.has(lowerWord)) colors.push(word)
    index = afterWord
  }

  return colors
}

export function setLuminance(hsl, value) {
  if (!hsl || typeof hsl.l !== 'number') return hsl;
  const newL = Math.max(0, Math.min(1, value));
  return { h: hsl.h, s: hsl.s, l: newL };
}

export function contrastRatio(back, fore) {
  try {
    return Math.round(chroma.contrast(back, fore) * 100) / 100;
  } catch {
    return 1;
  }
}

export function replaceColorStops(cssValue, sourceColors, replacementColors) {
  if (!Array.isArray(sourceColors) || sourceColors.length !== replacementColors.length) {
    return cssValue
  }

  let searchFrom = 0
  const positions = sourceColors.map((color) => {
    const index = cssValue.indexOf(color, searchFrom)
    if (index !== -1) searchFrom = index + color.length
    return index
  })
  if (positions.some((position) => position < 0)) return cssValue

  let result = cssValue
  for (let index = positions.length - 1; index >= 0; index -= 1) {
    const start = positions[index]
    result = result.slice(0, start) + replacementColors[index] + result.slice(start + sourceColors[index].length)
  }
  return result
}

const isTransparentColor = (color) =>
  !color || color === 'transparent' || /^rgba?\(0\s*,\s*0\s*,\s*0(?:\s*,\s*0)?\)$/i.test(color)

function getInlineBackgroundDeclaration(element) {
  const style = element?.style
  if (!style) return null
  const backgroundImage = style.backgroundImage || ''
  const background = style.background || ''
  const backgroundColor = style.backgroundColor || ''
  if (/(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(backgroundImage)) {
    return { styleValue: backgroundImage, propertyName: 'background-image' }
  }
  if (/(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(background)) {
    return { styleValue: background, propertyName: 'background' }
  }
  if (!isTransparentColor(backgroundColor)) {
    return { styleValue: backgroundColor, propertyName: 'background-color' }
  }
  if (background && !isTransparentColor(background)) {
    return { styleValue: background, propertyName: 'background' }
  }
  return null
}

function getComputedBackgroundDeclaration(html, element) {
  const ownerXpath = findXpathFromElement(element)
  const style = getComputedStyle(html, ownerXpath)
  const backgroundImage = style?.backgroundImage || ''
  if (/(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(backgroundImage)) {
    return { styleValue: backgroundImage, propertyName: 'background-image', ownerXpath }
  }
  const backgroundColor = style?.backgroundColor || ''
  if (!isTransparentColor(backgroundColor)) {
    return { styleValue: backgroundColor, propertyName: 'background-color', ownerXpath }
  }
  return null
}

function declarationMatchesColor(declaration, expectedColor) {
  if (!expectedColor) return false
  const expectedHex = hslToHex(toHSL(expectedColor))?.toLowerCase()
  if (!expectedHex) return false
  return extractGradientColors(declaration.styleValue).some((color) =>
    hslToHex(toHSL(color))?.toLowerCase() === expectedHex
  )
}

export function findBackgroundDeclaration(html, targetXpath, focusXpath = '', expectedColor = '') {
  if (!html || !targetXpath) return null
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const target = findElementWithXpath(doc, targetXpath)
  if (!target) return null

  const focus = focusXpath ? findElementWithXpath(doc, focusXpath) : null
  const findExplicitOnAncestorChain = (start, stopAt = doc.body) => {
    let current = start
    while (current && current !== doc.body) {
      const declaration = getInlineBackgroundDeclaration(current)
      if (declaration) {
        return { ...declaration, ownerXpath: findXpathFromElement(current) }
      }
      if (current === stopAt) break
      current = current.parentElement
    }
    return null
  }

  // Prefer a scanner-identified descendant focus and its local/ancestor background.
  if (focus && target.contains(focus) && focus !== target) {
    const declaration = findExplicitOnAncestorChain(focus, target)
    if (declaration) return declaration
  }

  // Issues may be attached to a wrapper (such as an li) while the colored text and
  // background are on a child span. Prefer descendants matching the scanner-reported
  // background, then the deepest styled text element.
  const descendants = Array.from(target.querySelectorAll('*'))
    .filter((element) => (element.textContent || '').trim() !== '')
    .map((element) => {
      const declaration = getInlineBackgroundDeclaration(element)
      return declaration ? { ...declaration, ownerXpath: findXpathFromElement(element), element } : null
    })
    .filter(Boolean)
  if (descendants.length) {
    const matching = descendants.filter((declaration) => declarationMatchesColor(declaration, expectedColor))
    const candidates = matching.length ? matching : descendants
    return candidates[candidates.length - 1]
  }

  const targetDeclaration = getInlineBackgroundDeclaration(target)
  if (targetDeclaration) {
    return { ...targetDeclaration, ownerXpath: findXpathFromElement(target) }
  }

  // If no styled descendant supplies the background, use the issue's containing scope.
  const ancestorDeclaration = findExplicitOnAncestorChain(target.parentElement)
  if (ancestorDeclaration) return ancestorDeclaration

  // Last resort: find computed backgrounds, checking local text descendants before
  // falling back to the issue's inherited page background.
  const computedCandidates = [
    ...(focus ? [focus] : []),
    ...Array.from(target.querySelectorAll('*')).filter((element) => (element.textContent || '').trim()),
    target,
  ].map((element) => getComputedBackgroundDeclaration(html, element)).filter(Boolean)
  if (computedCandidates.length) {
    const matching = computedCandidates.filter((declaration) => declarationMatchesColor(declaration, expectedColor))
    return (matching.length ? matching : computedCandidates)[0]
  }

  return null
}

export function findTextColorElement(root, expectedColor = '') {
  if (!root) return null
  const elements = [root, ...Array.from(root.querySelectorAll('*'))]
    .filter((element) => (element.textContent || '').trim() !== '')
  const coloredElements = elements.filter((element) => element.style?.color)
  if (expectedColor) {
    const expectedHex = hslToHex(toHSL(expectedColor))?.toLowerCase()
    const matching = coloredElements.filter((element) =>
      hslToHex(toHSL(element.style.color))?.toLowerCase() === expectedHex
    )
    if (matching.length) return matching[matching.length - 1]
  }
  return coloredElements.length ? coloredElements[coloredElements.length - 1] : null
}

export function joinXpath(baseXpath, relativeXpath) {
  const base = typeof baseXpath === 'string' ? baseXpath.replace(/\/+$/, '') : ''
  const relative = typeof relativeXpath === 'string' ? relativeXpath.replace(/^\/+/, '') : ''
  return [base, relative].filter(Boolean).join('/')
}

export function convertHtmlRgb2Hex(html) {
  return html.replace(/rgb\((\d+,\s*\d+,\s*\d+)\)(?=[^<]*>)/ig, (_, rgb) => {
    return '#' + rgb.split(',')
      .map(str => parseInt(str, 10).toString(16).padStart(2, '0'))
      .join('')
  })
}

export function getComputedStyle(html, relativeXpath = '') {
  if ( !html ) return null;

  const tempElementId = 'udoit-temp-contrast-element'

  let elementInDOM = document.getElementById(tempElementId)
  if(!elementInDOM) {
    // If the element isn't already in the DOM, we need to add it so that we can compute styles
    elementInDOM = document.createElement('div')
    elementInDOM.id = tempElementId
    document.body.appendChild(elementInDOM)
  }

  elementInDOM.innerHTML = html;
  let styles = null;

  if (relativeXpath) {
    let relativeElement = findElementWithXpath(elementInDOM, relativeXpath);
    if (relativeElement) {
      styles = window.getComputedStyle(relativeElement);
    }
  }
  if (!styles) {
    styles = window.getComputedStyle(elementInDOM);
  }
  // For some reason, the styles object gets cleared when we remove the element from the DOM,
  // so we need to make a copy of it before removing the element
  let deepCopy = Object.assign({}, styles);
  elementInDOM.remove();

  return deepCopy;
}
