import React, { useState, useEffect, act } from 'react'
import UploadIcon from '../Icons/UploadIcon'
import SaveIcon from '../Icons/SaveIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import './FileForm.css'
import DeleteIcon from '../Icons/DeleteIcon'

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
  setFormInvalid
 }) {

    const FORM_OPTIONS = {
       REPLACE_FILE: 'replace-file',
       MARK_AS_REVIEWED: 'mark-as-reviewed',
    }

    const [activeOption, setActiveOption] = useState('')
    const [formErrors, setFormErrors] = useState([])

    useEffect(() => {
      setUploadedFile(null)
    }, [activeFile])

    useEffect(() => {
      if(markAsReviewed || uploadedFile){
        setFormInvalid(false)
      }
      else{
        setFormInvalid(true)
      }
    }, [markAsReviewed, uploadedFile])

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

  const handleOptionChange = (option) => {
    setActiveOption(option)
    if (option == FORM_OPTIONS.MARK_AS_REVIEWED){
      setMarkAsReviewed(true)
      setUploadedFile(null)
    }
    else{
      setMarkAsReviewed(false)
    }
  }

  return (
    <>
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

      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REPLACE_FILE ? 'selected' : ''}`}>
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
      </div>


    </>
  )
}