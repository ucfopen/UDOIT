import React from 'react'
import ContentPageIcon from '../Icons/ContentPageIcon'
import FileTypeIcon from '../Icons/FileTypeIcon'
import * as Text from '../../Services/Text'

const FileInformation = (
{
    t,
    fileData
}
) => {
    
  const fileName = fileData.fileName || fileData.name;
  const fileType = fileData.fileType || fileData.type;
  const fileTypeText = Text.getReadableFileType(t, fileType);
  const fileSize = Text.getReadableFileSize((fileData.fileSize || fileData.size));
  const fileLink = fileData.lmsUrl || null;

  return (
    <>
      {fileData && <div className='flex-row gap-2 align-items-start'>
        <FileTypeIcon type={fileType} className="icon-md icon-block no-fill" aria-hidden="true"/>
        <div className='flex-column font-smaller w-100'>
          { fileLink ?  
            <a href={fileLink} target='_blank' className="fw-bold no-default-underline">
              {fileName}
            </a>
          :  
            <div className="fw-bold">{fileName}</div>
          }
          <div className='font-smaller flex-row gap-1 pt-1'>
            <div className='fw-light'>{fileTypeText}</div>
            <div className='align-items-center'>•</div>
            <div className='fw-light'>{fileSize}</div>
          </div>
        </div>
      </div>}
    </>
  )
}

export default FileInformation