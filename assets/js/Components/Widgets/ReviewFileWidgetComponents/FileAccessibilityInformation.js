import React from 'react'
import ContentPageIcon from '../../Icons/ContentPageIcon'
import './FileAccessibilityInformation.css'
import ExternalLinkIcon from '../../Icons/ExternalLinkIcon'

const FileAccessibilityInformation = ({activeFile, getReadableFileType, getReadableFileSize}) => {
  return (
    <div className='file-accessibility-info-wrapper w-100 p-2'>   
        <div className='accessibility-info-container flex-column w-100'>
        <div className='original-file-info p-2'>
            <div className='current-file-container flex-row gap-1 align-items-center'>
                <p className='current-file-tag'>Current File</p>
                <p className={`status ${activeFile.reviewed ? 'status-reviewed' : ''} fw-bold pl-1 pr-1`}>{activeFile.reviewed ? 'Reviewed' : 'In Progress'}</p>
            </div>
            
            <div className='flex-row gap-1 align-items-start'>
                <ContentPageIcon className='file-icon icon-md p-2' />
                <div className='flex-column'>
                    <div className='file-name2 flex-row align-items-center gap-1'>
                        <a href={activeFile.lmsUrl} target='_blank' className='file-name-link'>{activeFile.fileName}</a>
                        <ExternalLinkIcon className="icon-sm link-color" />
                    </div>
                    <div className='file-details flex-row gap-1'>
                        <div>File Type: <span className='fw-bold'>{getReadableFileType(activeFile.fileType)}</span> </div>
                        <div>File Size: <span className='fw-bold'>{getReadableFileSize(activeFile.fileSize)}</span> </div>
                    </div>
                </div>
            </div>
        </div>

        <div className='accessibility-instructions-container w-100 flex-row p-2 justify-content-between'>
            <p>Ensure this file meets accessibility standards for PDFs (proper headings, alt text)w</p>
            <button className='accessibility-btn'>Show Accessibility Guidelines</button>
        </div>
    </div>
    </div>
 
  )
}

export default FileAccessibilityInformation