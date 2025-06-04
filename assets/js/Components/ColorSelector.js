import React from 'react'
import './ColorSelector.css'

export default function ColorSelector({
  t,
  updateColor
}) {

  // The top row of colors is lighter, designed for backgrounds
  const topRowColors = [
    'ffffff',
    'e4e4e4',
    'fcfac6',
    'dff1d1',
    'ddf9e7',
    'dbe9f7',
    'e5eef6',
    'f7e0f6',
    'f8ebec',
    'f8e5d8',
    'f6e5cf',
  ]
  
  // The bottom row of colors is darker, designed for text
  const bottomRowColors = [
    '000000',
    '2d3b45',
    '7b7a30',
    '528328',
    '13803f',
    '225e9d',
    '2463ce',
    '80227d',
    'dc3545',
    'd04920',
    'bf590a',
  ]

  const handleKeyPressOnColor = (color) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      updateColor('#' + color)
    }
  }

  const renderColors = (colorList, borderColor = null) => {
    return colorList.map((color, i) => {
      
      let style = { backgroundColor: '#' + color }
      if(borderColor) {
        style.borderColor = '#' + borderColor
      }

      return (
        <div
          key={color}
          style={style}
          className="palette-option outline-link"
          tabIndex="0"
          onClick={(e) => updateColor('#' + color)}
          onKeyDown={handleKeyPressOnColor(color)}
          aria-label={t('form.contrast.label.hex_color') + ': ' + color}
          title={t('form.contrast.label.hex_color') + ': ' + color}
        />
      )
    })
  }

  return (
    <div className="mb-3 flex-row justify-content-end">
      <div className="color-selector-container mt-2">
        <div className="mb-1">
          {renderColors(topRowColors)}
        </div>
        <div>
          {renderColors(bottomRowColors, '000000')}
        </div>
      </div>
    </div>
  )
}