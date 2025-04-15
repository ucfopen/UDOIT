import React from 'react'
import './ColorSelector.css'

export default function ColorSelector({
  t,
  updateColor
}) {

  // The top row of colors is lighter, designed for backgrounds
  const topRowColors = [
    'FFFFFF',
    'E4E4E4',
    'FCFAC6',
    'DFF1D1',
    'DDF9E7',
    'DBE9F7',
    'E5EEF6',
    'F7E0F6',
    'F8EBEC',
    'F8E5D8',
    'F6E5CF',
  ]
  
  // The bottom row of colors is darker, designed for text
  const bottomRowColors = [
    '000000',
    '2D3B45',
    '7B7A30',
    '528328',
    '13803F',
    '225E9D',
    '2463CE',
    '80227D',
    'DC3545',
    'D04920',
    'BF590A',
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
          aria-label={t('label.hex_color') + ': ' + color}
          title={t('label.hex_color') + ': ' + color}
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