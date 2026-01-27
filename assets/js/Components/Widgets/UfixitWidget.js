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
  isErrorFoundInContent,
  setTempActiveIssue,
  tempActiveIssue,
  triggerLiveUpdate,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid,
  handleLearnMoreClick,
  showLearnMore
}) {

  const [UfixitForm, setUfixitForm] = useState(null)

  useEffect(() => {
    if(!tempActiveIssue) {
      setUfixitForm(null)
      setMarkAsReviewed(false)
      return
    }

    if(tempActiveIssue.isModified === undefined) {
      setMarkAsReviewed(tempActiveIssue.status === settings.ISSUE_FILTER.RESOLVED || tempActiveIssue.status === settings.ISSUE_FILTER.FIXEDANDRESOLVED)
    }

    if(tempActiveIssue.contentType === settings.ISSUE_FILTER.FILE_OBJECT) {
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

  return (
    <>
      {UfixitForm && tempActiveIssue ? (
        <>
          <div className="ufixit-widget flex-column flex-grow-1"
            aria-hidden={showLearnMore ? "false" : "true"}
            style={{ display: showLearnMore ? "none" : "flex" }}>

            <BarrierInformation
              t={t}
              settings={settings}
              tempActiveIssue={tempActiveIssue}
              handleLearnMoreClick={handleLearnMoreClick}
            />

            <h3 className="ufixit-widget-label">{t('fix.label.barrier_repair')}</h3>
            <div className="flex-column gap-1 flex-grow-1">
              <UfixitForm
                t={t}
                settings={settings}

                activeIssue={tempActiveIssue.issueData}
                activeContentItem={activeContentItem}
                addMessage={addMessage}
                handleActiveIssue={handleActiveIssue}
                handleIssueSave={handleIssueSave}
                isContentLoading={isContentLoading}
                isDisabled={isContentLoading || !isErrorFoundInContent}
                markAsReviewed={markAsReviewed}
                setMarkAsReviewed={setMarkAsReviewed}
                setFormInvalid={setFormInvalid} />
            </div>
          </div>
        </>
      ) : ''}
    </>
  )
}