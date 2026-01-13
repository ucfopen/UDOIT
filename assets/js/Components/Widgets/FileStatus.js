import React from 'react'
import './FileStatus.css'

const FileStatus = ({
    fileStatus
}) => {
  return (
    <div className='current-file-container flex-row gap-1 align-items-center'>
        <p className='current-file-tag'>Current File</p>
        <span className={`status-badge-current ${fileStatus == 1 ? 'status-new' : 'status-old'}`}>{fileStatus == 1 ? "New" : "Original"}</span>
    </div>
    )
}

export default FileStatus