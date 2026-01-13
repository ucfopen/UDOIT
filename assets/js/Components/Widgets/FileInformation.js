import React from 'react'
import ContentPageIcon from '../Icons/ContentPageIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import './FileInformation.css'

const FileInformation = (
{
    file,
    fillColor,
}
) => { 
  return (

    <div className='flex-row gap-1 align-items-start p-2'>
        <ContentPageIcon fill={fillColor ? fillColor : ''}
            className={`${fillColor ? 'file-icon-new' : 'file-icon'} icon-md p-2`} />
        <div className='flex-column'>
            {file.fileLink ?  
            <div className='flex-row align-items-center gap-1'>    
                <a className='file-title' href={file.fileLink} target='_blank'>{file.fileName}</a> 
                <ExternalLinkIcon className="icon-sm link-color"/>
            </div>
            :  
            <div className='font-title'>{file.fileName}</div>
            }
            <div className='file-details flex-row gap-1'>
                <div>File Type: <span className='fw-bold'>{file.fileType}</span> </div>
                <div>File Size: <span className='fw-bold'>{file.fileSize}</span> </div>
            </div>
        </div>
    </div>
  )
}

export default FileInformation