import React, { useEffect } from 'react'
import './SliderSelect.css'

export default function SliderSelect({
  groupName = 'sliderSelect',
  isDisabled = false,
  activeOption = '',
  setActiveOption,
  options = [],
}) {

  /* The expected "options" prop is an array of objects with the following structure:
  {
    name: string (the display name for this option),  
    value: string (key/id for when this option is selected),
  }
  */

  const calculateSliderWidths = () => {
    document.querySelectorAll('.slider-option-container').forEach((tabEl,index)=>{
      const tabElWidth = tabEl.getBoundingClientRect().width.toFixed(2);
      const propertyName = `--tab-${(index + 1)}-width`;
      document.querySelector(`.slider-select`).style.setProperty(`${propertyName}`,`${tabElWidth}px`);
    });
  }

  useEffect(() => {
    calculateSliderWidths()
    window.addEventListener('resize', calculateSliderWidths)
    return () => {
      window.removeEventListener('resize', calculateSliderWidths)
    }
  }, [])

  useEffect(() => {
    // Whenever the options change, we need to recalculate the widths of the slider segments
    calculateSliderWidths()
  }, [activeOption, options])

    
  return (
    <div className={`slider-select ${isDisabled ? 'disabled' : ''}`}>
      {options.map((option) => (
        <div
          key={option.value + '-key'}
          className={`flex-row slider-option-container${activeOption === option.value ? ' active' : ''}`}
          tabIndex="0"
          aria-label={option.name}
          aria-selected={activeOption === option.value}
          onClick={() => {
            setActiveOption(option.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setActiveOption(option.value)
            }
          }}
          role="button"
          >
          <label aria-hidden="true">
            <input
              type="radio"
              id={option.value}
              name={groupName}
              value={option.value}
              checked={activeOption === option.value}
              disabled={isDisabled}
              onChange={() => {
                setActiveOption(option.value)
              }} />
            {option.name}
          </label>
        </div>
      ))}
    </div>
  )
}