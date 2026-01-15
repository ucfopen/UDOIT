import React, { useState, useEffect, act } from 'react'
import UploadIcon from '../Icons/UploadIcon'
import SaveIcon from '../Icons/SaveIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import './FileForm.css'
import DeleteIcon from '../Icons/DeleteIcon'
import FileStatus from '../Widgets/FileStatus'
import FileInformation from '../Widgets/FileInformation'
import * as Text from '../../Services/Text'
import DownwardArrowIcon from '../Icons/DownwardArrowIcon'
import CloseIcon from '../Icons/CloseIcon'

export default function FileForm ({
  t,
  settings,
  activeFile,
  sessionFiles,
  uploadedFile,
  setUploadedFile,
  isDisabled,
  setIsDisabled,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid,
  getReadableFileType,
  handleFileResolveWrapper
 }) {

    const FORM_OPTIONS = {
       REPLACE_FILE: 'replace-file',
       MARK_AS_REVIEWED: 'mark-as-reviewed',
    }

    const [activeOption, setActiveOption] = useState('')
    const [formErrors, setFormErrors] = useState([])

    const [copiedActiveFile, setCopiedActiveFile] = useState(null)
    const [copiedUploadedFile, setCopiedUploadedFile] = useState(null)

    useEffect(() => {
      setUploadedFile(null)
      if(activeFile){
        normalizeActiveFile()
      }
    }, [activeFile])

    useEffect(() => {
      console.log(uploadedFile)
      normalizeUploadedFile()
      if(markAsReviewed || uploadedFile){
        setFormInvalid(false)
      }
      else{
        setFormInvalid(true)
      }
    }, [markAsReviewed, uploadedFile])

    const normalizeActiveFile = () => {
      const tempFile =  {
        fileName: activeFile.fileName,
        fileType: getReadableFileType(activeFile.fileType),
        fileSize: Text.getReadableFileSize(activeFile.fileSize),
      }
      setCopiedActiveFile(tempFile)
    }

    const normalizeUploadedFile = () => {
      if(!uploadedFile){
        return
      }
      const tempFile = {
        fileName: uploadedFile.name,
        fileType: getReadableFileType(uploadedFile.size),
        fileSize: Text.getReadableFileSize(uploadedFile.fileSize),
      }
      setCopiedUploadedFile(tempFile)
    }

  // useEffect(() => {
  //   let tempIsDisabled = false

  //   // If there are any unresolved issues in this file, we disable the resolve button.
  //   if(activeFile && sessionFiles) {
  //     Object.keys(sessionFiles).forEach((key) => {
  //       if(key == activeFile.id) {
  //         if(sessionFiles[key] === settings.ISSUE_STATE.SAVING || sessionFiles[key] === settings.ISSUE_STATE.RESOLVING) {
  //           tempIsDisabled = true
  //         }
  //       }
  //     })
  //   }
  //   setIsDisabled(tempIsDisabled)
  // }, [sessionFiles])

  // Drag and Drop code is adapted from:
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
  const handleDrop = (event) => {
    if(uploadedFile){
      return
    }
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
    if(uploadedFile){
      return
    }
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
    if(uploadedFile){
      return
    }
    let shadowInput = document.createElement('input')
    shadowInput.setAttribute('type', 'file')
    shadowInput.onchange = _ => {
      setUploadedFile(shadowInput.files[0])
    }
    shadowInput.click()
  }

  const handleOptionChange = (option) => {
    setActiveOption(option)
    if (option == FORM_OPTIONS.MARK_AS_REVIEWED){
      setMarkAsReviewed(true)
    }
    else{
      setMarkAsReviewed(false)
    }
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    setCopiedUploadedFile(null)
  }

  return (
    <>
    {activeFile.reviewed && activeFile.replacement && 
      <div>Replaced!</div>
    }
    
    {activeFile.reviewed && !activeFile.replacement && 
      <div className='resolve-option selected'>
        <div className='marked-as-reviewed-container p-4 flex-column justify-content-center align-items-center text-center'>
          <h3>Marked as Reviewed</h3>
          <div>This file has been checked for accessibility and marked as reviewed. Mark the file has unreviewed if you believe it is inaccessible and needs changes</div>
          <div className='btn-link fw-bold mt-3' onClick={handleFileResolveWrapper}>Mark File As Unreviewed</div>
        </div> 
      </div>
      }
    {!activeFile.reviewed && !activeFile.replacement && <div>
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
            <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
            <input
              type="radio"
              id={FORM_OPTIONS.MARK_AS_REVIEWED}
              name="altTextOption"
              tabIndex="0"
              checked={activeOption === FORM_OPTIONS.MARK_AS_REVIEWED}
              disabled={isDisabled}
              onChange={() => {
                handleOptionChange(FORM_OPTIONS.MARK_AS_REVIEWED)
              }} />
              Keep Current File
            </label>
        </div>

        <div className={`resolve-option mt-2 ${activeOption === FORM_OPTIONS.REPLACE_FILE ? 'selected' : ''}`}>
            <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
            <input
              type="radio"
              id={FORM_OPTIONS.REPLACE_FILE}
              name="altTextOption"
              tabIndex="0"
              checked={activeOption === FORM_OPTIONS.REPLACE_FILE}
              disabled={isDisabled}
              onChange={() => {
                handleOptionChange(FORM_OPTIONS.REPLACE_FILE)
              }} />
              Replace File
            </label>
            {activeOption == FORM_OPTIONS.REPLACE_FILE && (
              <div className='flex-column align-items-center justify-content-center'>
                <div className='w-100 p-2'>
                  <FileStatus fileStatus={0} fileTagText={"Original File"} />
                    <div className='file-info-container p-2'>
                      <FileInformation file={copiedActiveFile} />
                    </div>
                </div>
                <DownwardArrowIcon className="icon-md pt-4 pb-4" />
                <div className='w-100 p-2'>
                  <FileStatus fileStatus={1} fileTagText={"New File"} />
                  <div className={`file-upload-container ${uploadedFile ? 'uploaded p-2' : 'p-4 flex-column text-center jusitify-content-center align-items-center'}`}
                    onDrop={handleDrop}
                    onClick={handleFileSelect}
                    onDrag={handleDragOver}
                    onKeyDown={handleKeyPress}
                  >
                    {uploadedFile && copiedUploadedFile ? 
                    <div className='flex-row align-items-center justify-content-between'>
                      <FileInformation file={copiedUploadedFile} fillColor={'var(--primary-color)'} />
                      <CloseIcon onClick={removeUploadedFile} tabIndex='0' />
                    </div> :
                    
                    <div>
                      <UploadIcon className='upload-icon icon-md p-2 mb-2' />
                      <div className='upload-instructions'><span className='link-color fw-bold'>Click to upload</span> or drag and drop <br /> SVG, PNG, JPG or GIF (max. 800x400px)</div>
                    </div>
                    
                    }
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>}

    </>
  )
}