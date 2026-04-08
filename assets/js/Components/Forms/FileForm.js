import React, { useState, useEffect, act } from 'react'
import UploadIcon from '../Icons/UploadIcon'
import './FileForm.css'
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
  getReadableFileType,
  handleFileResolveWrapper,
  setFormInvalid,
  setMarkDelete,
  markDelete, 
  setMarkRevert,
  markRevert
 }) {

    const FORM_OPTIONS = {
       REPLACE_FILE: 'replace-file',
       MARK_AS_REVIEWED: 'mark-as-reviewed',
       MARK_DELETE: 'mark-delete',
       MARK_REVERT: 'mark-revert'
    }

    const [activeOption, setActiveOption] = useState('')
    const [formErrors, setFormErrors] = useState([])

    const [copiedActiveFile, setCopiedActiveFile] = useState(null)
    const [copiedUploadedFile, setCopiedUploadedFile] = useState(null)
    const [copiedReplacementFile, setCopiedReplacementFile] = useState(null)

    const [nonReferenced, setNonReferenced] = useState(false)

    useEffect(() => { 
      setUploadedFile(null)
      setNonReferenced(false)
      setActiveOption('')

      setMarkDelete(false)
      setMarkRevert(false)
      setMarkAsReviewed(false)

      if(activeFile){
        normalizeActiveFile()
        normalizeReplacementFile()
        if(!activeFile.replacement && activeFile?.references?.length == 0 && activeFile?.sectionRefs?.length == 0){
          setNonReferenced(true)
        }
      }
    }, [activeFile])

    useEffect(() => {
      normalizeUploadedFile()
      if(markAsReviewed || uploadedFile || markDelete || markRevert){
        setFormInvalid(false)
      }
      else{
        setFormInvalid(true)
      }
    }, [markAsReviewed, uploadedFile, markDelete, markRevert])

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
        fileType: getReadableFileType(uploadedFile.type),
        fileSize: Text.getReadableFileSize(uploadedFile.size),
      }
      setCopiedUploadedFile(tempFile)
    }

    const normalizeReplacementFile = () => {
      if (!activeFile?.replacement){
        return
      }
      const tempFile = {
        fileName: activeFile.replacement.fileName,
        fileType: getReadableFileType(activeFile.replacement.fileType),
        fileSize: Text.getReadableFileSize(activeFile.replacement.fileSize),
      }

      setCopiedReplacementFile(tempFile)
    }

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
    if(option == FORM_OPTIONS.MARK_REVERT){
      setMarkRevert(true)
      setMarkAsReviewed(false)
      setMarkDelete(false)
      return
    }
    if (option == FORM_OPTIONS.MARK_AS_REVIEWED){
      setMarkAsReviewed(true)
      setMarkRevert(false)
      setMarkDelete(false)
      return
    }
    if(option == FORM_OPTIONS.MARK_DELETE){
      setMarkDelete(true)
      setMarkRevert(false)
      setMarkAsReviewed(false)
      return
    }
    else {
      setMarkRevert(false)
      setMarkAsReviewed(false)
      setMarkDelete(false)
      return
    }
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    setCopiedUploadedFile(null)
  }

  const checkCanDelete = (e) => {
    if (e.target.value === "PERMANENTLY DELETE"){
      setMarkDelete(true)
    }
    else{
      setMarkDelete(false)
    }
  }

  return (
    <>
    { activeFile.reviewed && activeFile.replacement && 
      <div className='flex-column gap-1'>
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_DELETE ? 'selected' : ''}`}>
            <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
            <input
              type="radio"
              id={FORM_OPTIONS.MARK_DELETE}
              name="altTextOption"
              tabIndex="0"
              checked={activeOption === FORM_OPTIONS.MARK_DELETE}
              disabled={isDisabled}
              onChange={() => {
                handleOptionChange(FORM_OPTIONS.MARK_DELETE)
              }} />
              {t('form.file.delete.original.label')}
            </label>
            {activeOption === FORM_OPTIONS.MARK_DELETE && <div className='mt-1'>{t('form.file.delete_instructions', {file: activeFile.fileName})}</div>}
        </div>

        <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_REVERT ? 'selected' : ''}`}>
              <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
              <input
                type="radio"
                id={FORM_OPTIONS.MARK_REVERT}
                name="altTextOption"
                tabIndex="0"
                checked={activeOption === FORM_OPTIONS.MARK_REVERT}
                disabled={isDisabled}
                onChange={() => {
                  handleOptionChange(FORM_OPTIONS.MARK_REVERT)
                }} />
                {t('form.file.revert_label')}
              </label>
              {activeOption === FORM_OPTIONS.MARK_REVERT && <div className='mt-1'>{t('form.file.revert_instructions', {file: activeFile.fileName})}</div>}
        </div>
      </div>
    }

    {activeFile.reviewed && !activeFile.replacement && 
      <div className='resolve-option selected'>
        <div className='p-2 flex-column justify-content-center align-items-center text-center'>
          <h3 className="mt-0">{t('form.file.marked_review')}</h3>
          <div className="instructions">{t('form.file.marked_review_instruction')}</div>
          <button
            className='btn-secondary mt-3'
            onClick={handleFileResolveWrapper}>{t('fix.button.unresolved')}
          </button>
        </div> 
      </div>
    }

    { !activeFile.reviewed && !activeFile.replacement && 
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
              {t('form.file.keep_current')}
            </label>
        </div>

        {!nonReferenced && <div className={`resolve-option${activeOption === FORM_OPTIONS.REPLACE_FILE ? ' selected' : ''}`}>
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
              {t('form.file.label.replace')}
            </label>
            {activeOption == FORM_OPTIONS.REPLACE_FILE && (
              <div className='flex-column align-items-center justify-content-center'>
                <div className='file-label-pill'>{t('form.file.original.label')}</div>
                <div className='callout-container w-100 mt-1'>
                  <FileInformation t={t} file={copiedActiveFile} />
                </div>

                <DownwardArrowIcon className="icon-md gray m-3" aria-hidden="true" />

                <div className='file-label-pill file-new'>{t('form.file.new.label')}</div>
                <div className={`file-upload-container mt-1 ${uploadedFile ? 'uploaded' : 'p-3 flex-column text-center jusitify-content-center align-items-center'}`}
                  onDrop={handleDrop}
                  onClick={handleFileSelect}
                  onDrag={handleDragOver}
                  onKeyDown={handleKeyPress}
                  tabIndex='0'
                >
                  { uploadedFile && copiedUploadedFile ? (
                    <div className='flex-row align-items-center justify-content-between'>
                      <FileInformation t={t} file={copiedUploadedFile} />
                      <div className='ps-2 pe-1 align-self-start'>
                        <CloseIcon onClick={removeUploadedFile} onKeyDown={(e) => e.key == "Enter" ? removeUploadedFile() : ""} className='close-icon udoit-issue icon-sm' tabIndex='0' />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <UploadIcon className='icon-md icon-block mb-3' />
                      <div className='font-smaller'>{t('form.file.upload_instrcutions')}</div>  
                    </div>
                    )
                  }
                </div>
              </div>
            )}
        </div>}
      </>
    }

    { nonReferenced &&
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_DELETE ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
        <input
          type="radio"
          id={FORM_OPTIONS.MARK_DELETE}
          name="altTextOption"
          tabIndex="0"
          checked={activeOption === FORM_OPTIONS.MARK_DELETE}
          disabled={isDisabled}
          onChange={() => {
            handleOptionChange(FORM_OPTIONS.MARK_DELETE)
          }} />
          {t('form.file.delete.original.label')}
        </label>
          {activeOption === FORM_OPTIONS.MARK_DELETE && <div className='instructions'>{t('form.file.delete_instructions', {file: activeFile.fileName})}</div>}
      </div>
    }

    </>
  )
}