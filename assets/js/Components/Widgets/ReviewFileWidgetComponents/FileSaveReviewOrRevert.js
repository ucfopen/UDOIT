import React from 'react'

const FileSaveReviewOrRevert = ({
    activeFile,
    handleSubmit,
    handleResolve,
    markReview,
    uploadedFile,
    references,
    handleRevert

}) => {
  return (
    <div className='w-100 m-1 flex-row justify-content-end align-items-end gap-1'>
        {references.length > 0 && activeFile.replacement ? 
        (
            <>
                <button className='btn-warn'>Delete</button>
                <button className='btn-secondary' onClick={handleRevert}>Revert</button>
            </>
        ) :
            
            <button className={markReview || uploadedFile ? 'btn-primary' : ''} disabled={!markReview && !uploadedFile}  onClick={markReview ? () => handleResolve() : () => handleSubmit()}>Confirm</button>}
    </div>
  )
}

export default FileSaveReviewOrRevert