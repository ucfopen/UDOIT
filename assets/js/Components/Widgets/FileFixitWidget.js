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
    </div>
  )
}