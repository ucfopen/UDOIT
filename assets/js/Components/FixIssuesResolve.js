import React from 'react';
import './FixIssuesResolve.css'

export default function FixIssuesResolve({ t, settings, isSaving, activeIssue, handleIssueResolve }) {

  return (
    <div className="ufixit-widget-resolve-container">
      <div>{ activeIssue.status === settings.FILTER.RESOLVED
              ? t(`label.unresolved_description`) 
              : t(`label.resolved_description`) }
      </div>
      <div className="flex-row flex-between mt-3">
      { !isSaving ? (
        <button className="btn btn-secondary align-self-start"
          onClick={() => handleIssueResolve(activeIssue.issue)}>
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