import React from 'react'
import './FileReferenceTable.css'
import ExternalLinkIcon from '../../Icons/ExternalLinkIcon'

const FileReferenceTable = ({
    activeFile,
    fileReferenceHolder,
    selectedRef,
    handleReferenceSelect,
    uploadedFile,
    toggleReplace,
    handleToggleReplace
    
}) => {
  return (
    <div className='file-reference-table-container w-100'>
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
                                <td className='content-title'>{ref.contentItemTitle}</td>
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