import React from 'react'
import './FileStatus.css'

const FileStatus = ({
    t,
    fileTagText,
    fileStatus
}) => {
  return (
    <div className='current-file-container flex-row gap-1 align-items-center'>
        <p className='current-file-tag'>{fileTagText}</p>
        <span className={`status-badge-current ${fileStatus == 1 ? 'status-new' : 'status-old'}`}>{fileStatus == 1 ? t('form.label.new.tag') : t('form.label.original.tag')  }</span>
    </div>
    )
}

export default FileStatus