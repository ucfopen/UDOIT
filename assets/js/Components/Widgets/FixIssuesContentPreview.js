import React, { useState, useEffect } from 'react'
import ScrollButton from './ScrollButton'
import HtmlPreview from './HtmlPreview'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import ProgressIcon from '../Icons/ProgressIcon'
import InfoIcon from '../Icons/InfoIcon'
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

  const [canShowPreview, setCanShowPreview] = useState(true)

  const scrollToError = () => {
    const errorElement = document.getElementsByClassName('ufixit-error-highlight')[0]
    if (errorElement) {
      errorElement.focus({ preventScroll: true })
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
    }
  }

  const handleScroll = () => {
    let visibleButton = null
  
    const htmlElement = document.getElementsByClassName('ufixit-error-highlight')[0]
    const containerElement = document.getElementsByClassName('ufixit-content-preview-main')[0]
    if (htmlElement && containerElement) {
      const htmlRect = htmlElement.getBoundingClientRect()
      const containerRect = containerElement.getBoundingClientRect()
      const htmlMidpoint = (htmlRect.top + htmlRect.bottom) / 2

      if (htmlMidpoint < containerRect.top) {
        visibleButton = 'up'
      }
      else if (htmlMidpoint > containerRect.bottom) {
        visibleButton = 'down'
      }
    }

    /*  This is NOT the "React" way to show and hide the button elements, but
        if we update a State and pass it into the ScrollButton component, it
        causes the HtmlPreview to re-render, which causes focus and tab issues.
        So for now, we'll directly manipulate the DOM elements here. */

    const upButton = document.getElementById('scroll-to-error-up')
    const downButton = document.getElementById('scroll-to-error-down')

    if (upButton) {
      if (visibleButton === 'up') {
        upButton.style.display = 'flex'
        upButton.disabled = false
      } else {
        upButton.style.display = 'none'
        upButton.disabled = true
      }
    }
    
    if (downButton) {
      if (visibleButton === 'down') {
        downButton.style.display = 'flex'
        downButton.disabled = false
      } else {
        downButton.style.display = 'none'
        downButton.disabled = true
      }
    }
  }

  useEffect(() => {
    handleScroll()
  }, [activeContentItem, activeIssue, canShowPreview])
    
  return (
    <>
      {/* "Live Preview" Header with link to content */}
      <div className="live-preview-header">
        <h3 id="live-preview-label">Live Preview</h3>
        { activeIssue && (
          <a href={activeIssue.contentUrl} target="_blank" rel="noreferrer">
            {activeIssue.contentTitle}
            <div className="flex-column justify-content-center ps-2" aria-hidden="true">
              <ExternalLinkIcon className="icon-sm link-color" alt="" />
            </div>
          </a>
        )}
      </div>
      

      <section aria-labelledby="live-preview-label" role="region" className="ufixit-content-preview">
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
            { activeContentItem && !contentItemsBeingScanned.includes(activeContentItem?.id) ? (
              <>
                { canShowPreview ? (
                  <>
                    <ScrollButton
                      t={t}
                      
                      scrollToError={scrollToError}
                    />

                    <HtmlPreview
                      key={"html-preview"}
                      t={t}

                      activeContentItem={activeContentItem}
                      activeIssue={activeIssue}
                      liveUpdateToggle={liveUpdateToggle}
                      setCanShowPreview={setCanShowPreview}
                      setIsErrorFoundInContent={setIsErrorFoundInContent}
                      handleScroll={handleScroll}
                    />
                  </>
                ) : (
                  <div className="ufixit-content-preview-no-error flex-row p-3">
                    <div className="flex-column justify-content-start">
                      <div className="flex-row mb-3">
                        <div className="flex-column justify-content-center flex-grow-0 flex-shrink-0 me-3">
                          <InfoIcon className="icon-lg udoit-info" alt="" />
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
                    <ProgressIcon className="icon-lg udoit-progress spinner" />
                  </div>
                  <div className="flex-column justify-content-center ms-3">
                    <h2 className="mt-0 mb-0">{t('fix.label.loading_content')}</h2>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}