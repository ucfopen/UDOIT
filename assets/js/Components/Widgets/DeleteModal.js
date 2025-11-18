import React from 'react'
import './DeleteModal.css'
import DeleteIcon from '../Icons/DeleteIcon'
import CloseIcon from '../Icons/CloseIcon'

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
        <p className=''>Are you sure you want to  <span className='fw-bolder'>delete</span> this file? Deleting this file means you will lose access to this file from your webcourses <span className='fw-bolder'>permanently</span></p>
        <div className='flex-row p-1 gap-2'>
            <div><button className='btn-warn btn-icon-left' onClick={() => toggleModal(true)}><DeleteIcon className="icon-md" alt="" />Delete</button></div>
            <div><button className='btn-warn-secondary btn-icon-left' onClick={() => toggleModal(false)}><CloseIcon className="icon-md" alt="" />Cancel</button></div>
        </div>
    </div>
   
  )
}

export default DeleteModal