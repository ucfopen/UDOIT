import React, { useState, useEffect } from 'react';
import ExternalLinkIcon from './Icons/ExternalLinkIcon';

import './FixIssuesContentPreview.css';

export default function FixIssuesContentPreview({
  t,
  activeIssue,
  activeContentItem
}) {

  const [taggedContent, setTaggedContent] = useState(null)

  const getTaggedContent = (activeIssue, activeContentItem) => {
    if (!activeIssue || !activeContentItem) {
      return null
    }

    let rawHtml = activeContentItem.body
    let errorHtml = activeIssue?.issue?.sourceHtml || undefined

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
        element.classList.add('ufixit-error-highlight')
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

  return (
    <>
      { taggedContent && activeContentItem ? (
        <>
          <a href={activeContentItem.url} target="_blank" className="ufixit-content-label flex-row justify-content-between mt-3">
            <div className="flex-column flex-center">
              <h2 className="fake-h1">{activeContentItem.title}</h2>
            </div>
            <div className="flex-column flex-center">
              <ExternalLinkIcon className="icon-lg link-color" />
            </div>
          </a>
          <div className="ufixit-content-preview" dangerouslySetInnerHTML={{__html: taggedContent}} />
          <div className="ufixit-content-progress">
            Progress bar goes here.
          </div>
        </>
      ) : activeIssue ? (
        <>
          <a href={activeIssue.contentUrl} target="_blank" className="ufixit-content-label flex-row justify-content-between mt-3">
            <div className="flex-column flex-center">
              <h2 className="fake-h1">{activeIssue.contentTitle}</h2>
            </div>
            <div className="flex-column flex-center">
              <ExternalLinkIcon className="icon-lg link-color" />
            </div>
          </a>
          <div className="ufixit-content-preview">
            <h2>Loading Content...</h2>
          </div>
          <div className="ufixit-content-progress">
            Progress bar goes here.
          </div>
        </>
      ) : (
        <>
          <h2>No Issue Selected</h2>
          <div className="ufixit-content-preview" />
          <div className="ufixit-content-progress">
            Progress bar goes here.
          </div>
        </>
      )}
    </>
  )
}