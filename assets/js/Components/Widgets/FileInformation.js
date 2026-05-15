import React from 'react'
import ContentPageIcon from '../Icons/ContentPageIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import FileTypeIcon from '../Icons/FileTypeIcon'

const FileInformation = (
{
    t,
    file
}
) => {
    

  return (
    <>
    {file && <div className='flex-row gap-2 align-items-start'>
        <FileTypeIcon type={file.fileIconType} className="icon-md icon-block no-fill" aria-hidden="true"/>
        <div className='flex-column font-smaller w-100'>
            {file?.fileLink ?  
            <a href={file.fileLink} target='_blank'>
                <div className='flex-row align-items-center justify-content-between gap-1'>
                    {file.fileName}
                    <ExternalLinkIcon className="icon-sm link-color align-self-start" aria-hidden="true"/>
                </div>
            </a>
            :  
            <div>{file.fileName}</div>
            }
            <div className='font-smaller flex-row pt-1 mt-2 border-top gap-2'>
                <div>{t("form.file.label.file_type")}: <span className='fw-bold'>{file.fileType}</span> </div>
                <div>{t("form.file.label.file_size")}: <span className='fw-bold'>{file.fileSize}</span> </div>
            </div>
        </div>
    </div>}
    </>
  )
}

export default FileInformation