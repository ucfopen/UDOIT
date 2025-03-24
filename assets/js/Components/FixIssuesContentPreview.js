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

  const convertErrorHtmlElement = (htmlElement) => {
    let altText= htmlElement.getAttribute('alt') || htmlElement.getAttribute('aria-label')
    if(altText && altText !== '') {
      setAltTextPreview(altText)
    } else {
      setAltTextPreview(null)
    }
    htmlElement.classList.add('ufixit-error-highlight')
    return htmlElement
  }

  // When JavaScript's DOMParser encounters certain elements, it WILL NOT parse them unless they are wrapped
  // in the required parent element. This function wraps the error HTML in the required parent element so that
  // the DOMParser can parse it correctly.
  const parseErrorSafely = (errorHtml) => {
    const parser = new DOMParser()
    let tagName = errorHtml.match(/^<(\w+)/)?.[1].toLowerCase()

    const SPECIAL_CASES = {
      thead: "<table>{content}</table>",
      tbody: "<table>{content}</table>",
      tfoot: "<table>{content}</table>",
      caption: "<table>{content}</table>",
      tr: "<table><tbody>{content}</tbody></table>",
      td: "<table><tbody><tr>{content}</tr></tbody></table>",
      th: "<table><tbody><tr>{content}</tr></tbody></table>",
      colgroup: "<table>{content}</table>",
      col: "<table><colgroup>{content}</colgroup></table>",
      option: "<select>{content}</select>",
      optgroup: "<select>{content}</select>",
      legend: "<fieldset>{content}</fieldset>",
      dt: "<dl>{content}</dl>",
      dd: "<dl>{content}</dl>",
      li: "<ul>{content}</ul>",
      area: "<map>{content}</map>",
      param: "<object>{content}</object>",
      source: "<video>{content}</video>",
      track: "<video>{content}</video>"
    }

    // Wrap special elements inside their required parent(s) if they are in the SPECIAL_CASES object
    let wrappedHTML = SPECIAL_CASES[tagName] ? SPECIAL_CASES[tagName].replace('{content}', errorHtml) : errorHtml

    // Parse the wrapped HTML
    const tempDoc = parser.parseFromString(wrappedHTML, "text/html")

    // Extract the real element from the correct position
    if (SPECIAL_CASES[tagName]) {
        return tempDoc.querySelector(tagName)
    } else {
        return tempDoc.body.firstElementChild
    }
  }

  const getTaggedContent = (activeIssue, activeContentItem) => {

    setAltTextPreview(null)
    if (!activeIssue || !activeContentItem) {
      return null
    }

    let fullPageHtml = activeContentItem.body
    let errorHtml = activeIssue?.issueData?.sourceHtml || undefined
    if(activeIssue.status === settings.FILTER.FIXED) {
      errorHtml = activeIssue?.issueData?.newHtml || errorHtml
    }

    if(errorHtml === undefined || errorHtml === '') {
      return fullPageHtml
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(fullPageHtml, 'text/html')

    const errorElement = parseErrorSafely(errorHtml)

    if(!errorElement) {
      console.warn("Error element cannot be reproduced.")
      return fullPageHtml
    }

    // Find the first element in the document that matches the error element.
    const docElement = Array.from(doc.body.querySelectorAll(errorElement.tagName)).find((matchElement) => {
      return matchElement.outerHTML.trim() === errorElement.outerHTML.trim()
    })

    // If the element is found, update it with the appropriate class.
    if(docElement) {
      docElement.replaceWith(convertErrorHtmlElement(docElement))
      const serializer = new XMLSerializer()
      return serializer.serializeToString(doc)
    }

    return fullPageHtml
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