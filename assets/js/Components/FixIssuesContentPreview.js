import React, { useState, useEffect, useRef } from 'react'
import DailyProgress from './DailyProgress'
import DownloadIcon from './Icons/DownloadIcon'
import ExternalLinkIcon from './Icons/ExternalLinkIcon'
import EarIcon from './Icons/EarIcon'
import ProgressIcon from './Icons/ProgressIcon'
import UpArrowIcon from './Icons/UpArrowIcon'
import DownArrowIcon from './Icons/DownArrowIcon'
import * as Html from '../Services/Html'
import useInViewPort from './Hooks/useInViewPort'

import './FixIssuesContentPreview.css'

export default function FixIssuesContentPreview({
  t,
  settings,
  activeIssue,
  activeContentItem,
  editedElement,
  sessionIssues,
}) {

  const [taggedContent, setTaggedContent] = useState(null)
  const [altTextPreview, setAltTextPreview] = useState(null)

  const [issueElementDefaultRect, setIssueElementDefaultRect] = useState(null)
  const issueElementRef = useRef(null)
  const issueElementVisible = useInViewPort(issueElementRef, { threshold: 0.5 })

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [debouncedVisible, setDebouncedVisible] = useState(true)
  const [debouncedDirection, setDebouncedDirection] = useState(null)

  useEffect(() => {
    // the scroll-to-button will flash sometimes when activeIssue changes
    // so, we wait 500ms before it is even able to display
    setIsInitialLoad(true)
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [activeIssue])

  useEffect(() => {
    if (issueElementRef.current) {
      const rect = issueElementRef.current.getBoundingClientRect()
      setIssueElementDefaultRect(rect)
    }
  }, [activeIssue, issueElementRef.current])

  useEffect(() => {
    // we also debounce the visibility and direction of the scroll-to-issue button
    // which fixes the button flashing even when the element visible
    // (presumably because the issue element is changing which useInViewPort doesnt check for immediately)
    const timer = setTimeout(() => {
      setDebouncedVisible(issueElementVisible)
      setDebouncedDirection(getScrollDirection(issueElementRef.current, issueElementDefaultRect))
    }, 100)
  
    return () => clearTimeout(timer)
  }, [issueElementVisible, issueElementRef.current, issueElementDefaultRect])
  

  const getScrollDirection = (element, defaultRect) => {
    if (!element || !defaultRect || !issueElementRef || issueElementVisible) return null

    const newRect = element.getBoundingClientRect()

    if (newRect.top < defaultRect.top) {
      return 'up'
    }
    else if (newRect.bottom > defaultRect.bottom) {
      return 'down'
    }
    else {
      return null
    }
  }

  const SHOW_ALT_TEXT_RULES = [
    "ImageAltIsDifferent",
    "ImageAltIsTooLong",
    "ImageAltNotEmptyInAnchor",
    "ImageHasAlt",
    "ImageHasAltDecorative",
    "ImageAltNotPlaceholder",

    "imagemap_alt_exists",
    "img_alt_background",
    "img_alt_decorative",
    "img_alt_misuse",
    "img_alt_null",
    "img_alt_redundant",
    "img_alt_valid",

    "applet_alt_exists",
    "embed_alt_exists",
    "frame_title_exists",
    "media_alt_brief",
    "media_alt_exists",
    "object_text_exists",

    "aria_application_labelled",
    "aria_accessiblename_exists",

    "aria_application_label_unique",
    "aria_banner_label_unique",
    "aria_landmark_name_unique",
    "aria_article_label_unique",
    "aria_complementary_label_unique",
    "aria_contentinfo_label_unique",
    "aria_document_label_unique",
    "aria_form_label_unique",
    "aria_main_label_unique",
    "aria_navigation_label_unique",
    "aria_region_label_unique",
    "aria_search_label_unique",
    "aria_toolbar_label_unique",
  ]

  const SHOW_HEADINGS_RULES = [
    "HeadersHaveText",
    "ParagraphNotUsedAsHeader",
    "heading_content_exists",
    "heading_markup_misuse",
    "text_block_heading",
  ]

  const convertErrorHtmlString = (htmlText) => {
    let tempElement = Html.toElement(htmlText)
    if(tempElement){
      return convertErrorHtmlElement(tempElement)
    }
    return null
  }

  const convertErrorHtmlElement = (htmlElement) => {
    let altText = htmlElement.getAttribute('alt') || htmlElement.getAttribute('aria-label')
    if(altText && altText !== '') {
      setAltTextPreview(altText)
    } else {
      setAltTextPreview(null)
    }
    htmlElement.classList.add('ufixit-error-highlight')

    return htmlElement
  }

  const addPreviewHelperElements = () => {
    if(!activeIssue) {
      return
    }

    // If the issue edits the alt text, we need to show the auto-updating alt text preview
    if (SHOW_ALT_TEXT_RULES.includes(activeIssue.scanRuleId)) {
      const htmlElement = document.getElementsByClassName('ufixit-error-highlight')[0]
      let altText = Html.getAccessibleName(htmlElement)
      
      // If there is alt text to show...
      if (altText && altText.trim() !== '') {
        let existingPreviewTextElement = document.querySelector('.ufixit-alt-text-preview-text')
        
        // Update the existing alt text preview with the new text...
        if (existingPreviewTextElement) {
          existingPreviewTextElement.innerHTML = altText.trim()
        }
        // Or create it from scratch if it doesn't exist.
        else {
          let altTextPreviewCode =
            '<div class="ufixit-alt-text-preview">' +
              '<div class="ufixit-alt-text-preview-icon" alt="' + t('fix.label.screen_reader') + '" title="' + t('fix.label.screen_reader') + '">' +
                '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="icon-md"><path d="M360-500q42 0 71-29.5t29-70.5q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 41 29 70.5t71 29.5Zm352 93q-15-6-21.5-20.5T690-456q15-34 22.5-70.5T720-600q0-37-7.5-73T690-743q-6-14 1-27.5t22-19.5q17-6 32.5 1.5T768-764q17 39 24.5 80.5T800-600q0 43-8 84.5T767-434q-7 17-22.5 25t-32.5 2Zm116 116q-14-7-20-21.5t2-27.5q35-59 52.5-124T880-598q0-69-18-134.5T809-858q-8-13-1.5-27.5T828-907q17-8 34.5-.5T889-883q35 66 53 137t18 146q0 75-18.5 147.5T888-314q-9 17-26 24t-34-1Zm-668 51q0-17-11.5-28.5T120-280q-17 0-28.5 11.5T80-240q0 66 47 113t113 47q62 0 101.5-31t60.5-91q17-50 32.5-70t71.5-64q62-50 98-113t36-151q0-119-80.5-199.5T360-880q-119 0-199.5 80.5T80-600q0 17 11.5 28.5T120-560q17 0 28.5-11.5T160-600q0-85 57.5-142.5T360-800q85 0 142.5 57.5T560-600q0 68-27 116t-77 86q-52 38-81 74t-43 78q-14 44-33.5 65T240-160q-33 0-56.5-23.5T160-240Z"></path></svg>' +
              '</div>' +
              '<div class="ufixit-alt-text-preview-text">' +
                altText.trim() +
              '</div>' +
            '</div>'

          htmlElement.insertAdjacentHTML('afterend', altTextPreviewCode)
        }
      }
      // If there is no alt text to show, remove the preview element.
      else {
        document.querySelector('.ufixit-alt-text-preview')?.remove()
      }
    }

    if(SHOW_HEADINGS_RULES.includes(activeIssue.scanRuleId)) {
      const htmlElement = document.getElementsByClassName('ufixit-error-highlight')[0]
      const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

      if(htmlElement && headingTags.includes(htmlElement.tagName.toLowerCase())) {
        const headingType = htmlElement.tagName.toUpperCase()
        htmlElement.classList.add('ufixit-heading-highlight')
        htmlElement.setAttribute('ufixit-heading-type', headingType)
      }
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

    const errorElement = Html.toElement(errorHtml)

    if(!errorElement) {
      console.warn("Error element cannot be reproduced.")
      return fullPageHtml
    }

    // Find all of the <details> elements in the document (if present).
    const detailsElements = Array.from(doc.body.querySelectorAll('details'))
    detailsElements.forEach((detailsElement) => {
      // Open each element before we do the initial render
      if (!detailsElement.open) {
        detailsElement.open = true
      }
    })

    // Find the first element in the document that matches the error element.
    const docElement = Array.from(doc.body.querySelectorAll(errorElement.tagName)).find((matchElement) => {
      return matchElement.outerHTML.trim() === errorElement.outerHTML.trim()
    })

    // If the element is found, update it with the appropriate class.
    if(docElement) {
      docElement.replaceWith(convertErrorHtmlElement(docElement))
    }

    // Find all of the heading elements and show them when a relevant issues is being edited.
    if(SHOW_HEADINGS_RULES.includes(activeIssue.scanRuleId)) {
      const headingElements = Array.from(doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      headingElements.forEach((headingElement) => {
        const headingType = headingElement.tagName.toUpperCase()
        headingElement.classList.add('ufixit-heading-highlight')
        headingElement.setAttribute('ufixit-heading-type', headingType)
      })
    }

    const serializer = new XMLSerializer()
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
    addPreviewHelperElements()
  }, [taggedContent])

  useEffect(() => {
    if (editedElement) {
      const targetElement = document.getElementsByClassName('ufixit-error-highlight')[0]
      
      if (targetElement) {
        const tempElement = convertErrorHtmlString(editedElement)
        
        // Replace the target element with the new element
        targetElement.replaceWith(tempElement)

        addPreviewHelperElements()
      }
    }
  }, [editedElement])

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
        return t('label.mime.unknown')
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

  const scrollToElement = (element) => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }

  const renderScrollButton = () => {
    if (isInitialLoad) return null

    let button;
    if (debouncedDirection === 'up') {
      button = <UpArrowIcon className="icon-arrow" />
    }
    else if (debouncedDirection === 'down') {
      button = <DownArrowIcon className="icon-arrow" />
    }

    if (issueElementRef.current && !debouncedVisible && debouncedDirection) {
      return (
        <div className='scroll-to-error-container'>
          <div
            className={`scroll-to-error ${debouncedDirection ? 'scroll-to-error-' + debouncedDirection : ''}`}
            onClick={() => scrollToElement(issueElementRef.current)}
          >
            {button}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <>
      { taggedContent && activeContentItem ? (
        <>
          <a href={activeContentItem.url} target="_blank" rel="noreferrer" className="ufixit-content-label flex-row justify-content-between mt-2 mb-3">
            <div className="flex-column flex-center">
              <h2 className="fake-h1">{activeContentItem.title}</h2>
            </div>
            <div className="flex-column flex-center">
              <ExternalLinkIcon className="icon-lg link-color" />
            </div>
          </a>
          <div className="ufixit-content-preview">
            {renderScrollButton()}
            <div ref={node => {
              if (node) {
                const highlightElement = node.getElementsByClassName('ufixit-error-highlight')[0]
                issueElementRef.current = highlightElement
              }
            }} dangerouslySetInnerHTML={{__html: taggedContent}} />
          </div>
        </>
      ) : activeIssue ? (
        <>
          <a href={activeIssue.contentUrl} target="_blank" rel="noreferrer" className="ufixit-content-label flex-row justify-content-between mt-3 mb-3">
            <div className="flex-column flex-center allow-word-break">
              <h2 className="fake-h1">{activeIssue.contentTitle}</h2>
            </div>
            <div className="flex-column flex-center">
              <ExternalLinkIcon className="icon-lg link-color" alt="" />
            </div>
          </a>
          { activeIssue.contentType === settings.FILTER.FILE_OBJECT ? (
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
                  <div className="flex-column flex-center allow-word-break">{getReadableFileSize(activeIssue.fileData.fileSize)}</div>
                </div>
                <div className="flex-row mt-2">
                  <div className="flex-column flex-center ufixit-file-details-label">{t('fix.label.file_updated')}</div>
                  <div className="flex-column flex-center allow-word-break">{getReadableDateTime(activeIssue.fileData.updated)}</div>
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
          ) : (
            <div className="ufixit-content-preview">
              <div className="flex-row justify-content-center mt-3">
                <div className="flex-column justify-content-center">
                  <ProgressIcon className="icon-lg primary spinner" />
                </div>
                <div className="flex-column justify-content-center ms-3">
                  <h2 className="mt-0 mb-0">{t('fix.label.loading_content')}</h2>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="ufixit-content-preview">
            <div className="flex-column">
              <div className="flex-row justify-content-center text-center mt-3 ms-4 me-4">
                <h2 className="mt-0 mb-0 primary-dark">{t('fix.label.no_selection')}</h2>
              </div>
              <div className="flex-row justify-content-center text-center mt-3 ms-4 me-4">
                <div>{t('fix.msg.select_issue')}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}