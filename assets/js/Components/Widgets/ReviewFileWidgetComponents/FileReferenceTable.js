import React from 'react'
import './FileReferenceTable.css'
import ExternalLinkIcon from '../../Icons/ExternalLinkIcon'

const FileReferenceTable = ({
    fileReferenceHolder,
    selectedRef,
    handleReferenceSelect,
    uploadedFile
    
}) => {
  return (
    <div className='file-reference-table-container w-100'>
         <div className='flex-row justify-content-between'>
            <p>References in Course</p>
            <p>{`${Object.keys(selectedRef).length} of ${fileReferenceHolder.length} references replaced`}</p>
         </div>
         <div className='table-wrapper'>
            <table className='references-table'>
                <thead>
                        <tr>
                            <th>Content</th>
                            <th>Location</th>
                            <th>Status</th>
                        </tr>
                </thead>
                <tbody>
                    {fileReferenceHolder?.map((ref, index) => (
                            <tr key={index}>
                                <td className='content-title'>
                                <div className='flex-row align-items-center gap-1'>
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox"
                                        id="ref-checkbox"
                                        checked={(ref.contentItemLmsId ? ref.contentItemLmsId : ref.itemId) in selectedRef}
                                        onChange={() => handleReferenceSelect(ref)}
                                        disabled={!uploadedFile}
                                    />
                                    <label htmlFor='ref-checkbox' className='ref-checkbox-label'>{ref.contentItemTitle}</label>
                                </div>
                                </td>
                                <td>
                                    <a href={ref.contentItemUrl} target='_blank' className='location-link'>
                                        External URL
                                        <ExternalLinkIcon />
                                    </a>
                                </td>
                                <td>
                                    <span className="status-badge">
                                        <span className="status-dot"></span>
                                        {ref.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
         </div>
    </div>
  )
}

export default FileReferenceTable