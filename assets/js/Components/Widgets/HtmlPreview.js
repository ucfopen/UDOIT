import React, { useState, useEffect, use } from 'react'
import { formNameFromRule, formNames } from '../../Services/Ufixit'
import * as Html from '../../Services/Html'
import './FixIssuesContentPreview.css'

export default function HtmlPreview({
  t,

  activeContentItem,
  activeIssue,
  liveUpdateToggle,
  setCanShowPreview,
  setIsErrorFoundInContent,
  handleScroll
}) {

  const [taggedContent, setTaggedContent] = useState(false)

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

  const getTaggedContent = () => {

    if (!activeIssue || !activeContentItem) {
      setIsErrorFoundInContent(false)
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
  
  const checkTaggedContentUpdate = () => {
    let tempTaggedContent = getTaggedContent()
    if(tempTaggedContent !== taggedContent) {
      setTaggedContent(tempTaggedContent)
    }
  }

  useEffect(() => {
    checkTaggedContentUpdate()
  }, [activeIssue, activeContentItem, liveUpdateToggle])

  useEffect(() => {
    checkTaggedContentUpdate()
  }, [])

  useEffect(() => {
    const element = document.getElementsByClassName('ufixit-error-highlight')[0]
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'center' })
    }
  }, [taggedContent])
    
  return (
    <div
      key={"html-content-preview-div"}
      className="ufixit-content-preview-main"
      onScroll={() => handleScroll()}
      dangerouslySetInnerHTML={{ __html: taggedContent }}
    />
  )
}