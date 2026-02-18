import React, { useState, useEffect } from 'react'
import BarrierInformation from './BarrierInformation'
import FileForm from '../Forms/FileForm'
import StatusPill from './StatusPill'
import { formFromIssue } from '../../Services/Ufixit'
import './UfixitWidget.css'



export default function UfixitWidget({
  t,
  settings,

  activeContentItem,
  handleActiveContentItem,
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
  showLearnMore,
  clickedInfo,
  setClickedInfo,
  handleContentIssueSave,
  setElementFocus
}) {

  const [UfixitForm, setUfixitForm] = useState(null)
  const [activeOption, setActiveOption] = useState('')
  const [formErrors, setFormErrors] = useState({})

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
    //triggerLiveUpdate()
  }

  useEffect(() => {
    let invalid = false
    
    if(activeOption === '') {
      invalid = true
    }
    else if(!markAsReviewed) {
      Object.keys(formErrors).forEach(optionKey => {
        if(formErrors[optionKey].length > 0) {
          for(let i = 0; i < formErrors[optionKey].length; i++) {
            if(formErrors[optionKey][i].type === 'error') {
              invalid = true
              break
            }
          }
        }
      })
    }
    setFormInvalid(invalid)
  }, [formErrors, activeOption, markAsReviewed])

  const handleOptionChange = (option) => {
    setActiveOption(option)

    if (option === settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED) {     
      setMarkAsReviewed(true)
    }
    else {
      setMarkAsReviewed(false)
    }
  }

  const fullHtml = activeContentItem?.body

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

            <div className="flex-row justify-content-between mt-3 mb-2">
              <h3 className="ufixit-widget-label m-0 align-self-center">{t('fix.label.barrier_repair')}</h3>
              <div className="align-self-start flex-shrink-0">
                <StatusPill
                  t={t}
                  settings={settings}
                  issue={tempActiveIssue} />
              </div>
            </div>
            <div className="flex-column gap-1 flex-grow-1">
              <UfixitForm
                t={t}
                settings={settings}

                activeIssue={tempActiveIssue.issueData}
                activeContentItem={activeContentItem}
                handleActiveContentItem={handleActiveContentItem}
                addMessage={addMessage}
                handleActiveIssue={handleActiveIssue}
                handleIssueSave={handleIssueSave}
                isContentLoading={isContentLoading}
                isDisabled={isContentLoading || !isErrorFoundInContent}
                markAsReviewed={markAsReviewed}
                setMarkAsReviewed={setMarkAsReviewed}
                activeOption={activeOption}
                setActiveOption={handleOptionChange}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                clickedInfo={clickedInfo}
                setClickedInfo={setClickedInfo}
                handleContentIssueSave={handleContentIssueSave}
                setElementFocus={setElementFocus} />
            </div>
          </div>
        </>
      ) : ''}
    </>
  )
}