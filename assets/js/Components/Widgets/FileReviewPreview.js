import React, { useState, useEffect, useRef } from 'react'
import DownloadIcon from '../Icons/DownloadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import * as Text from '../../Services/Text'
import './FixIssuesContentPreview.css'


export default function FixIssuesContentPreview({
  t,
  settings,

  activeIssue,
}) {

  const getReadableFileType = (fileType) => {
    switch (fileType) {
      case 'doc':
        return t('label.mime.doc')
      case 'ppt':
        return t('label.mime.ppt')
      case 'xls':
        return t('label.mime.xls')
      case 'pdf':
        return t('label.mime.pdf')
      case 'audio':
        return t('label.mime.audio')
      case 'video':
        return t('label.mime.video')
      default:
        return t('label.mime.unknown')
    }
  }

  return (
    <>
      <a href={activeIssue.contentUrl} target="_blank" rel="noreferrer" className="ufixit-content-label flex-row justify-content-between mt-0 mb-3">
        <div className="flex-column flex-center allow-word-break">
          <h2 className="fake-h1">{activeIssue.contentTitle}</h2>
        </div>
        <div className="flex-column flex-center">
          <ExternalLinkIcon className="icon-lg link-color" alt="" />
        </div>
      </a>
      <div className="ufixit-content-preview">
        <div className="ufixit-content-preview-main">
          <div className="flex-grow-1">
            <div className="ufixit-file-details">
              <div className="flex-row mt-2">
                <div className="flex-column flex-center ufixit-file-details-label">{t('fix.label.file_name')}</div>
                <div className="flex-column flex-center allow-word-break">{activeIssue.fileData.fileName}</div>
              </div>
              <div className="flex-row mt-2">
                <div className="flex-column flex-center ufixit-file-details-label">{t('fix.label.file_type')}</div>
                <div className="flex-column flex-center allow-word-break">{getReadableFileType(activeIssue.fileData.fileType)}</div>
              </div>
              <div className="flex-row mt-2">
                <div className="flex-column flex-center ufixit-file-details-label">{t('fix.label.file_size')}</div>
                <div className="flex-column flex-center allow-word-break">{Text.getReadableFileSize(activeIssue.fileData.fileSize)}</div>
              </div>
              <div className="flex-row mt-2">
                <div className="flex-column flex-center ufixit-file-details-label">{t('fix.label.file_updated')}</div>
                <div className="flex-column flex-center allow-word-break">{Text.getReadableDateTime(activeIssue.fileData.updated)}</div>
              </div>
            </div>
            <div className="mt-3 flex-row justify-content-center gap-3">
              { activeIssue.fileData.downloadUrl && (
                <button className="btn btn-secondary btn-icon-left" onClick={() => window.open(activeIssue.fileData.downloadUrl, 'download')}>
                  <DownloadIcon />
                  <div className="flex-column justify-content-center">{t('fix.button.download_file')}</div>
                </button>
              )}
              { activeIssue.fileData.lmsUrl && (
                <button className="btn btn-secondary btn-icon-left" onClick={() => window.open(activeIssue.fileData.lmsUrl, '_blank', 'noopener,noreferrer')}>
                  <ExternalLinkIcon />
                  <div className="flex-column justify-content-center">{t('fix.button.view_in_lms')}</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}