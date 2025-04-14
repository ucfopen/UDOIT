import React, { useState, useEffect } from 'react'
import ProgressBar from './ProgressBar'

import './DailyProgress.css'

export default function DailyProgress({ t, sessionIssues, ISSUE_STATE }) {

  const dailyGoal = 10

  const [dailyIssuesFixed, setDailyIssuesFixed] = useState(0)
  const [percentComplete, setPercentComplete] = useState(0)

  /* The sessionIssues object has keys of the issueIds and values of the issueId's states.
   * For example: { '2': ISSUE_STATE.SAVED, '16': ISSUE_STATE.RESOLVED }  */  
  useEffect(() => {
    let totalIssuesFixed = 0
    if(sessionIssues && Object.keys(sessionIssues).length > 0) {
      for (const issueState of Object.values(sessionIssues)) {
        if(issueState === ISSUE_STATE.SAVED || issueState === ISSUE_STATE.RESOLVED) {
          totalIssuesFixed += 1
        }
      }
    }
    setDailyIssuesFixed(totalIssuesFixed)

    if(totalIssuesFixed >= dailyGoal) {
      setPercentComplete(100)
    }
    else {
      setPercentComplete((totalIssuesFixed / dailyGoal) * 100)
    }
  }, [sessionIssues])

  return (
    <div className="daily-progress-container">
      <div className="daily-progress flex-column">
        <div className="flex-row mb-1 justify-content-between">
          <h3 className="daily-progress-text mt-0 mb-0">{t('label.daily_progress')}</h3>
          <div className="daily-progress-text">{t('label.barriers_resolved', {resolved: dailyIssuesFixed, total: dailyGoal})}</div>
        </div>
        <ProgressBar progress={percentComplete} />
      </div>
    </div>
  )
}
