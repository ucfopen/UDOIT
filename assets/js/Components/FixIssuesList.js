import React, { useState, useEffect, useRef } from 'react'

import ContentTypeIcon from './Icons/ContentTypeIcon'
import SeverityIcon from './Icons/SeverityIcon'
import ResolvedIcon from './Icons/ResolvedIcon'
import FixedIcon from './Icons/FixedIcon'

import './FixIssuesList.css'

export default function FixIssuesList({ t, settings, filteredIssues, setActiveIssue }) {

  const [groupedList, setGroupedList] = useState([])

  useEffect(() => {
    console.log("FixIssuesList caught a change in filteredIssues")
    const tempGroupedList = []

    // Get all of the issues' "formLabel" values
    const formLabels = filteredIssues.map((issue) => issue.formLabel)
    const uniqueFormLabels = [...new Set(formLabels)]

    uniqueFormLabels.sort((a, b) => {
      return (a.toLowerCase() < b.toLowerCase()) ? -1 : 1
    })

    // Group the issues by "formLabel"
    uniqueFormLabels.forEach((formLabel) => {
      const issues = filteredIssues.filter((issue) => issue.formLabel === formLabel)
      tempGroupedList.push({ formLabel: formLabel, issues })
    })
    
    setGroupedList(tempGroupedList)
    console.log("Setting new Grouped List!")

  }, [filteredIssues])

  return (
    <div className="ufixit-list-container flex-column">
      <div className="ufixit-list-scrollable flex-grow-1" tabindex="-1">
        { groupedList.length > 0 ? groupedList.map((group, i) => {
          return (
            <div className="ufixit-list-section-container" key={i}>
              <div className="ufixit-list-heading allow-word-break">
                <h3>{group.formLabel}</h3>
              </div>
              { group.issues.map((issue, j) => {
                return (
                  <div
                    className="ufixit-list-item flex-row justify-content-between"
                    key={j}
                    onClick={() => setActiveIssue(issue)}
                    onKeyDown={(event) => {
                      if(event.key === 'Enter' || event.key === ' ') {
                        setActiveIssue(issue)
                      }
                    }}
                    tabindex="0" >
                    <div className="flex-grow-1 flex-column justify-content-center allow-word-break">
                      {issue.contentTitle}
                    </div>
                    <div className="flex-row">
                      <div className="flex-column justify-content-center ml-3">
                        <ContentTypeIcon type={issue.contentType} alt="" className="gray"/>
                      </div>
                      { issue.status === settings.FILTER.ACTIVE && (
                        <div className="flex-column justify-content-center ml-2">
                          <SeverityIcon type={issue.severity} alt="" />
                        </div>
                      )}
                      { issue.status === settings.FILTER.RESOLVED && (
                        <div className="flex-column justify-content-center ml-2">
                          <ResolvedIcon alt="" className="color-success" />
                        </div>
                      )}
                      { issue.status === settings.FILTER.FIXED && (
                        <div className="flex-column justify-content-center ml-2">
                          <FixedIcon alt=""className="color-success" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        }) : (
          <div className="flex-column gap-3 mt-3">
            <div className="flex-row justify-content-center align-self-center ms-3 me-3">
              <h2 className="mt-0 mb-0 primary-dark">{t('report.label.no_results')}</h2>
            </div>
            <div className="flex-row justify-content-center align-self-center ms-3 me-3">
              {t('report.msg.no_results')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}