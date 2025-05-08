import React from 'react';
import SeverityIssueIcon from './SeverityIssueIcon';
import SeverityPotentialIcon from './SeverityPotentialIcon';
import SeveritySuggestionIcon from './SeveritySuggestionIcon';

export default function SeverityIcon(props) {
  if(!props.type) {
    return null
  }

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
      return <SeverityIssueIcon {...newProps} />
    case('POTENTIAL'):
      newProps.className += 'udoit-potential'
      return <SeverityPotentialIcon {...newProps} />
    case('SUGGESTION'):
      newProps.className += 'udoit-suggestion'
      return <SeveritySuggestionIcon {...newProps} />
    default:
      return null
  }
}