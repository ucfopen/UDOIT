import React from 'react';
import ResolvedIcon from './Icons/ResolvedIcon';
import './FixIssuesResolve.css'

export default function FixIssuesResolve({
  t,
  settings,
  isSaving,
  isDisabled,
  activeIssue,
  handleFileResolve,
  handleIssueResolve
}) {

  const handleClick = () => {
    if(activeIssue.contentType === settings.FILTER.FILE_OBJECT) {
      handleFileResolve(activeIssue.fileData)
    } else {
      handleIssueResolve(activeIssue.issueData)
    }
  }

  return (
    <div className="ufixit-widget-resolve-container mt-3">
      <div className="ufixit-widget-resolve-description">
        { (activeIssue.status === settings.FILTER.RESOLVED || activeIssue.status === settings.FILTER.FIXEDANDRESOLVED)
          ? t(`fix.msg.unresolved`) 
          : t(`fix.msg.resolved`)
        }
      </div>
      <div className="flex-row flex-between mt-3">
        <div className="flex-column justify-content-center">
          { (activeIssue.status === settings.FILTER.RESOLVED || activeIssue.status === settings.FILTER.FIXEDANDRESOLVED) 
            ? <ResolvedIcon alt="" className="color-success icon-lg"/>
            : ''
          }
        </div>
        <div className="flex-column justify-content-center">
          <button className="btn btn-secondary align-self-start"
            onClick={() => handleClick()}
            disabled={isDisabled || isSaving}
            tabindex="0">
            { (activeIssue.status === settings.FILTER.RESOLVED || activeIssue.status === settings.FILTER.FIXEDANDRESOLVED) 
              ? t(`fix.button.unresolved`)
              : t(`fix.button.resolved`)
            }
          </button>
        </div>
      </div>
    </div>
  )
}