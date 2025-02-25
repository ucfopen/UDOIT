import React, { useState, useEffect, useRef } from 'react'

import ContentTypeIcon from './Icons/ContentTypeIcon'
import SeverityIcon from './Icons/SeverityIcon'

import './FixissuesList.css'

export default function FixIssuesList({ t, FILTER, filteredIssues, setActiveIssue }) {

  const [groupedList, setGroupedList] = useState([])

  useEffect(() => {
    const tempGroupedList = []

    // Get all of the issues' "scanRuleLabel" values
    const scanRuleLabels = filteredIssues.map((issue) => issue.scanRuleLabel)
    const uniqueScanRuleLabels = [...new Set(scanRuleLabels)]

    // Group the issues by "scanRuleLabel"
    uniqueScanRuleLabels.forEach((scanRuleLabel) => {
      const issues = filteredIssues.filter((issue) => issue.scanRuleLabel === scanRuleLabel)
      tempGroupedList.push({ scanRuleLabel, issues })
    })
    
    setGroupedList(tempGroupedList)

  }, [filteredIssues])

  return (
    <div className="ufixit-list-container flex-column">
      <div className="mb-3 flex-grow-0 flex-shrink-0">
        <h2 className="mt-0 mb-0">{t('label.filter.select.issue')}</h2>
      </div>
      <div className="ufixit-list-scrollable flex-grow-1">
        { groupedList.length > 0 ? groupedList.map((group, i) => {
          return (
            <div className="ufixit-list-section-container" key={i}>
              <div className="ufixit-list-heading">
                <h3>{group.scanRuleLabel}</h3>
              </div>
              { group.issues.map((issue, j) => {
                return (
                  <div className="ufixit-list-item flex-row justify-content-between" key={j} onClick={() => setActiveIssue(issue)}>
                    <div className="flex-grow-1 flex-column justify-content-center">
                      {issue.contentTitle}
                    </div>
                    <div className="flex-row">
                      <div className="flex-column justify-content-center ml-3">
                        <ContentTypeIcon type={issue.contentType} alt="" className="gray"/>
                      </div>
                      <div className="flex-column justify-content-center ml-2">
                        <SeverityIcon type={issue.severity} alt="" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }) : <h2>{t('label.filter.no.issues')}</h2> }
      </div>
    </div>
  )
}