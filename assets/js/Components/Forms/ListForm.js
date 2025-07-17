import React, { useEffect, useState } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html'

export default function ListForm({
  t,
  activeIssue,
  activeContentItem,
  handleIssueSave,
  isDisabled,
 }) {
  
  return (
    <div dangerouslySetInnerHTML={{__html: t('form.review_only.summary')}}></div>
  )
}