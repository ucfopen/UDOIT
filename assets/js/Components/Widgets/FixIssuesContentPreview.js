import React, { useState, useEffect, useRef } from 'react'
import DownloadIcon from '../Icons/DownloadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import ProgressIcon from '../Icons/ProgressIcon'
import { formFromIssue, formNameFromRule, formNames } from '../../Services/Ufixit'
import * as Html from '../../Services/Html'
import UpArrowIcon from '../Icons/UpArrowIcon'
import DownArrowIcon from '../Icons/DownArrowIcon'
import './FixIssuesContentPreview.css'
import InfoIcon from '../Icons/InfoIcon'

export default function FixIssuesContentPreview({
  t,
  settings,

  activeContentItem,
  activeIssue,
  contentItemsBeingScanned,
  liveUpdateToggle,
  setIsErrorFoundInContent,
  previewInfo,
  setPreviewInfo,
  copiedContentItem,
  setCopiedContentItem
}) {

  const [taggedContent, setTaggedContent] = useState(null)
  const [canShowPreview, setCanShowPreview] = useState(false)
  const [isIssueElementVisible, setIsIssueElementVisible] = useState(false)

  const [isInitialLoad, setIsInitialLoad] = useState(false)
  const [debouncedDirection, setDebouncedDirection] = useState(null)

   // Default/Reset values for the previewInfoState
  const DEFAULT_PREVIEW_VALUES = {
    aria_complementary_id: ""
  }

  // On First load we reset the values so we don't load in borders
  useEffect(() => {
    setPreviewInfo(DEFAULT_PREVIEW_VALUES)
  }, [])

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
    formNames.ARIA_LABEL_VISIBLE,            
    formNames.ANCHOR_TEXT,
    formNames.BLOCKQUOTE,
    formNames.EMBEDDED_CONTENT_TITLE,
    formNames.LABEL,
    formNames.LABEL_UNIQUE
  ]

  const CLICKABLE_PREVIEW = [
    formNames.ARIA_LABEL_VISIBLE
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

  // Finds an element using a xpath in a htmlString --> inser an ID onto that element --> Make the new tagged and copied content into that new strigified DOM
function addIdToElementInHtml(htmlString, xpath, generatedId) {
    const parser = new DOMParser()
    const document = parser.parseFromString(htmlString, 'text/html')

    const element_from_xpath = Html.findElementWithXpath(document, xpath)
    element_from_xpath.setAttribute('id', generatedId)

    const stringified_content = Html.toString(document.body)

    setTaggedContent(stringified_content) // What renders changes onto our page
    setCopiedContentItem(stringified_content) // We will use this during save

}

function removeIdToElementInHtml(htmlString, xpath, id){
    const parser = new DOMParser()
    const document = parser.parseFromString(htmlString, 'text/html')

    const element_from_xpath = Html.findElementWithXpath(document, xpath)
    element_from_xpath.removeAttribute('id')

    const stringified_content = Html.toString(document.body)

    setTaggedContent(stringified_content) // What renders changes onto our page
    setCopiedContentItem(stringified_content) // We will use this during save
}

// Different forms handle preview values differently, preview value is set in accordance of form 
  const handlePreviewValues = (newId, selectedFlag = false) => { // selectedFlag indicates how we need to deal elements already selected, be default false
    const currentForm = formNameFromRule(activeIssue.scanRuleId)

    if(currentForm == formNames.ARIA_LABEL_VISIBLE){
      // Reset value/Deselection
      if(selectedFlag){
        setPreviewInfo(prevInfo => ({
          ...prevInfo,
          aria_complementary_id: DEFAULT_PREVIEW_VALUES.aria_complementary_id
        }))
        return
      }

      // Seleting value
      setPreviewInfo(prevInfo => ({
          ...prevInfo,
          aria_complementary_id: newId
        }))
        return
    }


  }

  const handleClickablePreview = (e) => {
    //  We are on a Form where we don't just want the user to click around
    if(!CLICKABLE_PREVIEW.includes(formNameFromRule(activeIssue.scanRuleId))){
      console.log("Can't click around when not alowed!")
      return
    }

    // We don't want the user to click on the active issue of a page
    if(e.target.classList.contains('ufixit-error-highlight')){
      console.log("Can't click on a active issue!")
      return
    }

    // In the case the user clicks on the main div, we should reset everything 
    if(e.target.classList.contains("ufixit-content-preview-main")){
      setCopiedContentItem("")
      setTaggedContent(getTaggedContent(activeIssue, activeContentItem))
      setPreviewInfo(DEFAULT_PREVIEW_VALUES)
      return      
    }

    // Selecting an already selected element --> Deselect and reset and accordingly 
    if(e.target.classList.contains("selected")){
      if(e.target.id && e.target.id.includes('-clickable-id')){
        const elemetn_xpath = Html.findXpathFromElement(e.target, 'ufixit-content-preview-main') // Need xpath of element because react is stupid
        removeIdToElementInHtml(taggedContent, elemetn_xpath, e.target.id)
      }
      handlePreviewValues(e.target.id, true)
      return
    }


    let element_id = e.target.id // ID of the element we want to use for the element
    // No ID case
    if(!element_id || element_id == ""){
      const generated_id = e.target.innerHTML.split(' ')[0] + "-clickable-id" // Generating new ID for us to use
      const elemetn_xpath = Html.findXpathFromElement(e.target, 'ufixit-content-preview-main') // Need xpath of element because react is stupid
      // Reset all content item to orginal before proceeding
      if(copiedContentItem){
        setCopiedContentItem("")
        setTaggedContent(getTaggedContent(activeIssue, activeContentItem))
      }
      addIdToElementInHtml(taggedContent, elemetn_xpath, generated_id) // Add generated ID to tagged HTML
      handlePreviewValues(generated_id) // Call Handler

    }
    else{
      // In the case the user clicks an non-id element first AND then clicks on an ID'ed one, we want to ensure that the ID is deleted first
      if(copiedContentItem && formNameFromRule(activeIssue.scanRuleId) == formNames.ARIA_LABEL_VISIBLE){ // Only the case for aria_complementary that we must reset like this
        setCopiedContentItem("")
        setTaggedContent(getTaggedContent(activeIssue, activeContentItem))
      }
      handlePreviewValues(element_id) // Call Handler 
    }
  }

  const addPreviewHelperElements = (doc, errorElement) => {
    if(!activeIssue || !doc || !errorElement) {
      return doc
    }

    // If the issue edits the alt text, we need to show the auto-updating alt text preview
    if (ALT_TEXT_RELATED.includes(formNameFromRule(activeIssue.scanRuleId))) {
      const htmlElement = document.getElementsByClassName('ufixit-error-highlight')[0]
      const allElements = Array.from(document.querySelectorAll('#ufixit-content-preview-main *')) // This gets all the elements from the current document under the big div
      let altText = Html.getAccessibleName(htmlElement, allElements)
      
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

    if(CLICKABLE_PREVIEW.includes(formNameFromRule(activeIssue.scanRuleId))){
      const errorElement = document.getElementsByClassName('ufixit-error-highlight')[0]
      const elements = Array.from(document.querySelectorAll('#ufixit-content-preview-main *'))
      elements.forEach((element) => {
        // Add a 'Click to Select this Element' to every element except for the current error element
        if(element != errorElement){
          element.setAttribute('title', `${t(`misc.clickable_elements`)}`)
        }
        // Selection logic by using class if something is selected
        if(element.id && element.id == previewInfo.aria_complementary_id){
          element.classList.add('selected')
        }
        else if(element.classList.contains('selected')){
          element.classList.remove('selected')
        }

        
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
    if(activeIssue.contentType === settings.FILTER.FILE_OBJECT || activeIssue?.issueData?.contentItemId !== activeContentItem?.id) {
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
              <>
                { taggedContent && activeContentItem && !contentItemsBeingScanned.includes(activeContentItem?.id) ? (
                  <>
                    { canShowPreview ? (
                      <>
                        <div
                          className={CLICKABLE_PREVIEW.includes(formNameFromRule(activeIssue.scanRuleId)) ? `ufixit-content-preview-main ufixit-clickable-container` : `ufixit-content-preview-main`}
                          id='ufixit-content-preview-main'
                          onScroll={() => {
                            checkScrollButton()
                          }}
                          onClick={handleClickablePreview}
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
          </>
        )}
      </div>
    </>
  )
}