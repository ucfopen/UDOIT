import React from 'react'
import './FixIssuesContentPreview.css'

export default function RadioSelector({
  activeOption,
  isDisabled,
  setActiveOption,
  option,
  name = 'ufixitRadioOption',
  labelId = '',
  labelText
}) {
    
  return (
    <label id={labelId} className={`option-label` + (isDisabled ? ' disabled' : '')}>
      <input
        type="radio"
        id={option}
        name={name}
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