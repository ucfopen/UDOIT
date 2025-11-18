import React, { useState, useEffect, act } from 'react'
import UploadIcon from '../Icons/UploadIcon'
import SaveIcon from '../Icons/SaveIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import './FileForm.css'

export default function FileForm ({
  t,
  settings,

  handleFileDelete,
  activeFile,
  handleFileResolve,
  handleFileUpload,
  sessionIssues
 }) {

  const [uploadedFile, setUploadedFile] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [changeReferences, setChangeReferences] = useState(true)

  useEffect(() => {
    setUploadedFile(null)
  }, [activeFile])

  useEffect(() => {
    let tempIsDisabled = false

    // If there are any unresolved issues in this file, we disable the resolve button.
    if(activeFile && sessionIssues) {
      Object.keys(sessionIssues).forEach((key) => {
        if(key === 'file-' + activeFile.id) {
          if(sessionIssues[key] === settings.ISSUE_STATE.SAVING || sessionIssues[key] === settings.ISSUE_STATE.RESOLVING) {
            tempIsDisabled = true
          }
        }
      })
    }
    setIsDisabled(tempIsDisabled)
  }, [sessionIssues])

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
      {/* <h3 >{t('form.file.label.replace')}</h3> */}
      <label className="instructions">{!activeFile.references || activeFile.references.length == 0 ? t('form.file.label.delete.desc') : t("form.file.label.replace.desc")}</label>
      <div
        id={`file-drop-zone${!activeFile.references || activeFile.references.length == 0 ? "-disabled-upload": ""}`} 
        className={`mt-3 flex-row`}
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
      {!activeFile.references || activeFile.references.length == 0 && (
        <div className='mt-3 flex-row justify-content-end'>
          <button onClick={handleFileDelete} className="btn-warn btn-icon-left">{t("form.file.delete")}</button>
        </div>
      )}
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
          <div className="flex-row gap-1 mt-3">
            <input
              type="checkbox"
              name="changeReferencesCheckbox"
              id="changeReferencesCheckbox"
              checked={changeReferences}
              tabIndex="0"
              disabled={isDisabled}
              onChange={handleChangeReferences} />
            <label htmlFor="changeReferencesCheckbox" className="instructions">{t('form.file.label.replace_references')}</label>
          </div>
          <div className="mt-3 flex-row justify-content-end">
            <button className="btn-primary btn-icon-left"
              onClick={handleSubmit}
              disabled={isDisabled}
              tabIndex="0">
              <SaveIcon className="icon-md" alt=""/>
              {t('form.submit')}
            </button>
          </div>
        </>
      )}
      <div className="separator mt-3">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-between gap-1 mt-3">
        <div className="flex-column justify-content-center flex-grow-1 gap-1">
          { activeFile?.reviewed ? (
              <div className="flex-row justify-content-end pe-2">
                <ResolvedIcon className="color-success icon-md flex-column align-self-center pe-2"/>
                <div className="flex-column align-self-center fw-bolder primary">{t('filter.label.resolution.resolved_single')}</div>
              </div>
            ) : ''}
        </div>
        <div className="flex-column justify-content-center flex-shrink-0">
          <button
            className="btn-secondary btn-icon-left"
            onClick={() => handleFileResolve(activeFile)}
            disabled={isDisabled}
            tabIndex="0">
            <ResolvedIcon className="icon-md" alt=""/>
            {activeFile?.reviewed ? t('fix.button.unresolved') : t('fix.button.resolved')}
          </button>
        </div>
      </div>
    </>
  )
}