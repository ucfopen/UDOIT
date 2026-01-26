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
import ProgressIcon from '../Icons/ProgressIcon'
import DownwardArrowIcon from '../Icons/DownwardArrowIcon'

export default function FixIssuesContentPreview({
  t,
  settings,
  activeIssue,
  getReadableFileType,
  isDisabled
}) {

  const [fileReferenceHolder, setFileReferenceHolder] = useState([])
  const [currentFile, setCurrentFile] = useState(null)
  const [oldFile, setOldFile] = useState(null)

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
      }
      const tempCurrFile = {
        fileName: activeIssue.fileData.fileName,
        fileType: getReadableFileType(activeIssue.fileData.fileType),
        fileSize: Text.getReadableFileSize(activeIssue.fileData.fileSize),
        fileLink: activeIssue.fileData.lmsUrl
      }
      if(!activeIssue.fileData.replacement){
          setCurrentFile(tempCurrFile)
      }
      setOldFile(tempCurrFile)
      
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
    {isDisabled ? 
    <div className="flex-column h-100 flex-grow-1 justify-content-center">
      <div className="flex-row justify-content-center mb-4">
        <div className="flex-column justify-content-center">
          <ProgressIcon className="icon-lg udoit-suggestion spinner" />
        </div>
        <div className="flex-column justify-content-center ms-3">
          <h2 className="mt-0 mb-0">{t('fix.label.loading_content')}</h2>
        </div>
      </div>
    </div> 
    :
    <div>
    {activeIssue.fileData.replacement ? 
      <div className='flex-column w-100 justify-content-center gap-1 align-items-center'>
        <div className='file-accessibility-info-wrapper w-100'>
          <div className='accessibility-info-container flex-column w-100'>
            <div className='file-info p-2'>
              <FileStatus t={t} fileStatus={0} fileTagText={t('form.file.current.label')}/>
            </div>
            <FileInformation t={t} file={oldFile} />
          </div>
        </div>
        <DownwardArrowIcon className="icon-md text-center" />        
        <div className='file-accessibility-info-wrapper w-100'>
          <div className='accessibility-info-container flex-column w-100'>
            <div className='file-info p-2'>
              <FileStatus t={t} fileStatus={1} fileTagText={t('form.file.new.label')}/>
            </div>
            <FileInformation t={t} file={currentFile} />
          </div>
        </div>
      </div>
    : currentFile && ( 
      <div className='file-accessibility-info-wrapper w-100'>
        <div className='accessibility-info-container flex-column w-100'>
          <div className='file-info p-2'>
            <FileStatus t={t} fileStatus={activeIssue.fileData.replacement ? 1 : 0} fileTagText={"Current File"}/>
          </div>
          <FileInformation t={t} file={currentFile} />
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
     </div>
    </div> }
    </>
  )
}