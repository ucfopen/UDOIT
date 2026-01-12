import React, { useState, useEffect } from 'react'
import BarrierInformation from './BarrierInformation'
import FileForm from '../Forms/FileForm'
import './UfixitWidget.css'


export default function FileFixitWidget({
  t,
  settings,
  handleFileDelete,
  handleFileResolve,
  handleFileUpload,
  sessionFiles,
  tempActiveIssue,
}) {

  return (
    <div className="ufixit-widget flex-column flex-grow-1">
       <div className="flex-column gap-1">
          <FileForm
            t={t}
            settings={settings}
            handleFileDelete={handleFileDelete}
            activeFile={tempActiveIssue.fileData}
            handleFileResolve={handleFileResolve}
            handleFileUpload={handleFileUpload}
            sessionFiles={sessionFiles}
          />
       </div>
    </div>
  )
}