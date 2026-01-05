import React, { useEffect, useState } from 'react'
import CloseIcon from '../Icons/CloseIcon'
import * as Text from '../../Services/Text'
import './ReviewFileWidget.css'
import ContentPageIcon from '../Icons/ContentPageIcon'
import ArrowIcon from '../Icons/ArrowIcon'
import UploadIcon from '../Icons/UploadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'
import SeverityIcon from '../Icons/SeverityIcon'
import FileAccessibilityInformation from './ReviewFileWidgetComponents/FileAccessibilityInformation'
import FileReviewOrUpload from './ReviewFileWidgetComponents/FileReviewOrUpload'




const ReviewFileWidget = (
    {
    activeIssue, 
    t,
    sessionFiles,
    handleFileUpload,
    settings

    }) => {
    const [toggleReplace, setToggleReplace] = useState(false)
    const [selectedRef, setSelectedRef] = useState({})
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isDisabled, setIsDisabled] = useState(false)
    const [activeFile, setActiveFile] = useState(activeIssue.fileData)
    const [fileReferenceHolder, setFileReferenceHolder] = useState([])
    const [markReview, setMarkReview] = useState(false)

    useEffect(() => {
        setActiveFile(activeIssue.fileData)
        console.log(activeIssue.fileData)
        handleFileReference()
    }, [activeIssue])
    
    useEffect(() => {
        console.log(uploadedFile)
    }, [uploadedFile])

    useEffect(() => {
        console.log(activeFile)
        setUploadedFile(null)
      }, [activeFile])

    useEffect(() => {
          let tempIsDisabled = false
      
          // If there are any unresolved issues in this file, we disable the resolve button.
          if(activeFile && sessionFiles) {
            Object.keys(sessionFiles).forEach((key) => {
              if(key == activeFile.id) {
                if(sessionFiles[key] === settings.ISSUE_STATE.SAVING || sessionFiles[key] === settings.ISSUE_STATE.RESOLVING) {
                  tempIsDisabled = true
                }
              }
            })
          }
          setIsDisabled(tempIsDisabled)
        }, [sessionFiles])

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

        console.log(tempReferences)
        setFileReferenceHolder(tempReferences)
     }

    const handleToggleRplace = () => {
        const replace = !toggleReplace
        if(replace){
            const temp = {}
            fileReferenceHolder.forEach((ref) => {
                let id = ref.contentItemLmsId ? ref.contentItemLmsId : ref.itemId
                temp[id] = ref
            }) 
            setSelectedRef(temp)
        }
        else{
            setSelectedRef({})
        }
        setToggleReplace(replace)
    }

    const handleReferenceSelect = (reference) => {
        let tempSelectedRef = JSON.parse(JSON.stringify(selectedRef))
        let id = reference.contentItemLmsId ? reference.contentItemLmsId : reference.itemId
        if(tempSelectedRef[reference.contentItemLmsId]){
            delete tempSelectedRef[id]
        }
        else{
           tempSelectedRef[id] = reference
        }
        setSelectedRef(tempSelectedRef)
    }

    const handleSubmit = () => {
        let contentReferences = []
        let sectionReferences = []
        console.log(selectedRef)

        Object.values(selectedRef).forEach((ref) => {
            if(ref.itemId){
                sectionReferences.push(ref)
            }
            else{
                contentReferences.push(ref)
            }
        })
        handleFileUpload(uploadedFile, contentReferences, sectionReferences)
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

  const toggleMarkReview =  () => {
    const currentReview = markReview
    setMarkReview(!currentReview)
  }

    // Drag and Drop code is adapted from:
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
  const handleDrop = (event) => {
    event.preventDefault()
    let newFile = null
    
    if (event.dataTransfer.items) {
      [...event.dataTransfer.items].forEach((item) => {
        if (item.kind === 'file') {
          newFile = item.getAsFile()
        }
      })
    } else {
      [...event.dataTransfer.files].forEach((file) => {
        newFile = file
      })
    }
    if(!newFile) {
      console.error("No valid file uploaded.")
    }


    setUploadedFile(newFile)
  }

  const handleKeyPress = (event) => {
    if(event.key === 'Enter' || event.key === ' ') {
      handleFileSelect()
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  // In order to trigger the file input dialog, we need an input element,
  // and we don't want it to show on the page. So we create a temporary one.
  const handleFileSelect = () => {
    let shadowInput = document.createElement('input')
    shadowInput.setAttribute('type', 'file')
    shadowInput.onchange = _ => {
      setUploadedFile(shadowInput.files[0])
    }
    shadowInput.click()
  }

  return (
    <div className='p-4 flex-column align-items-center justify-content-center'>
        <div className='header-content flex-row w-100 justify-content-between align-items-baseline'>
            <h3>Replace File</h3>
            <CloseIcon tabIndex='0' />
        </div>

        <FileAccessibilityInformation 
            activeFile={activeFile}
            getReadableFileSize={Text.getReadableFileSize}
            getReadableFileType={getReadableFileType}
        />
        <div className='resolve-issue-instruction-header w-100'>
            <h3 className='mb-0'>Resolve File</h3>
            <div>Upload a new version if the current file has accessibility issues</div>
        </div>

        <div className='w-100 flex-row'>
            <FileReviewOrUpload
                activeFile={activeFile} 
                toggleMarkReview={toggleMarkReview}
                handleDrop={handleDrop}
                handleKeyPress={handleKeyPress}
                handleDragOver={handleDragOver}
            />
        </div>

        {uploadedFile && <div className='m-3 flex-row justify-content-start w-100 align-items-center'>
            <div className={`switch ${toggleReplace ? "on" : ""}`} onClick={handleToggleRplace} >
                <div className='thumb'></div>
            </div>
                <h4 className='ml-1'>Replace All</h4>
        </div>}

        {uploadedFile && <div className='file-ref-table-container w-100' id={markReview ? 'disabled' : ''}>
            <div className='w-100 flex-row justify-content-between'>
                <p>References in Course</p>
                <p>{`${Object.keys(selectedRef).length} of ${fileReferenceHolder.length} references replaced`}</p>
            </div>
            <div className='table-wrapper'>
            <table className='references-table'>
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
                            <td className='content-title'>
                            <div className='flex-row align-items-center gap-1'>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    id="ref-checkbox"
                                    checked={(ref.contentItemLmsId ? ref.contentItemLmsId : ref.itemId) in selectedRef}
                                    onChange={() => handleReferenceSelect(ref)}
                                    disabled={!uploadedFile}
                                />
                                <label htmlFor='ref-checkbox' className='ref-checkbox-label'>{ref.contentItemTitle}</label>
                            </div>
                            </td>
                            <td>
                                <a href={ref.contentItemUrl} target='_blank' className='location-link'>
                                    External URL
                                    <ExternalLinkIcon />
                                </a>
                            </td>
                            <td>
                                <span className="status-badge">
                                    <span className="status-dot"></span>
                                    {ref.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>}


    </div>
  )
}

export default ReviewFileWidget