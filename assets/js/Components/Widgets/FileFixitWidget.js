import React, { useState, useEffect } from 'react'
import BarrierInformation from './BarrierInformation'
import StatusPill from './StatusPill'
import FileForm from '../Forms/FileForm'
import './UfixitWidget.css'
import CheckIcon from '../Icons/CheckIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'
import SeverityIssueIconFilled from '../Icons/SeverityIssueIconFilled'


export default function FileFixitWidget({
  t,
  settings,
  sessionFiles,
  tempActiveIssue,
  uploadedFile,
  setUploadedFile,
  isDisabled,
  setIsDisabled,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid,
  getReadableFileType,
  handleFileResolveWrapper,
  setMarkDelete,
  markDelete,
  setMarkRevert,
  markRevert,
  handleLearnMoreClick,
  showLearnMore
}) {

  return (
    <div className="ufixit-widget flex-column flex-grow-1"  
      aria-hidden={showLearnMore ? "false" : "true"}
      style={{ display: showLearnMore ? "none" : "flex" }}>

      <BarrierInformation
        t={t}
        settings={settings}
        tempActiveIssue={tempActiveIssue}
        handleLearnMoreClick={handleLearnMoreClick}
      />

      <div className='flex-row justify-content-between mt-3 mb-3'>
        <h3 className="ufixit-widget-label m-0 align-self-center">{t('form.file.sub_heading')}</h3>
        <div className="align-self-start flex-shrink-0">
          <StatusPill
            t={t}
            settings={settings}
            issue={tempActiveIssue} />
        </div>
      </div>
      <div className="flex-column gap-1 flex-grow-1">
        <FileForm
          t={t}
          settings={settings}
          activeFile={tempActiveIssue.fileData}
          sessionFiles={sessionFiles}
          uploadedFile={uploadedFile}
          setUploadedFile={setUploadedFile}
          isDisabled={isDisabled}
          setIsDisabled={setIsDisabled}
          markAsReviewed={markAsReviewed}
          setMarkAsReviewed={setMarkAsReviewed}
          setFormInvalid={setFormInvalid}
          getReadableFileType={getReadableFileType}
          handleFileResolveWrapper={handleFileResolveWrapper}
          setMarkDelete={setMarkDelete}
          markDelete={markDelete}
          setMarkRevert={setMarkRevert}
          markRevert={markRevert}
        />
      </div>
    </div>
  )
}