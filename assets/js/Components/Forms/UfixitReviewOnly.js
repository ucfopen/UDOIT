import React, { useEffect, useState } from 'react'

export default function UfixitReviewOnly({
  t, 
  settings, 
  activeIssue, 
  handleIssueSave, 
  addMessage, 
  handleActiveIssue
}) {

  return (
    <div>
      {t('form.review_only.learn_more')}
    </div>
  )
}