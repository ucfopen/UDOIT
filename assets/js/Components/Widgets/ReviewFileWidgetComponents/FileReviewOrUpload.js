import React from 'react'
import './FileReviewOrUpload.css'
import UploadIcon from '../../Icons/UploadIcon'
import ContentPageIcon from '../../Icons/ContentPageIcon'

const FileReviewOrUpload = ({
    activeFile,
    toggleMarkReview,
    handleDrop,
    handleKeyPress,
    handleDragOver,
    markReview,
    handleFileSelect,
    uploadedFile,
    removeUploadedFile

}) => {
  return (
  <>
        <div className='file-review-container flex-column justify-content-center align-items-center p-4'>
            <div className='file-review-card w-100 p-4 flex-col justify-content-center align-items-center'>
                
                {activeFile.replacement ? 
                
                <>
                    <div className='option-section w-100 text-center p-4'>
                        <p className='option-title fw-bold'>New File</p>
                        <div className='file-details flex-col justify-content-center'>
                            <div className='file-name-container flex-row gap-1 align-items-center justify-between'>
                                <ContentPageIcon fill="var(--primary-color)" />
                                <div className='file-name fw-bold'>{activeFile.replacement.fileName}</div>
                            </div>
                        </div>
                    </div>
                </> 
                
                :
                <>
                    <div className='option-section w-100 text-center p-4' id={activeFile.reviewed || uploadedFile ? 'disabled-component' : ''}>
                        <p className='option-title fw-bold'>{markReview ? "Marked as Reviewed": "Option 1: Mark as Review"}</p>
                        <p className="option-description">{ markReview ? "You have ensured the file is accessible. No changes will be made." : "I verified this file meets accessibility guidelines"}</p>
                        <button className={`${markReview ? '' : 'btn-primary'} w-100`} onClick={toggleMarkReview}>{markReview ? "File Needs Changes" : "Mark as Reviewed"}</button>
                    </div>
                
                    <div className="divider-container flex-row justify-content-center align-items-center">
                        <div className="divider-line"></div>
                        <span className="divider-text pt-1 pl-3 pr-3 flex-row align-items-center justify-content-center">OR</span>
                        <div className="divider-line"></div>
                    </div>

                    <div className='option-section w-100 text-center p-4' id={markReview ? 'disabled-component' : ''}>
                        <p className='option-title fw-bold'>Option 2: Upload New Replacement</p>
                        {uploadedFile ? 
                        
                        <div className='file-info-box p-2'>
                            <div className='flex-row gap-1 align-items-start text-start p-1'                         
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={handleFileSelect}
                                onKeyDown={handleKeyPress}>
                                <ContentPageIcon fill="var(--primary-color)" className='file-icon icon-md p-2' />
                                <div className='flex-column'>
                                    <div className='uploaded-file-name'>{uploadedFile.name}</div>
                                {activeFile.reviewed ? "" : <div className='upload-instruction-new'>Click or drag to browse</div>}
                                </div>
                            </div>
                            <button className='btn-small btn-warn' onClick={removeUploadedFile}>Remove File</button>
                        </div> 
                        : 
                        <div className='file-upload-box w-100 p-2'
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onClick={handleFileSelect}
                            onKeyDown={handleKeyPress}
                        >
                            <UploadIcon className='upload-icon icon-sm p-2' />
                            <p className='upload-instruction'><span className='link-color fw-bolder'>Click to upload</span> or drag and drop <br />SVG, PNG, JPG or GIF (max. 800x400px) </p>
                        </div>}
                    </div>
                </>
                
                }
            </div>
            
        </div>
  </>
  )
}

export default FileReviewOrUpload