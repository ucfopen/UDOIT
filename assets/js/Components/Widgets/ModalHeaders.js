import React from 'react'
import CloseIcon from '../Icons/CloseIcon'

const ModalHeaders = ({title, closeModal}) => {
  return (
    <div className='w-100 flex-row justify-content-between align-items-center p-1 m-1'>
        <h3 className='modal-title'>{title}</h3>
        <div className='close-icon-btn' role='button' onClick={closeModal}><CloseIcon /> </div>
    </div>
  )
}

export default ModalHeaders