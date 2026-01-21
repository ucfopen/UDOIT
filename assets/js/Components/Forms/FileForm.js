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
      return
    }
    if (option == FORM_OPTIONS.MARK_AS_REVIEWED){
      setMarkAsReviewed(true)
    }
    else{
      setMarkRevert(false)
      setMarkAsReviewed(false)
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
    {activeFile.reviewed && activeFile.replacement && 
      <div className='resolve-option selected'>
        <div className='flex-column align-items-center justify-content-center'>
          <div className='w-100 p-2'>
            <FileStatus fileStatus={0} fileTagText={t('form.file.original.label')} />
            <div className='file-info-container p-2'>
              <FileInformation file={copiedActiveFile} />
            </div>
            
          <div className='replacement-option p-2 mt-2'>
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
              {activeOption == FORM_OPTIONS.MARK_DELETE && (
                <div className='option-instruction mt-2'> 
                  <input
                    type='text'
                    tabIndex={0}
                    className='w-100 mt-1'
                    onChange={(e) => checkCanDelete(e)}
                    />
                </div>
              )}
          </div>
          
          <div className='replacement-option p-2 mt-2'>
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
              Revert Changes
            </label>
            {activeOption == FORM_OPTIONS.MARK_REVERT && (
              <div>Reverting the changes will undo all changes done to the file and the references will point to the original file: <span className='fw-bolder truncated-text-ellipse'>{activeFile.fileName}</span></div>
            )}
          </div>

          </div>
          <DownwardArrowIcon className="icon-md pt-4 pb-4" />
        </div>
        <div className='w-100 p-2'>
           <FileStatus fileStatus={1} fileTagText={"New File"} />
           <div className='file-info-container p-4 flex-column justify-content-center align-items-center text-center'>
              <h3>File Replaced Successfully</h3>
              <p className='file-msg'>The original file, <span className='fw-bolder truncated-text-ellipse'>{activeFile.fileName}</span>, was replaced by the new file, <span className='fw-bolder truncated-text-ellipse'>{activeFile.replacement.fileName}</span>. All references to the original file in your course now point to the new file</p>
              <div className='new-file-info-container w-100 p-2'>
                <FileInformation file={copiedReplacementFile} fillColor={'var(--primary-color)'} />
              </div>
           </div>
        </div>

      </div>
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

        {!nonReferenced && <div className={`resolve-option mt-2 ${activeOption === FORM_OPTIONS.REPLACE_FILE ? 'selected' : ''}`}>
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
                      <div className='close-icon'>
                        <CloseIcon onClick={removeUploadedFile} className='remove-file' tabIndex='0' />
                      </div>
                    </div> :
                    
                    <div>
                      <UploadIcon className='upload-icon icon-md p-2 mb-2' />
                      <div className='upload-instructions'><span className='link-color fw-bold'>Click to upload</span> or drag and drop <br /> PDF, DOC, PPT</div>
                    </div>
                    }
                  </div>
                </div>
              </div>
            )}
        </div>}
      </div>}
      {nonReferenced && (
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
              Delete Current File
            </label>
       
              {activeOption == FORM_OPTIONS.MARK_DELETE && (
                <div className='option-instruction mt-2'> 
                  <p>This file is not referenced anywhere in your course. Consider deleting it to clear up some junk</p>
                  <label>Please type <span className='fw-bolder'>'PERMANENTLY DELETE'</span> to permanently delete the following file from your course: <span className='fw-bold truncated-text-ellipse'>{activeFile.fileName}</span></label>
                  <input
                    type='text'
                    tabIndex={0}
                    className='w-100 mt-1'
                    onChange={(e) => checkCanDelete(e)}
                    /> 
                </div>
              )}
          </div>
      )}

    </>
  )
}