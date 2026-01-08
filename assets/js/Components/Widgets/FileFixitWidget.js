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
    <div className="ufixit-widget w-100 flex-column flex-grow-1">
      <h4>Resolve Issue</h4>
      <div>Upload a new version of the file if the current one has accessibility issues.</div>
    </div>
  )
}