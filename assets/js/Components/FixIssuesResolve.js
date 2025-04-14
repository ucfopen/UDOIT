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
    <div className="ufixit-widget-resolve-container">
      <div>{ activeIssue.status === settings.FILTER.RESOLVED
              ? t(`label.unresolved_description`) 
              : t(`label.resolved_description`) }
      </div>
      <div className="flex-row flex-end mt-2">
      { !isSaving ? (
        <button className="btn btn-secondary align-self-start"
          onClick={() => handleClick()}>
          { activeIssue.status === settings.FILTER.RESOLVED ? t(`label.mark_unresolved`) : t(`label.mark_resolved`) }
        </button>
      ) : (
        <>
          <button className="btn btn-secondary disabled">
            { activeIssue.status === settings.FILTER.RESOLVED ? t(`label.mark_unresolved`) : t(`label.mark_resolved`) }
          </button>
        </>
      )}
      </div>
    </div>
  )
}