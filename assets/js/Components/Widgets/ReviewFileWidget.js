import React, { useEffect, useState } from 'react'
import CloseIcon from '../Icons/CloseIcon'
import './ReviewFileWidget.css'
import ContentPageIcon from '../Icons/ContentPageIcon'
import ArrowIcon from '../Icons/ArrowIcon'
import UploadIcon from '../Icons/UploadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'



const ReviewFileWidget = (
    {
    activeIssue, 
    t,
    sessionFiles

    }) => {
    const [toggleReplace, setToggleReplace] = useState(false)
    const [selectedRef, setSelectedRef] = useState({})
    const [uploadedFile, setUploadedFile] = useState(null)
    const [isDisabled, setIsDisabled] = useState(false)
    const [activeFile, setActiveFile] = useState(activeIssue.fileData)

    useEffect(() => {
        setActiveFile(activeIssue.fileData)
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

    const handleToggleRplace = () => {
        const replace = !toggleReplace
        setToggleReplace(replace)
    }

    const handleReferenceSelect = (reference) => {
        let tempSelectedRef = JSON.parse(JSON.stringify(selectedRef))
        if(tempSelectedRef[reference.contentItemLmsId]){
            delete tempSelectedRef[reference.contentItemLmsId]
        }
        else{
           tempSelectedRef[reference.contentItemLmsId] = reference
        }
        setSelectedRef(tempSelectedRef)
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
        <div className='header-content flex-row w-100 justify-content-between'>
            <div className="flex-column flex-center allow-word-break">
                <h2>Replace File</h2>
                <p>Select which course references should point to which file</p>
            </div>
            <CloseIcon />
        </div>

        <div className='file-upload-container flex-row align-items-center mt-4 justify-content-center'>
            <div className='file-container w-100'>
                <div className='flex-row gap-2 align-items-center mb-2'>
                    <p className='fw-bolder'>ORIGINAL FILE</p>
                    <p className='badge badge-old fw-bolder'>OLD</p>
                </div>
                <div className='file-card'>
                    <div className='title flex-row align-items-center gap-2'>
                        <div className='file-icon'>
                            <ContentPageIcon />
                        </div>
                        <div className="file-name-text flex-column flex-center allow-word-break">{activeIssue.fileData.fileName}</div>
                    </div>
                    <div className='flex-row justify-content-between'>
                        <p>File Type</p>
                        <p>{getReadableFileType(activeIssue.fileData.fileType)}</p>
                    </div>
                </div>
            </div>
            <div className='arrow-icon'>
                <ArrowIcon />
            </div>
            <div className='file-container file-container-upload w-100'>
                <div className='flex-row gap-2 align-items-center mb-2'>
                    <p className='fw-bolder'>NEW REPLACEMENT</p>
                    <p className='badge badge-new fw-bolder'>NEW</p>
                </div>
                <div className='file-card file-card-upload'
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={handleFileSelect}
                    onKeyDown={handleKeyPress}
                >
                        <UploadIcon className='upload-icon' />
                        {uploadedFile ? <p className='new-file-upload-name'>{`New File: ${uploadedFile.name}`}</p> : ''}
                        <p><span className='upload-text'>Click to upload</span> or drag and drop</p>
                        <p>SVG, PNG, JPG or GIF (max. 800x400px)</p>
                    <div>

                    </div>
                </div>
            </div>
        </div>

        {uploadedFile && <div className='m-3 flex-row justify-content-start w-100 align-items-center'>
            <div className={`switch ${toggleReplace ? "on" : ""}`} onClick={handleToggleRplace}>
                <div className='thumb'></div>
            </div>
                <h4 className='ml-1'>Replace All</h4>
        </div>}

        {uploadedFile && <div className='file-ref-table-container w-100'>
            <div className='w-100 flex-row justify-content-between'>
                <p>References in Course</p>
                <p>{`${Object.keys(selectedRef).length} of ${activeIssue.fileData.references.length} references replaced`}</p>
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
                    {activeIssue.fileData.references.map((ref, index) => (
                        <tr key={index}>
                            <td className='content-title'>
                            <div className='flex-row align-items-center gap-1'>
                                <input
                                    type="checkbox"
                                    className="custom-checkbox"
                                    id="ref-checkbox"
                                    checked={ref.contentItemLmsId in selectedRef}
                                    onChange={() => handleReferenceSelect(ref)}
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
                                    Old File
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>}

        {uploadedFile && <div className='w-100 flex-row gap-1 align-items-center justify-content-end'>
            <p>Cancel</p>
            <button className={`${Object.keys(selectedRef).length > 0 ? 'btn-primnary': 'btn-secondary'}`} disabled={Object.keys(selectedRef).length == 0}>{`Update ${Object.keys(selectedRef).length} references`}</button>
        </div>}
      
    </div>
  )
}

export default ReviewFileWidget