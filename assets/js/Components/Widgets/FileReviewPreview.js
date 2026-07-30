import React, { useEffect, useState } from 'react'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import * as Text from '../../Services/Text'
import './FixIssuesContentPreview.css'
import FileInformation from './FileInformation'
import ProgressIcon from '../Icons/ProgressIcon'
import DownwardArrowIcon from '../Icons/DownwardArrowIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'

export default function FixIssuesContentPreview({
  t,
  activeIssue,
  getReadableFileType,
  isDisabled
}) {

  const [fileReferenceHolder, setFileReferenceHolder] = useState({})
  const [singleReferencesOnly, setSingleReferencesOnly] = useState(true)
  const [currentFile, setCurrentFile] = useState(null)
  const [oldFile, setOldFile] = useState(null)

  const ORIGINAL_LABEL = "-original"
  const REPLACED_LABEL = "-replaced"

  useEffect(() => {
    if(activeIssue){
      handleFileReference()
      if(activeIssue.fileData.replacement){
        const tempCurrFile = {
          fileName: activeIssue.fileData.replacement.fileName,
          fileType: getReadableFileType(activeIssue.fileData.replacement.fileType),
          fileIconType: activeIssue.fileData.replacement.fileType,
          fileSize: Text.getReadableFileSize(activeIssue.fileData.replacement.fileSize),
          fileLink: activeIssue.fileData.replacement.lmsUrl
        }  
        setCurrentFile(tempCurrFile)
      }
      const tempCurrFile = {
        fileName: activeIssue.fileData.fileName,
        fileType: getReadableFileType(activeIssue.fileData.fileType),
        fileIconType: activeIssue.fileData.fileType,
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
    let tempReferences = {}

    activeIssue.fileData.replacement?.references?.forEach((ref) => {
      let tempRef = JSON.parse(JSON.stringify(ref))
      tempRef.status  = 1
      const refKey = tempRef.contentItemId + REPLACED_LABEL
      if(!tempReferences[refKey]){
        tempReferences[refKey] = []
      }
      tempReferences[refKey].push(tempRef)
    })

    activeIssue.fileData.replacement?.sectionRefs?.forEach((ref) => {
      let tempRef = JSON.parse(JSON.stringify(ref))
      tempRef.status  = 1
      const refKey = tempRef.contentItemId + REPLACED_LABEL
      if(!tempReferences[refKey]){
        tempReferences[refKey] = []
      }
      tempReferences[refKey].push(tempRef)
    })


    activeIssue.fileData.references?.forEach((ref) => {
      let tempRef = JSON.parse(JSON.stringify(ref))
      tempRef.status  = 0
      const refKey = tempRef.contentItemId + ORIGINAL_LABEL
      if(!tempReferences[refKey]){
        tempReferences[refKey] = []
      }
      tempReferences[refKey].push(tempRef)
    })


    activeIssue.fileData.sectionRefs?.forEach((ref) => {
      let tempRef = JSON.parse(JSON.stringify(ref))
      tempRef.status  = 0
      const refKey = tempRef.contentItemId + ORIGINAL_LABEL
      if(!tempReferences[refKey]){
        tempReferences[refKey] = []
      }
      tempReferences[refKey].push(tempRef)
    })

    // If there are only single references (majority of use cases), don't bother showing the "Instances" column.
    let tempSingleReferencesOnly = true
    Object.keys(tempReferences)?.forEach((key) => {
      if(tempReferences[key].length > 1) {
        tempSingleReferencesOnly = false
      }
    })
    
    setSingleReferencesOnly(tempSingleReferencesOnly)
    setFileReferenceHolder(tempReferences)
  }

  return (
    <>
      { isDisabled ? (
        <div className="flex-column h-100 flex-grow-1 justify-content-center">
          <div className="flex-row justify-content-center align-items-center mb-4">
            <ProgressIcon className="icon-lg udoit-progress spinner" />
            <h2 className="mt-0 mb-0 ps-3">{t('fix.label.loading_content')}</h2>
          </div>
        </div> 
      ) : (
        <>
          { activeIssue.fileData.replacement ? (
            <>
              <div className='file-label-pill'>{t('form.file.original.label')}</div>
              <div className='callout-container w-100 mt-2'>
                <FileInformation t={t} file={oldFile} />
              </div>
              <div className="flex-row w-100 justify-content-center mt-2">
                <DownwardArrowIcon className="icon-md gray" />
              </div>
              <div className='file-label-pill file-new'>{t('form.file.new.label')}</div>
              <div className='callout-container w-100 mt-2'>
                <FileInformation t={t} file={currentFile} />
              </div>
            </>
          ) : ( currentFile && ( 
            <>
              <div className="flex-row gap-2 align-items-center">
                <div className="strong-caps">{t('form.file.current.label')}</div>
                { activeIssue.fileData.replacement ? (
                  <div className='file-label-pill file-new'>{t('form.file.new.label')}</div>
                ) : (
                  <div className='file-label-pill'>{t('form.file.original.label')}</div>
                )}
              </div>
              <div className='callout-container w-100 mt-2'>
                <FileInformation t={t} file={currentFile} />
              </div>
            </>
          ))}

          { Object.keys(fileReferenceHolder).length > 0 ? (
            <>
              <div className="strong-caps mt-3">{t('form.file.instances.label')}</div>
              <div className="mt-2 rounded-table-wrapper">
                <table className="udoit-sortable-table first-column-wide">
                  <thead>
                    <tr>
                      <th>{t('form.file.location.label')}</th>
                      { !singleReferencesOnly && (<th>{t('fix.label.references')}</th>)}
                      <th>{t('form.file.status.label')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    { Object.keys(fileReferenceHolder)?.map((key, index) => (
                      <tr key={index}>
                        <td>
                          <a href={fileReferenceHolder[key][0].contentType == "quiz_question" ? fileReferenceHolder[key][0].contentItemUrl.replace(/\/questions.*/, "/edit#questions_tab") : fileReferenceHolder[key][0].contentItemUrl} target='_blank' className='location-link flex-row align-items-center'>
                            {fileReferenceHolder[key][0].contentItemTitle}
                            <ExternalLinkIcon className="link-color align-self-center ms-2 icon-sm"/>
                          </a>
                        </td>
                        { !singleReferencesOnly && (<td>{fileReferenceHolder[key]?.length}</td>)}
                        <td>
                          {key.includes(REPLACED_LABEL)  ? (
                            <div className='file-label-pill file-new'>{t('form.file.new.label')}</div>
                          ) : (
                            <div className='file-label-pill'>{t('form.file.original.label')}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="option-feedback feedback-warning mt-3">
              <SeverityPotentialIcon className="icon-md udoit-potential-highlight align-self-top pe-2"/>
              <div>{t('form.file.no_ref.label')}</div>
            </div>
          )}
        </>
      )}
    </>
  )
}