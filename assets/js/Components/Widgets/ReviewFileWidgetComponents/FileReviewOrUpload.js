import React from 'react'
import './FileReviewOrUpload.css'
import UploadIcon from '../../Icons/UploadIcon'

const FileReviewOrUpload = ({
    activeFile,
    toggleMarkReview,
    handleDrop,
    handleKeyPress,
    handleDragOver,

}) => {
  return (
  <>
        <div className='file-review-container flex-column justify-content-center align-items-center p-4'>
            <div className='file-review-card w-100 p-4 flex-col justify-content-center align-items-center'>
                <div className='option-section w-100 text-center p-4'>
                    <p className='option-title fw-bold'>Option 1: Keep Current File</p>
                    <p className="option-description">I verified this file meets accessibility guidelines.</p>
                    <button className='btn-primary w-100'>Mark as Reviewed</button>
                </div>
            

                <div className="divider-container flex-row justify-content-center align-items-center">
                    <div className="divider-line"></div>
                    <span className="divider-text pt-1 pl-3 pr-3 flex-row align-items-center justify-content-center">OR</span>
                    <div className="divider-line"></div>
                </div>

                <div className='option-section w-100 text-center p-4'>
                    <p className='option-title fw-bold'>Option 2: Upload New Replacement</p>
                    <div className='file-upload-box w-100 p-2'>
                        <UploadIcon className='upload-icon icon-sm p-2' />
                        <p className='upload-instruction'><span className='link-color fw-bolder'>Click to upload</span> or drag and drop <br />SVG, PNG, JPG or GIF (max. 800x400px) </p>
                    </div>
                </div>
            </div>
            
        </div>
  </>
  )
}

export default FileReviewOrUpload