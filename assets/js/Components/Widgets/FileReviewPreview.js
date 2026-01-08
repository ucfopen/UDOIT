import React, { useEffect, useState } from 'react'
import DownloadIcon from '../Icons/DownloadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import ContentTypeIcon from '../Icons/ContentTypeIcon'
import * as Text from '../../Services/Text'
import './FixIssuesContentPreview.css'
import SeverityIcon from '../Icons/SeverityIcon'
import ContentPageIcon from '../Icons/ContentPageIcon'


export default function FixIssuesContentPreview({
  t,
  settings,
  activeIssue,
}) {

  const [fileReferenceHolder, setFileReferenceHolder] = useState([])
  const [currentFile, setCurrentFile] = useState(null)

  useEffect(() => {
    if(activeIssue){
      handleFileReference()
      if(activeIssue.fileData.replacement){
        setCurrentFile(activeIssue.fileData.replacement)
        return
      }
      setCurrentFile(activeIssue.fileData)
    }
  }, [activeIssue])

  const handleFileReference = () => {
          let tempReferences = []
  
          activeIssue.fileData.replacement?.references?.forEach((ref) => {
              let tempRef = JSON.parse(JSON.stringify(ref))
              tempRef.status  = 'New File'
              tempReferences.push(tempRef)
          })
  
          activeIssue.fileData.replacement?.sectionRefs?.forEach((ref) => {
              let tempRef = JSON.parse(JSON.stringify(ref))
              tempRef.status  = 'New File'
              tempReferences.push(tempRef)
          })
  
  
          activeIssue.fileData.references?.forEach((ref) => {
              let tempRef = JSON.parse(JSON.stringify(ref))
              tempRef.status  = 'Old File'
              tempReferences.push(tempRef)
          })
  
  
          activeIssue.fileData.sectionRefs?.forEach((ref) => {
              let tempRef = JSON.parse(JSON.stringify(ref))
              tempRef.status  = 'Old File'
              tempReferences.push(tempRef)
          })
  
          setFileReferenceHolder(tempReferences)
       }
    

  const getReadableFileType = (fileType) => {
    switch (fileType) {
      case 'doc':
        return t('label.mime.doc')
      case 'ppt':
        return t('label.mime.ppt')
      case 'xls':
        return t('label.mime.xls')
      case 'pdf':
        return t('label.mime.pdf')
      case 'audio':
        return t('label.mime.audio')
      case 'video':
        return t('label.mime.video')
      default:
        return t('label.mime.unknown')
    }
  }

  return (
    <>
     { currentFile && ( 
      <div className='file-accessibility-info-wrapper w-100'>
        <div className='accessibility-info-container flex-column w-100'>
          <div className='file-info p-2'>
              <div className='current-file-container flex-row gap-1 align-items-center'>
                <p className='current-file-tag'>Current File</p>
                <span className="status-badge">{activeIssue.fileData?.replacement ? "New" : "Original"}</span>
              </div>
          </div>

          <div className='flex-row gap-1 align-items-start p-2'>
            <ContentPageIcon className='file-icon icon-md p-2' />
             <div className='flex-column'>
              <div className='file-name flex-row align-items-center gap-1'>
                  <a href={currentFile.lmsUrl} target='_blank' className='file-name-link'>{currentFile.fileName}</a>
                  <ExternalLinkIcon className="icon-sm link-color" />
              </div>
              <div className='file-details flex-row gap-1'>
                <div>File Type: <span className='fw-bold'>{getReadableFileType(currentFile.fileType)}</span> </div>
                <div>File Size: <span className='fw-bold'>{Text.getReadableFileSize(currentFile.fileSize)}</span> </div>
              </div>
             </div>
          </div>
            <div className='accessibility-instructions-container w-100 flex-row p-2 justify-content-between'>
                <p>Ensure this file meets accessibility standards for PDFs (proper headings, alt text)w</p>
                <button className='accessibility-btn'>Show Accessibility Guidelines</button>
            </div>
        </div>
      </div>)
      }

     <div className="mt-3 rounded-table-wrapper">
      <table className="file-reference-table">
      <thead>
        <tr>
            <th>Content</th>
            <th>Location</th>
            <th>Status</th>
        </tr>
      </thead>
      <tbody>
          {fileReferenceHolder?.map((ref, index) => (
                  <tr key={index}>
                      <td className='content-title'>{ref.contentItemTitle}</td>
                      <td>
                          <a href={ref.contentItemUrl} target='_blank' className='location-link flex-row align-items-center'>
                              External URL
                              <ExternalLinkIcon />
                          </a>
                      </td>
                      <td>
                          <span className="status-badge">
                              {ref.status}
                          </span>
                      </td>
                  </tr>
              ))}
      </tbody>
      </table>
     </div>    </>
  )
}