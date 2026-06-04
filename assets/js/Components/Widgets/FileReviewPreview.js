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
  settings,
  activeIssue,
  isDisabled
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
      tempRef.status  = 1
      tempReferences.push(tempRef)
    })

    activeIssue.fileData.replacement?.sectionRefs?.forEach((ref) => {
      let tempRef = JSON.parse(JSON.stringify(ref))
      tempRef.status  = 1
      tempReferences.push(tempRef)
    })


    activeIssue.fileData.references?.forEach((ref) => {
      let tempRef = JSON.parse(JSON.stringify(ref))
      tempRef.status  = 0
      tempReferences.push(tempRef)
    })


    activeIssue.fileData.sectionRefs?.forEach((ref) => {
      let tempRef = JSON.parse(JSON.stringify(ref))
      tempRef.status  = 0
      tempReferences.push(tempRef)
    })
    
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
                <FileInformation t={t} fileData={activeIssue.fileData} />
              </div>
              <div className="flex-row w-100 justify-content-center mt-2">
                <DownwardArrowIcon className="icon-md gray" />
              </div>
              <div className='file-label-pill file-new'>{t('form.file.new.label')}</div>
              <div className='callout-container w-100 mt-2'>
                <FileInformation t={t} fileData={activeIssue.fileData.replacement} />
              </div>
            </>
          ) : ( 
            <>
              <div className="flex-row gap-2 align-items-center">
                <div className="strong-caps">{t('form.file.current.label')}</div>
                <div className='file-label-pill'>{t('form.file.original.label')}</div>
              </div>
              <div className='callout-container w-100 mt-2'>
                <FileInformation t={t} fileData={activeIssue.fileData} />
              </div>
            </>
          )}

          { fileReferenceHolder.length > 0 ? (
            <>
              <div className="strong-caps mt-3">{t('form.file.instances.label')}</div>
              <div className="mt-2 rounded-table-wrapper">
                <table className="udoit-sortable-table first-column-wide">
                  <thead>
                    <tr>
                      <th>{t('form.file.location.label')}</th>
                      <th>{t('form.file.status.label')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    { fileReferenceHolder?.map((ref, index) => (
                      <tr key={index}>
                        <td>
                          <a href={ref.contentType == "quiz_question" ? ref.contentItemUrl.replace(/\/questions.*/, "/edit#questions_tab") : ref.contentItemUrl} target='_blank' className='location-link flex-row align-items-center'>
                            {ref.contentItemTitle}
                            <ExternalLinkIcon className="link-color align-self-center ms-2 icon-sm"/>
                          </a>
                        </td>
                        <td>
                          {activeIssue.fileData.replacement ? (
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