import React, { useState, useEffect } from 'react'
import BarrierInformation from './BarrierInformation'
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
  handleFileResolveWrapper
}) {

  return (
    <div className="ufixit-widget flex-column flex-grow-1">
       <div className="flex-column gap-1">
        <div className='review-status flex-row gap-1 align-items-center'>
          <h3>Review File</h3>
          <div className={`file-review-status-container ${tempActiveIssue.fileData.reviewed ? 'file-reviewed' : 'file-progress'} flex-row align-items-center p-2 gap-1`}>
              {tempActiveIssue.fileData.reviewed ? <CheckIcon fill={'var(--primary-color)'} /> : <SeverityIssueIconFilled fill={'var(--potential-color)'} />}
              <div>{tempActiveIssue.fileData.reviewed ? 'Reviewed' : 'Needs Review'}</div>
          </div>
        </div>
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
          />
       </div>
    </div>
  )
}