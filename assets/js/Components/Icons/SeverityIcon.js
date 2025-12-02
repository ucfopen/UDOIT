import React from 'react';
import SeverityIssueIcon from './SeverityIssueIcon';
import SeverityIssueIconFilled from './SeverityIssueIconFilled';
import SeverityPotentialIcon from './SeverityPotentialIcon';
import SeverityPotentialIconFilled from './SeverityPotentialIconFilled';
import SeveritySuggestionIcon from './SeveritySuggestionIcon';
import SeveritySuggestionIconFilled from './SeveritySuggestionIconFilled';

export default function SeverityIcon(props) {
  if(!props.type) {
    return null
  }

  let filled = props?.filled === "true" || false

  // There may or may not already be a className prop, and we want to append, not overwrite it.
  let newProps = {...props}
  if(!newProps.className) {
    newProps.className = ''
  }
  else {
    newProps.className += ' '
  }

  switch(props.type) {
    case('ISSUE'):
      newProps.className += 'udoit-issue'
      if(filled) {
        return <SeverityIssueIconFilled {...newProps} />
      }
      else {
        return <SeverityIssueIcon {...newProps} />
      }
      
    case('POTENTIAL'):
      newProps.className += 'udoit-potential'
      if(filled) {
        return <SeverityPotentialIconFilled {...newProps} />
      }
      else {
        return <SeverityPotentialIcon {...newProps} />
      }
    case('SUGGESTION'):
      newProps.className += 'udoit-suggestion'
      if(filled) {
        return <SeveritySuggestionIconFilled {...newProps} />
      }
      else {
        return <SeveritySuggestionIcon {...newProps} />
      }
    default:
      return null
  }
}