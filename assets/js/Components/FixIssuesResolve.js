import React from 'react';
import './FixIssuesResolve.css'

export default function FixIssuesResolve({ t, settings, isSaving, activeIssue, handleFileResolve, handleIssueResolve }) {

  const handleClick = () => {
    if(activeIssue.contentType === settings.FILTER.FILE_OBJECT) {
      handleFileResolve(activeIssue.fileData)
    } else {
      handleIssueResolve(activeIssue.issueData)
    }
  }

  return (
    <div className="ufixit-widget-resolve-container mt-3">
      <div className="ufixit-widget-resolve-description">{ activeIssue.status === settings.FILTER.RESOLVED
              ? t(`fix.msg.unresolved`) 
              : t(`fix.msg.resolved`) }
      </div>
      <div className="flex-row flex-end mt-3">
        <button className="btn btn-secondary align-self-start"
          onClick={() => handleClick()}
          disabled={isSaving}>
          { activeIssue.status === settings.FILTER.RESOLVED ? t(`fix.button.unresolved`) : t(`fix.button.resolved`) }
        </button>
      </div>
    </div>
  )
}