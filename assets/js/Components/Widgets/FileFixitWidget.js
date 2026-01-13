import React, { useState, useEffect } from 'react'
import BarrierInformation from './BarrierInformation'
import FileForm from '../Forms/FileForm'
import './UfixitWidget.css'


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
  getReadableFileType
}) {

  return (
    <div className="ufixit-widget flex-column flex-grow-1">
       <div className="flex-column gap-1">
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
          />
       </div>
    </div>
  )
}