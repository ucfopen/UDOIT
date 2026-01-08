import React, { useState, useEffect, act } from 'react'
import UploadIcon from '../Icons/UploadIcon'
import SaveIcon from '../Icons/SaveIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import './FileForm.css'
import DeleteIcon from '../Icons/DeleteIcon'

export default function FileForm ({
  t,
  settings,

  handleFileDelete,
  activeFile,
  handleFileResolve,
  handleFileUpload,
  sessionFiles
 }) {

  const [uploadedFile, setUploadedFile] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [changeReferences, setChangeReferences] = useState(true)
  const [modalVisbility, setModalVisibility] = useState(false)

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

  const handleModalVisibility = () => {
    setModalVisibility(() => !modalVisbility)
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

  const handleChangeReferences = (event) => {
    setChangeReferences(event.target.checked)
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

  const handleSubmit = () => {
    if (!uploadedFile) {
      return
    }
    handleFileUpload(uploadedFile, changeReferences)
  }

  return (
    <>
      
    </>
  )
}