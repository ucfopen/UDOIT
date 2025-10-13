import React, { useState, useEffect, useRef } from 'react'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import ProgressIcon from '../Icons/ProgressIcon'
import InfoIcon from '../Icons/InfoIcon'
import { formNameFromRule, formNames } from '../../Services/Ufixit'
import * as Html from '../../Services/Html'
import UpArrowIcon from '../Icons/UpArrowIcon'
import DownArrowIcon from '../Icons/DownArrowIcon'
import './FixIssuesContentPreview.css'


export default function FixIssuesContentPreview({
  t,
  settings,

  activeContentItem,
  activeIssue,
  contentItemsBeingScanned,
  liveUpdateToggle,
  setIsErrorFoundInContent,
}) {

  const [taggedContent, setTaggedContent] = useState(null)
  const [canShowPreview, setCanShowPreview] = useState(false)
  const [isIssueElementVisible, setIsIssueElementVisible] = useState(false)

  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [debouncedDirection, setDebouncedDirection] = useState(null)

  const checkScrollButton = () => {
    if(isInitialLoad) {
      setIsIssueElementVisible(true)
      return
    }

    const htmlElement = document.getElementsByClassName('ufixit-error-highlight')[0]
    const containerElement = document.getElementsByClassName('ufixit-content-preview-main')[0]
    if (htmlElement && containerElement) {
      const htmlRect = htmlElement.getBoundingClientRect()
      const containerRect = containerElement.getBoundingClientRect()
      const htmlMidpoint = (htmlRect.top + htmlRect.bottom) / 2

      if (htmlMidpoint < containerRect.top) {
        setIsIssueElementVisible(false)
        setDebouncedDirection('up')
      }
      else if (htmlMidpoint > containerRect.bottom) {
        setIsIssueElementVisible(false)
        setDebouncedDirection('down')
      }

      else {
        setIsIssueElementVisible(true)
        setDebouncedDirection(null)
      }
    }
    else {
      setIsIssueElementVisible(true)
      setDebouncedDirection(null)
    }
  }

  const ALT_TEXT_RELATED = [
    formNames.ALT_TEXT,            
    formNames.ANCHOR_TEXT,
    formNames.BLOCKQUOTE,
    formNames.EMBEDDED_CONTENT_TITLE,
    formNames.LABEL,
    formNames.LABEL_UNIQUE
  ]

  const HEADINGS_RELATED = [
    formNames.HEADING_EMPTY,
    formNames.HEADING_STYLE
  ]

  const convertErrorHtmlString = (htmlText) => {
    let tempElement = Html.toElement(htmlText)
    if(tempElement){
      return convertErrorHtmlElement(tempElement)
    }
    return null
  }

  const convertErrorHtmlElement = (htmlElement) => {
    htmlElement.classList.add('ufixit-error-highlight')

    return htmlElement
  }

  const addPreviewHelperElements = (doc, errorElement) => {
    if(!activeIssue || !doc || !errorElement) {
      return doc
    }

    // If the issue edits the alt text, we need to show the auto-updating alt text preview
    if (ALT_TEXT_RELATED.includes(formNameFromRule(activeIssue.scanRuleId))) {
      let altText = Html.getAccessibleName(errorElement)
      
      // If there is alt text to show...
      if (altText && altText.trim() !== '') {
        let existingPreviewTextElement = doc.querySelector('.ufixit-alt-text-preview-text')
        
        // Update the existing alt text preview with the new text...
        if (existingPreviewTextElement) {
          existingPreviewTextElement.innerHTML = altText.trim()
        }
        // Or create it from scratch if it doesn't exist.
        else {
          let altTextPreviewCode =
            '<div class="ufixit-alt-text-preview">' +
              '<div class="ufixit-alt-text-preview-icon" alt="" title="">' +
                '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" class="icon-md"><path d="M360-500q42 0 71-29.5t29-70.5q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 41 29 70.5t71 29.5Zm352 93q-15-6-21.5-20.5T690-456q15-34 22.5-70.5T720-600q0-37-7.5-73T690-743q-6-14 1-27.5t22-19.5q17-6 32.5 1.5T768-764q17 39 24.5 80.5T800-600q0 43-8 84.5T767-434q-7 17-22.5 25t-32.5 2Zm116 116q-14-7-20-21.5t2-27.5q35-59 52.5-124T880-598q0-69-18-134.5T809-858q-8-13-1.5-27.5T828-907q17-8 34.5-.5T889-883q35 66 53 137t18 146q0 75-18.5 147.5T888-314q-9 17-26 24t-34-1Zm-668 51q0-17-11.5-28.5T120-280q-17 0-28.5 11.5T80-240q0 66 47 113t113 47q62 0 101.5-31t60.5-91q17-50 32.5-70t71.5-64q62-50 98-113t36-151q0-119-80.5-199.5T360-880q-119 0-199.5 80.5T80-600q0 17 11.5 28.5T120-560q17 0 28.5-11.5T160-600q0-85 57.5-142.5T360-800q85 0 142.5 57.5T560-600q0 68-27 116t-77 86q-52 38-81 74t-43 78q-14 44-33.5 65T240-160q-33 0-56.5-23.5T160-240Z"></path></svg>' +
              '</div>' +
              '<div class="ufixit-alt-text-preview-text-container">' +
                '<div class="ufixit-alt-text-preview-label">' +
                  t('fix.label.screen_reader') +
                '</div>' +
                '<div class="ufixit-alt-text-preview-text">' +
                  altText.trim() +
                '</div>' +
              '</div>' +
            '</div>'
          
          let elementTag = Html.getTagName(errorElement)
          // If the element is an <area>, find its parent <map> element
          if (elementTag.toLowerCase() === 'area') {
            const mapElement = errorElement.closest('map')
            if (mapElement && mapElement.parentNode) {
              mapElement.insertAdjacentHTML('afterend', altTextPreviewCode)
            }
          }
          // Otherwise, insert the preview after the error element itself.
          else {
            if (errorElement.parentNode) {
              errorElement.insertAdjacentHTML('afterend', altTextPreviewCode)
            }
          }
        }
      }
      // If there is no alt text to show, remove the preview element.
      else {
        doc.querySelector('.ufixit-alt-text-preview')?.remove()
      }
    }

    if (HEADINGS_RELATED.includes(formNameFromRule(activeIssue.scanRuleId))) {
      const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

      if (errorElement && headingTags.includes(errorElement.tagName.toLowerCase())) {
        const headingType = errorElement.tagName.toUpperCase()
        errorElement.classList.add('ufixit-heading-highlight')
        errorElement.setAttribute('ufixit-heading-type', headingType)
      }

      const otherHeadingElements = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      otherHeadingElements.forEach((headingElement) => {
        const headingType = headingElement.tagName.toUpperCase()
        headingElement.classList.add('ufixit-heading-highlight')
        headingElement.setAttribute('ufixit-heading-type', headingType)
      })
    }

    return doc
  }

  const getTaggedContent = (activeIssue, activeContentItem) => {

    if (!activeIssue || !activeContentItem) {
      return null
    }

    let fullPageHtml = activeContentItem.body
    const parser = new DOMParser()
    let doc = parser.parseFromString(fullPageHtml, 'text/html')

    let errorElement = Html.findElementWithIssue(doc, activeIssue?.issueData)
    let editedElement = Html.getIssueHtml(activeIssue?.issueData)
  
    if(!errorElement) {
      setCanShowPreview(false)
      setIsErrorFoundInContent(false)
    }
    else {
      if(editedElement) { 
        errorElement.insertAdjacentHTML('afterend', Html.toString(convertErrorHtmlString(editedElement)))
        let tempElement = errorElement.nextSibling
        errorElement.remove()
        errorElement = tempElement
      } else {
        errorElement.replaceWith(convertErrorHtmlElement(errorElement))
      }
      setCanShowPreview(true)
      setIsErrorFoundInContent(true)
    }
    
    // Find all of the <details> elements in the document (if present).
    const detailsElements = Array.from(doc.body.querySelectorAll('details'))
    detailsElements.forEach((detailsElement) => {
      // Open each element before we do the initial render
      if (!detailsElement.open) {
        detailsElement.open = true
      }
    })

    doc = addPreviewHelperElements(doc, errorElement)
    return doc.body.innerHTML
  }

  useEffect(() => {
    if(!activeIssue || !activeContentItem) {
      setTaggedContent(null)
      setIsErrorFoundInContent(false)
      return
    }
    if(activeIssue.contentType === settings.ISSUE_FILTER.FILE_OBJECT || activeIssue?.issueData?.contentItemId !== activeContentItem?.id) {
      return
    }
    setTaggedContent(getTaggedContent(activeIssue, activeContentItem))
  }, [activeIssue, activeContentItem])

  useEffect(() => {
    const element = document.getElementsByClassName('ufixit-error-highlight')[0]
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'center' })
    }
  }, [taggedContent])

  useEffect(() => {
    if (!activeIssue) {
      setTaggedContent(null)
      setIsErrorFoundInContent(false)
      return
    }

    const doc = document.getElementsByClassName('ufixit-content-preview-main')[0]
    if (!doc) { return }
    
    let targetElement = doc.getElementsByClassName('ufixit-error-highlight')[0]
    if (!targetElement) { return }

    const tempElement = convertErrorHtmlString(Html.getIssueHtml(activeIssue?.issueData))
    if(!tempElement) { return }

    let formName = formNameFromRule(activeIssue.scanRuleId)

    if (formName === formNames.ALT_TEXT) {

      if (targetElement.tagName.toLowerCase() === 'img') {
        const alt = tempElement.getAttribute('alt')
        const role = tempElement.getAttribute('role')

        if (alt !== null) {
          targetElement.setAttribute('alt', alt)
        } else {
          targetElement.removeAttribute('alt')
        }

        if (role !== null) targetElement.setAttribute('role', role)
        else targetElement.removeAttribute('role')
      }
      addPreviewHelperElements(doc, targetElement)
      return
    }

    if (formName === formNames.EMBEDDED_CONTENT_TITLE) {
      const tag = targetElement.tagName.toLowerCase()

      if (['iframe', 'video', 'embed', 'object'].includes(tag)) {
        const title = tempElement.getAttribute('title')
        const aria = tempElement.getAttribute('aria-label')
        const label = tempElement.getAttribute('label')

        if (title !== null) targetElement.setAttribute('title', title)
        if (aria !== null) targetElement.setAttribute('aria-label', aria)
        if (label !== null) targetElement.setAttribute('label', label)
      }
      addPreviewHelperElements(doc, targetElement)
      return
    }
    
    // Replace the target element with the new element
    targetElement.insertAdjacentHTML('afterend', Html.toString(convertErrorHtmlString(tempElement)))
    let tempSwitchElement = targetElement.nextSibling
    targetElement.remove()
    targetElement = tempSwitchElement
    addPreviewHelperElements(doc, targetElement)
    setTaggedContent(doc.innerHTML)
  }, [liveUpdateToggle])

  const scrollToElement = (element) => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }

  return (
    <>
      { activeIssue && (
        <a href={activeIssue.contentUrl} target="_blank" rel="noreferrer" className="ufixit-content-label flex-row justify-content-between mt-0 mb-3">
          <div className="flex-column flex-center allow-word-break">
            <h2 className="fake-h1">{activeIssue.contentTitle}</h2>
          </div>
          <div className="flex-column flex-center">
            <ExternalLinkIcon className="icon-lg link-color" alt="" />
          </div>
        </a>
      )}

      <div className="ufixit-content-preview">
        { !activeIssue ? (
          <div className="flex-column">
            <div className="flex-row justify-content-center text-center mt-3 ms-4 me-4">
              <h2 className="mt-0 mb-0 primary-dark">{t('fix.label.no_selection')}</h2>
            </div>
            <div className="flex-row justify-content-center text-center mt-3 ms-4 me-4">
              <div>{t('fix.msg.select_issue')}</div>
            </div>
          </div>
        ) : (
          <>
            { taggedContent && activeContentItem && !contentItemsBeingScanned.includes(activeContentItem?.id) ? (
              <>
                { canShowPreview ? (
                  <>
                    <div
                      className="ufixit-content-preview-main"
                      onScroll={() => {
                        checkScrollButton()
                      }}
                      dangerouslySetInnerHTML={{__html: taggedContent}} />
                    {!isIssueElementVisible && !isInitialLoad && debouncedDirection && (
                      <div className='scroll-to-error-container'>
                        <button
                          className={`btn-secondary btn-icon-right btn-small scroll-to-error ${debouncedDirection ? 'scroll-to-error-' + debouncedDirection : ''}`}
                          onClick={() => scrollToElement(document.getElementsByClassName('ufixit-error-highlight')[0])}
                          tabIndex="0"
                        >
                          {t('fix.button.scroll_to_issue')}
                          { debouncedDirection === 'up' ?
                            <UpArrowIcon className="icon-sm" />
                          : debouncedDirection === 'down' ?
                            <DownArrowIcon className="icon-sm" />
                          : null
                          }
                        </button>
                      </div>
                      )}
                  </>
                ) : (
                  <div className="ufixit-content-preview-no-error flex-row p-3">
                    <div className="flex-column justify-content-start">
                      <div className="flex-row mb-3">
                        <div className="flex-column justify-content-center flex-grow-0 flex-shrink-0 me-3">
                          <InfoIcon className="icon-lg udoit-suggestion" alt="" />
                        </div>
                        <div className="flex-column justify-content-center flex-grow-1">
                          <h2 className="mt-0 mb-0">{t('fix.label.no_error_preview')}</h2>
                        </div>
                      </div>
                      <div>{t('fix.msg.no_error_preview')}</div>
                      <div className="flex-row justify-content-end mt-3">
                        <button className="btn btn-secondary mt-3" onClick={() => setCanShowPreview(true)}>
                          {t('fix.button.show_no_error_preview')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-column h-100 flex-grow-1 justify-content-center">
                <div className="flex-row justify-content-center mb-4">
                  <div className="flex-column justify-content-center">
                    <ProgressIcon className="icon-lg udoit-suggestion spinner" />
                  </div>
                  <div className="flex-column justify-content-center ms-3">
                    <h2 className="mt-0 mb-0">{t('fix.label.loading_content')}</h2>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}