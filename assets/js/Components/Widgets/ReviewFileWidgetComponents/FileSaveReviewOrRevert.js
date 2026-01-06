import React from 'react'

const FileSaveReviewOrRevert = ({
    handleSubmit,
    handleResolve,
    markReview,
    uploadedFile

}) => {
  return (
    <div className='w-100 m-1 flex-row justify-content-end align-items-end'>
        <button className={markReview || uploadedFile ? 'btn-primary' : ''} disabled={!markReview && !uploadedFile}  onClick={markReview ? () => handleResolve() : () => handleSubmit()}>Confirm</button>
    </div>
  )
}

export default FileSaveReviewOrRevert