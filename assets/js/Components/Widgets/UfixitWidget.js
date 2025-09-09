import React, { useState, useEffect } from 'react'
import BarrierInformation from './BarrierInformation'
import FileForm from '../Forms/FileForm'
import { formFromIssue } from '../../Services/Ufixit'
import './UfixitWidget.css'


export default function UfixitWidget({
  t,
  settings,

  activeContentItem,
  addMessage,
  handleIssueSave,
  isContentLoading,
  isErrorFoundInContent = false,
  setTempActiveIssue,
  tempActiveIssue,
  triggerLiveUpdate
}) {

  const [UfixitForm, setUfixitForm] = useState(null)
  const [markAsReviewed, setMarkAsReviewed] = useState(false)

  useEffect(() => {
    if(!tempActiveIssue) {
      setUfixitForm(null)
      setMarkAsReviewed(false)
      return
    }

    if(tempActiveIssue.isModified === undefined) {
      setMarkAsReviewed(tempActiveIssue.status === settings.FILTER.RESOLVED || tempActiveIssue.status === settings.FILTER.FIXEDANDRESOLVED)
    }

    if(tempActiveIssue.contentType === settings.FILTER.FILE_OBJECT) {
      setUfixitForm(() => { return FileForm })
    }
    else {
      setUfixitForm(() => formFromIssue(tempActiveIssue.issueData))
    }
  }, [tempActiveIssue])

  const handleActiveIssue = (newIssue) => {
    const tempIssue = Object.create(tempActiveIssue)
    tempIssue.issueData = newIssue
    tempIssue.isModified = newIssue?.isModified || false
    setTempActiveIssue(tempIssue)
    triggerLiveUpdate()
  }

  const interceptIssueSave = (issue) => {
    handleIssueSave(issue, markAsReviewed)
  }

  return (
    <>
      {UfixitForm && tempActiveIssue ? (
        <>
          <div className="ufixit-widget flex-column flex-grow-1">
            {/* The header with the issue name and severity icon */}
            <div className="ufixit-widget-header flex-row justify-content-between mb-3 pb-1">
              <div className="flex-column justify-content-center allow-word-break">
                <h2 className="mt-0 mb-0 primary-text">{tempActiveIssue.formLabel}</h2>
              </div>
            </div>

            <BarrierInformation
              t={t}
              settings={settings}
              tempActiveIssue={tempActiveIssue}
            />

            <div className="ufixit-widget-label primary mb-1">{t('fix.label.barrier_repair')}</div>
            <div className="flex-column flex-grow-1 justify-content-between ufixit-form-content">
              <div className="callout-container">
                <UfixitForm
                  t={t}
                  settings={settings}

                  activeIssue={tempActiveIssue.issueData}
                  activeContentItem={activeContentItem}
                  addMessage={addMessage}
                  handleActiveIssue={handleActiveIssue}
                  handleIssueSave={interceptIssueSave}
                  isContentLoading={isContentLoading}
                  isDisabled={markAsReviewed || isContentLoading || !isErrorFoundInContent}
                  markAsReviewed={markAsReviewed}
                  setMarkAsReviewed={setMarkAsReviewed} />
              </div>
            </div>
          </div>
        </>
      ) : ''}
    </>
  )
}