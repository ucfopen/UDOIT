import React from 'react'
import './DeleteModal.css'

const DeleteModal = ({
    handleModalVisibility,
    handleFileDelete
}) => {
    const toggleModal = (deleteFile) => {
        handleModalVisibility()
        if(deleteFile){
            handleFileDelete()
        }
    }
  return (
    <div className='modal-container flex-column'>
        <p className=''>Are you sure you want to delete this file? Deleting this file means you will lose access to this file from your webcourses permanently</p>
        <div className='flex-row p-1 gap-2'>
            <button className='btn-warn' onClick={() => toggleModal(true)}>Delete</button>
            <button className='btn-warn-secondary' onClick={() => toggleModal(false)}>Cancel</button>
        </div>
    </div>
   
  )
}

export default DeleteModal