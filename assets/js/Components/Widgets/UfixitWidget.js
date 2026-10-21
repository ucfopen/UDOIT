import React, { useState, useEffect } from 'react'
import DecisionQuestion from './DecisionQuestion'
import DecisionHelpButton from './DecisionHelpButton'
import IssueAffects from './IssueAffects'
import { formNameFromRule } from '../../Services/Ufixit'
import './UfixitWidget.css'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function UfixitWidget({
  t,
  instanceInfo,
  UfixitForm,
  activeContentItem,
  activeOption,
  setActiveOption,
  addMessage,
  handleIssueSave,
  isContentLoading,
  isErrorFoundInContent,
  handleTempActiveIssue,
  tempActiveIssue,
  setFormInvalid,
  showLearnMore,
  handleLearnMoreClick,
  clickedInfo,
  setClickedInfo,
  setElementFocus,
  setPreviewData,
  saveDisabled
}) {

  const [formErrors, setFormErrors] = useState({})

  const handleActiveIssue = (newIssue, optionOverride = activeOption, contentItem = null) => {
    const tempIssue = Object.assign({}, tempActiveIssue)
    tempIssue.issueData = newIssue
    handleTempActiveIssue(tempIssue, optionOverride, contentItem)
  }

  const doesIssueBelongToForm = (formName, issueData = tempActiveIssue?.issueData) => {
    if(!issueData || !formName) {
      return false
    }
    const issueForm = formNameFromRule(issueData.scanRuleId)
    return issueForm === formName
  }

  useEffect(() => {
    let invalid = false
    
    if(activeOption === '') {
      invalid = true
    }
    else {
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
  }, [formErrors, activeOption])

  const handleOptionChange = (option) => {
    setActiveOption(option)
  }

  return (
    <>
      {UfixitForm && tempActiveIssue ? (
        <>
          <div
            className={`ufixit-widget flex-column flex-grow-1 ${showLearnMore ? 'hidden' : ''}`}
            inert={showLearnMore ? true : undefined}
            aria-hidden={showLearnMore ? true : false}
          >

            <IssueAffects
              t={t}
              tempActiveIssue={tempActiveIssue}
            />

            <DecisionQuestion
              t={t}
              tempActiveIssue={tempActiveIssue}
              handleLearnMoreClick={handleLearnMoreClick}
            />

            <div className="flex-column gap-1">
              <UfixitForm
                t={t}
                instanceInfo={instanceInfo}
                activeIssue={tempActiveIssue.issueData}
                activeContentItem={activeContentItem}
                addMessage={addMessage}
                handleActiveIssue={handleActiveIssue}
                handleIssueSave={handleIssueSave}
                isContentLoading={isContentLoading}
                isDisabled={isContentLoading || (!isErrorFoundInContent && activeOption !== UFIXIT_OPTIONS.DELETE_ELEMENT)}
                doesIssueBelongToForm={doesIssueBelongToForm}
                activeOption={activeOption}
                setActiveOption={handleOptionChange}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                clickedInfo={clickedInfo}
                setClickedInfo={setClickedInfo}
                setElementFocus={setElementFocus}
                setPreviewData={setPreviewData}
                handleLearnMoreClick={handleLearnMoreClick} />

              <DecisionHelpButton
                t={t}
                tempActiveIssue={tempActiveIssue}
                handleLearnMoreClick={handleLearnMoreClick}
              />
            </div>
            <div className="mt-3 w-100 flex-row justify-content-center">
              <button
                onClick={handleIssueSave}
                className="btn btn-primary btn-icon-left"
                disabled={saveDisabled}
                tabIndex="0">
                {t('form.submit')}
              </button>
            </div>
          </div>
        </>
      ) : ''}
    </>
  )
}