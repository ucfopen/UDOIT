import React, { useState, useEffect } from 'react';
import DownloadIcon from './Icons/DownloadIcon';
import ExternalLinkIcon from './Icons/ExternalLinkIcon';
import EarIcon from './Icons/EarIcon';
import ProgressIcon from './Icons/ProgressIcon';

import './FixIssuesContentPreview.css';

export default function FixIssuesContentPreview({
  t,
  settings,
  activeIssue,
  activeContentItem,
  editedElement
}) {

  const [taggedContent, setTaggedContent] = useState(null)
  const [altTextPreview, setAltTextPreview] = useState(null)
  const [altTextIsOpen, setAltTextIsOpen] = useState(true)

  const convertErrorHtmlString = (htmlText) => {
    const parser = new DOMParser()
    let tempElement = parser.parseFromString(htmlText, 'text/html').body.firstElementChild

    // Get the element's alt attribute, if it exists
    let altText = tempElement.getAttribute('alt') || tempElement.getAttribute('aria-label')
    if (altText && altText !== '') {
      setAltTextPreview(altText)
    }
    else {
      setAltTextPreview(null)
    }

    tempElement.classList.add('ufixit-error-highlight')

    return tempElement
  }

  const getTaggedContent = (activeIssue, activeContentItem) => {
    if (!activeIssue || !activeContentItem) {
      return null
    }

    let rawHtml = activeContentItem.body
    let errorHtml = activeIssue?.issueData?.sourceHtml || undefined
    if(activeIssue.status === settings.FILTER.FIXED) {
      errorHtml = activeIssue?.issueData?.newHtml || errorHtml
    }
    setAltTextPreview(null)

    if(errorHtml === undefined || errorHtml === '') {
      return rawHtml
    }

    const parser = new DOMParser()
    const serializer = new XMLSerializer()

    const doc = parser.parseFromString(rawHtml, 'text/html')
    const errorDoc = parser.parseFromString(errorHtml, 'text/html')

    const errorElement = errorDoc.body.firstElementChild

    if (!errorElement) {
      return null
    }

    const errorString = errorElement.outerHTML.trim()
    let errorCount = 0

    doc.body.querySelectorAll(errorElement.tagName).forEach((element) => {
      if (element.outerHTML.trim() === errorString) {
        errorCount++
        const taggedElement = convertErrorHtmlString(errorHtml)
        element.replaceWith(taggedElement)
      }
    })

    if (errorCount > 1) {
      console.warn("Multiple matching elements found for error.")
    }

    return serializer.serializeToString(doc)
  }

  useEffect(() => {
    setTaggedContent(getTaggedContent(activeIssue, activeContentItem))
  }, [activeIssue, activeContentItem])

  useEffect(() => {
    const element = document.getElementsByClassName('ufixit-error-highlight')[0]
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'center' })
    }
  }, [taggedContent])

  useEffect(() => {
    if (editedElement) {
      const targetElement = document.getElementsByClassName('ufixit-error-highlight')[0]
      
      if (targetElement) {
        const tempElement = convertErrorHtmlString(editedElement)
        
        // Replace the target element with the new element
        targetElement.replaceWith(tempElement)
      }
    }
  }, [editedElement])

  const toggleAltTextIsOpen = () => {
    setAltTextIsOpen(!altTextIsOpen)
  }

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
      default:
        return fileType
    }
  }

  // Converts file size (in bytes) to a human-readable format (ie 29.6 KB or 3.5 MB)
  const getReadableFileSize = (fileSize) => {
    if (fileSize < 1024) {
      return fileSize + ' bytes'
    }
    else if (fileSize < 1048576) {
      return (fileSize / 1024).toFixed(1) + ' KB'  // A kilobyte is 1024 bytes
    }
    else {
      return (fileSize / 1048576).toFixed(1) + ' MB'  // A megabyte is 1024 kilobytes (1024^2 bytes)
    }
  }

  const getReadableDateTime = (dateString) => {
    let dateObj = new Date(dateString)
    let date = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    let time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    return `${date} ${time}`
  }

  return (
    <>
      { taggedContent && activeContentItem ? (
        <>
          <a href={activeContentItem.url} target="_blank" rel="noreferrer" className="ufixit-content-label flex-row justify-content-between mt-3">
            <div className="flex-column flex-center">
              <h2 className="fake-h1">{activeContentItem.title}</h2>
            </div>
            <div className="flex-column flex-center">
              <ExternalLinkIcon className="icon-lg link-color" />
            </div>
          </a>
          <div className="ufixit-content-preview">
            <div dangerouslySetInnerHTML={{__html: taggedContent}} />
            { altTextPreview && (
              <div className={`alt-text-preview${altTextIsOpen ? '' : ' alt-text-preview-closed'}`} onClick={toggleAltTextIsOpen}>
                <div className="alt-text-preview-icon" alt={t('label.btn.screen_reader')} title={t('label.btn.screen_reader')}>
                  <EarIcon className="icon-md primary-dark" />
                </div>
                <div className="alt-text-preview-text">{altTextPreview}</div>
              </div>
            )}
          </div>
          <div className="ufixit-content-progress">
            Progress bar goes here.
          </div>
        </>
      ) : activeIssue ? (
        <>
          <a href={activeIssue.contentUrl} target="_blank" rel="noreferrer" className="ufixit-content-label flex-row justify-content-between mt-3">
            <div className="flex-column flex-center allow-word-break">
              <h2 className="fake-h1">{activeIssue.contentTitle}</h2>
            </div>
            <div className="flex-column flex-center">
              <ExternalLinkIcon className="icon-lg link-color" />
            </div>
          </a>
          { activeIssue.contentType === settings.FILTER.FILE ? (
            <div className="flex-grow-1">
              <div className="ufixit-file-details">
                <div className="flex-row mt-2">
                  <div className="flex-column flex-center ufixit-file-details-label">{t('label.file_name')}</div>
                  <div className="flex-column flex-center allow-word-break">{activeIssue.fileData.fileName}</div>
                </div>
                <div className="flex-row mt-2">
                  <div className="flex-column flex-center ufixit-file-details-label">{t('label.file_type')}</div>
                  <div className="flex-column flex-center allow-word-break">{getReadableFileType(activeIssue.fileData.fileType)}</div>
                </div>
                <div className="flex-row mt-2">
                  <div className="flex-column flex-center ufixit-file-details-label">{t('label.file_size')}</div>
                  <div className="flex-column flex-center allow-word-break">{getReadableFileSize(activeIssue.fileData.fileSize)}</div>
                </div>
                <div className="flex-row mt-2">
                  <div className="flex-column flex-center ufixit-file-details-label">{t('label.file_updated')}</div>
                  <div className="flex-column flex-center allow-word-break">{getReadableDateTime(activeIssue.fileData.updated)}</div>
                </div>
              </div>
              <div className="mt-3 flex-row justify-content-center gap-3">
                { activeIssue.fileData.downloadUrl && (
                  <button className="btn btn-secondary btn-icon-left" onClick={() => window.open(activeIssue.fileData.downloadUrl, 'download')}>
                    <DownloadIcon />
                    <div className="flex-column justify-content-center">{t('label.download')}</div>
                  </button>
                )}
                { activeIssue.fileData.lmsUrl && (
                  <button className="btn btn-secondary btn-icon-left" onClick={() => window.open(activeIssue.fileData.lmsUrl, '_blank', 'noopener,noreferrer')}>
                    <ExternalLinkIcon />
                    <div className="flex-column justify-content-center">{t('label.open_in_lms')}</div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="ufixit-content-preview">
              <div className="flex-row justify-content-center mt-3">
                <div className="flex-column justify-content-center">
                  <ProgressIcon className="icon-lg primary spinner" />
                </div>
                <div className="flex-column justify-content-center ms-3">
                  <h2 className="mt-0 mb-0">{t('label.loading_content')}</h2>
                </div>
              </div>
            </div>
          )}
          <div className="ufixit-content-progress">
            Progress bar goes here.
          </div>
        </>
      ) : (
        <>
          <div className="ufixit-content-preview">
              <div className="flex-row justify-content-center mt-3">
                <div className="flex-column justify-content-center">
                  <h2 className="mt-0 mb-0">{t('label.no_selection')}</h2>
                </div>
              </div>
            </div>
          <div className="ufixit-content-progress">
            Progress bar goes here.
          </div>
        </>
      )}
    </>
  )
}