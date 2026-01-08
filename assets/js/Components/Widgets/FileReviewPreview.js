import React, { useEffect, useState } from 'react'
import DownloadIcon from '../Icons/DownloadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import ContentTypeIcon from '../Icons/ContentTypeIcon'
import * as Text from '../../Services/Text'
import './FixIssuesContentPreview.css'
import SeverityIcon from '../Icons/SeverityIcon'

export default function FixIssuesContentPreview({
  t,
  settings,
  activeIssue,
}) {

  const [fileReferenceHolder, setFileReferenceHolder] = useState([])

  useEffect(() => {
    if(activeIssue){
      handleFileReference()
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