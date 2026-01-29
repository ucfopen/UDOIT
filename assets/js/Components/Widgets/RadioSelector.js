import React from 'react'
import './FixIssuesContentPreview.css'

export default function RadioSelector({
  activeOption,
  isDisabled,
  setActiveOption,
  option,
  labelId = '',
  labelText
}) {
    
  return (
    <label id={labelId} className={`option-label` + (isDisabled ? ' disabled' : '')}>
      <input
        type="radio"
        id={option}
        name="ufixitRadioOption"
        tabIndex="0"
        checked={activeOption === option}
        disabled={isDisabled}
        onChange={() => {
          setActiveOption(option)
        }} />
      {labelText}
    </label>
  )
}