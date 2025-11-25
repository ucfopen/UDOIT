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

      {/* Header with File Label */}
      <div className="ufixit-widget-header flex-row justify-content-between mb-3 pb-1">
        <div className="flex-column justify-content-center allow-word-break">
          <h2 className="mt-0 mb-0 primary-text">{tempActiveIssue.formLabel}</h2>
        </div>
      </div>

      {/* Barrier Information with "Learn More" and issue-specific info, where applicable*/}
      <BarrierInformation
        t={t}
        settings={settings}
        tempActiveIssue={tempActiveIssue}
      />

      {/* The "How to Repair This Barrier" area with the form */}
      <div className="ufixit-widget-label primary mb-1">{t('fix.label.barrier_repair')}</div>
      <div className="flex-column flex-grow-1 justify-content-between ufixit-form-content">
        <div className="callout-container">
          <FileForm
            t={t}
            settings={settings}
            
            handleFileDelete={handleFileDelete}
            activeFile={tempActiveIssue.fileData}
            handleFileResolve={handleFileResolve}
            handleFileUpload={handleFileUpload}
            sessionFiles={sessionFiles} />
        </div>
      </div>
    </div>
  )
}