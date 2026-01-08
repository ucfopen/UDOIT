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
import FileReferenceTable from './ReviewFileWidgetComponents/FileReferenceTable'
import FileSaveReviewOrRevert from './ReviewFileWidgetComponents/FileSaveReviewOrRevert'




const ReviewFileWidget = (
    {
    activeIssue, 
    t,
    sessionFiles,
    handleFileUpload,
    settings,
    handleFileRevert

    }) => {
    const [toggleReplace, setToggleReplace] = useState(true)
    const [selectedRef, setSelectedRef] = useState({})
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isDisabled, setIsDisabled] = useState(false)
    const [activeFile, setActiveFile] = useState(activeIssue.fileData)
    const [fileReferenceHolder, setFileReferenceHolder] = useState([])
    const [markReview, setMarkReview] = useState(false)

    useEffect(() => {
        setActiveFile(activeIssue.fileData)
        handleFileReference()
    }, [activeIssue])

    useEffect(() => {
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

    const removeUploadedFile = () => {
        setUploadedFile(null)
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

        Object.values(fileReferenceHolder).forEach((ref) => {
            if(ref.itemId){
                sectionReferences.push(ref)
            }
            else{
                contentReferences.push(ref)
            }
        })
        handleFileUpload(uploadedFile, contentReferences, sectionReferences)
    }

    const handleResolve = () => {
        console.log("Resolving")
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

  const handleRevert = () => {
    let contentReferences = []
    let sectionReferences = []

        Object.values(fileReferenceHolder).forEach((ref) => {
            if(ref.itemId){
                sectionReferences.push(ref)
            }
            else{
                contentReferences.push(ref)
            }
        })
    
    handleFileRevert(activeFile, contentReferences, sectionReferences)
  }

  return (
    <div className='p-4 flex-column align-items-center justify-content-center'>
        <FileAccessibilityInformation 
            activeFile={activeFile}
            getReadableFileSize={Text.getReadableFileSize}
            getReadableFileType={getReadableFileType}
        />
        <div className='resolve-issue-instruction-header w-100'>
            <h3 className='mb-0'>Resolve File</h3>
            <div>Upload a new version if the current file has accessibility issues</div>
        </div>

        <div className='w-100 flex-row justify-content-between align-items-start mt-2 gap-2'>
            <FileReviewOrUpload
                activeFile={activeFile} 
                toggleMarkReview={toggleMarkReview}
                handleDrop={handleDrop}
                handleKeyPress={handleKeyPress}
                handleDragOver={handleDragOver}
                markReview={markReview}
                handleFileSelect={handleFileSelect}
                uploadedFile={uploadedFile}
                removeUploadedFile={removeUploadedFile}
            />
            <FileReferenceTable 
                activeFile={activeFile}
                fileReferenceHolder={fileReferenceHolder}
                selectedRef={selectedRef}
                handleReferenceSelect={handleReferenceSelect}
                uploadedFile={uploadedFile}
                toggleReplace={toggleReplace}
                handleToggleReplace={handleToggleRplace}
            />
        </div>
        <FileSaveReviewOrRevert 
            activeFile={activeFile} 
            handleSubmit={handleSubmit} 
            handleResolve={handleResolve} 
            markReview={markReview} 
            uploadedFile={uploadedFile} 
            references={fileReferenceHolder}
            handleRevert={handleRevert}
        />
    </div>
  )
}

export default ReviewFileWidget