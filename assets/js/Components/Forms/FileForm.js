import React, { useState, useEffect } from 'react'
import UploadIcon from '../Icons/UploadIcon'
import './FileForm.css'

export default function FileForm ({
  t,
  activeFile,
  handleFileUpload,
 }) {

  const [acceptType, setAcceptType] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [changeReferences, setChangeReferences] = useState(false)

  const getAcceptType = (file) => {
    let accept = []

    switch(file.fileType) {
      case "doc":
        accept = ["doc", "docx"]
        break

      case "ppt":
        accept = ["ppt", "pptx"]
        break

      case "xls":
        accept = ["xls", "xlsx"]
        break

      default:
        accept = file.fileType
        break
    }

    let extension = file.fileName.slice(-4)

    switch(extension) {
      case "xlsx":
        accept = "xlsx"
        break
      
      case "pptx":
        accept = "pptx"
        break

      case "docx":
        accept = "docx"
        break
    }

    return accept
  }

  useEffect(() => {
    setUploadedFile(null)
    if(activeFile) {
      setAcceptType(getAcceptType(activeFile.fileData))
    }
    console.log(activeFile)
    console.log(changeReferences);
  }, [activeFile])

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

  // Set checkReferences to true or false depending on event on checkbox
  const handleReferences = (e) => {
    setChangeReferences(e.target.checked);
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
    console.log("Change References from fileForm: " + changeReferences);
    handleFileUpload(uploadedFile, changeReferences)
  }

  useEffect(() => {
    console.log(changeReferences);
  }, [changeReferences])

  return (
    <>
      {/* <h3 >{t('form.file.label.replace')}</h3> */}
      <label className="instructions">{t('form.file.label.replace.desc')}</label>
      <div
        id="file-drop-zone"
        className="mt-3 flex-row"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleFileSelect}
        onKeyDown={handleKeyPress}
        tabIndex="0">
        
        <div className="flex-column flex-center me-3 flex-shrink-0">
          <UploadIcon className="icon-lg" />
        </div>
        <div className="file-drop-text flex-column flex-center">
          <div className="flex-row flex-center">{t('form.file.label.drag_drop')}</div>
          <div className="mt-2 flex-row flex-center link-color">{t('form.file.label.browse_files')}</div>
        </div>
      </div>
      {uploadedFile && (
        <>
          <div className="mt-3 flex-row">
            <div className="flex-column flex-center me-3 flex-shrink-0">
              <div className="fw-bold">{t('form.file.label.new_file')}:</div>
            </div>
            <div className="flex-column flex-center allow-word-break">
              <div>{uploadedFile.name}</div>
            </div>
          </div>
          <div className="mt-3 flex-row">
            <button className="btn btn-primary" onClick={handleSubmit}>{t('form.submit')}</button>
          </div>
          <div className=''>
              <input 
                type='checkbox'
                checked={changeReferences}
                onChange={handleReferences}
              />
              <span>Change Links to files in all content items</span>
          </div>
        </>
      )}
    </>
  )
}