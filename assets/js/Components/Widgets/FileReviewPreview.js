import React, { useEffect, useState } from 'react'
import DownloadIcon from '../Icons/DownloadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import ContentTypeIcon from '../Icons/ContentTypeIcon'
import * as Text from '../../Services/Text'
import './FixIssuesContentPreview.css'
import SeverityIcon from '../Icons/SeverityIcon'
import ContentPageIcon from '../Icons/ContentPageIcon'
import FileInformation from './FileInformation'
import FileStatus from './FileStatus'


export default function FixIssuesContentPreview({
  t,
  settings,
  activeIssue,
  getReadableFileType
}) {

  const [fileReferenceHolder, setFileReferenceHolder] = useState([])
  const [currentFile, setCurrentFile] = useState(null)

  useEffect(() => {
    if(activeIssue){
      handleFileReference()
      if(activeIssue.fileData.replacement){
        const tempCurrFile = {
          fileName: activeIssue.fileData.replacement.fileName,
          fileType: getReadableFileType(activeIssue.fileData.replacement.fileType),
          fileSize: Text.getReadableFileSize(activeIssue.fileData.replacement.fileSize),
          fileLink: activeIssue.fileData.replacement.lmsUrl
        }  
        setCurrentFile(tempCurrFile)
        return
      }
      const tempCurrFile = {
        fileName: activeIssue.fileData.fileName,
        fileType: getReadableFileType(activeIssue.fileData.fileType),
        fileSize: Text.getReadableFileSize(activeIssue.fileData.fileSize),
        fileLink: activeIssue.fileData.lmsUrl
      }
      setCurrentFile(tempCurrFile)
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
    



  return (
    <>
     { currentFile && ( 
      <div className='file-accessibility-info-wrapper w-100'>
        <div className='accessibility-info-container flex-column w-100'>
          <div className='file-info p-2'>
            <FileStatus fileStatus={activeIssue.fileData.replacement ? 1 : 0} fileTagText={"Current File"}/>
          </div>
          <FileInformation file={currentFile} />
          <div className='accessibility-instructions-container flex-row p-2 justify-content-between align-items-center gap-2'>
              <p>Ensure this file meets accessibility standards for PDFs (proper headings, alt text)</p>
              <button className='btn-secondary align-self-start flex-shrink-0'>Show Accessibility Guidelines</button>
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
                          <span className={`status-badge ${activeIssue.fileData.replacement ? 'new-file-badge' : 'old-file-status'}`}>
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