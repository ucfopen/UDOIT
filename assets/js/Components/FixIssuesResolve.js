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
      <div className="flex-row flex-between mt-2">
        <div className="flex-row justify-content-end flex-grow-1 mt-1 me-2">
          { (activeIssue.status === settings.FILTER.RESOLVED || activeIssue.status === settings.FILTER.FIXEDANDRESOLVED) 
            ? <div className="data-pill transparent fixed flex-row">
                <ResolvedIcon className="color-success icon-md flex-column align-self-center"/>
                <div className="data-pill-text">{t('filter.label.resolution.resolved_single')}</div>
              </div>
            : ''
          }
        </div>
        <div className="flex-column justify-content-center">    
          { (activeIssue.status === settings.FILTER.RESOLVED || activeIssue.status === settings.FILTER.FIXEDANDRESOLVED) 
            ? (<button className="btn-secondary align-self-start"
                onClick={() => handleClick()}
                disabled={isDisabled || isSaving}
                tabindex="0">{t(`fix.button.unresolved`)}
              </button>)
            : (<button className="btn-icon-left btn-secondary align-self-start"
                onClick={() => handleClick()}
                disabled={isDisabled || isSaving}
                tabindex="0">
                <ResolvedIcon className="icon-md" />{t(`fix.button.resolved`)}
              </button>)
          }
        </div>
      </div>
    </div>
  )
}