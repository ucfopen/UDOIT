import React, { useEffect, useState } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'

export default function QuoteForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
}) {

  const [originalHtml, setOriginalHtml] = useState('')
  const [addCitation, setAddCitation] = useState(false)
  const [citationText, setCitationText] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [removeQuotes, setRemoveQuotes] = useState(false)
  const [formErrors, setFormErrors] = useState([])

  // Re-init form when activeIssue changes
  useEffect(() => {

    if (!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    const tempElement = Html.toElement(html)
    const newCite = tempElement ? Html.getAttribute(tempElement, "cite") : ""

    setOriginalHtml(html)
    setAddCitation(!!newCite)
    setCitationText(newCite || "")
    setSelectedTag(tempElement ? Html.getTagName(tempElement)?.toLowerCase() : "")
    setRemoveQuotes(!tempElement && activeIssue.status === 1)
    setFormErrors([])
  }, [activeIssue])

  useEffect(() => {
    checkFormErrors()
    handleHtmlUpdate()
  }, [selectedTag, citationText, removeQuotes, addCitation])


  const checkFormErrors = () => {
    const tempFormErrors = []

    if (!selectedTag && !removeQuotes) {
      tempFormErrors.push("Please select a quotation style.")
    }

    if (addCitation && !citationText.trim()) {
      tempFormErrors.push("Citation text cannot be empty.")
    }

    setFormErrors(tempFormErrors)
  }

  const handleHtmlUpdate = () => {
      let issue = activeIssue
      const html = Html.getIssueHtml(activeIssue)
  
      issue.newHtml = processHtml(html)
      handleActiveIssue(issue)
    }

  const processHtml = (html) => {
    const updatedElement = Html.toElement(html)
    if (!updatedElement) return

    let innerHtml = updatedElement.innerHTML

    // Handles Handles blockquote_cite_exists issue
    if (activeIssue.scanRuleId === 'blockquote_cite_exists') {
      if (citationText.length > 0) {
        Html.setAttribute(updatedElement, 'cite', citationText)
      }
    }
    // Handles text_quoted_correctly issue
    else {
      if (removeQuotes) {
        innerHtml = innerHtml.replace(/"([^"<]+)"/g, '$1')
      } else if (selectedTag === 'q' || selectedTag === 'block') {
        const quoteRegex = /"([^"<]+)"/g
        const tag = selectedTag === 'q' ? 'q' : 'blockquote'
        let match
  
        while ((match = quoteRegex.exec(innerHtml)) !== null) {
          const quoteText = match[1]
          const newElement = document.createElement(tag)
          newElement.textContent = quoteText
  
          if (addCitation && citationText.length > 0) {
            Html.setAttribute(newElement, 'cite', citationText)
          }
  
          innerHtml = innerHtml.replace(match[0], Html.toString(newElement))
        }
      }
      updatedElement.innerHTML = innerHtml
    }

    const newHtmlString = Html.toString(updatedElement)
    return newHtmlString
  }

  const handleSubmit = () => {
    if(formErrors.length > 0) {
      return
    }
    handleIssueSave({ ...activeIssue, newHtml: modifiedHtml })
  }

  const handleRemoveQuotesCheckbox = () => {
    const newDeleteQuotes = !removeQuotes
    setRemoveQuotes(newDeleteQuotes)

    if (!newDeleteQuotes) {
      setSelectedTag("")
      setModifiedHtml(originalHtml)
      handleActiveIssue({ ...activeIssue, newHtml: originalHtml })
    }

    if (addCitation) {
      setAddCitation(false)
    }
  }

  return (
    <div style={{ padding: '4px' }}>
      {activeIssue.scanRuleId === 'blockquote_cite_exists' ? (
        <>
          <div style={{ margin: '8px 0' }}>
            <label htmlFor="citation">Enter Citation</label><br />
            <input
              id="citation"
              type="text"
              placeholder="e.g., a URL"
              value={citationText}
              onChange={(e) => setCitationText(e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          <div style={{ margin: '8px 0' }}>
            <label htmlFor="quote-style">Select quotation style</label><br />
            <select
              id="quote-style"
              value={selectedTag}
              disabled={removeQuotes}
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="">-- Choose --</option>
              <option value="q">Regular Quote</option>
              <option value="block">Block Quote</option>
            </select>
          </div>

          {addCitation && (
            <div style={{ margin: '8px 0' }}>
              <label htmlFor="citation">Enter Citation</label><br />
              <input
                id="citation"
                type="text"
                placeholder="e.g., a URL"
                value={citationText}
                disabled={removeQuotes}
                onChange={(e) => setCitationText(e.target.value)}
              />
            </div>
          )}

          <div style={{ margin: '8px 0' }}>
            <label>
              <input
                type="checkbox"
                checked={removeQuotes}
                onChange={handleRemoveQuotesCheckbox}
              />
              Remove quotes
            </label>
            <label style={{ marginLeft: '16px' }}>
              <input
                type="checkbox"
                checked={addCitation}
                disabled={removeQuotes}
                onChange={() => setAddCitation(!addCitation)}
              />
              Add a citation
            </label>
          </div>
        </>
      )}
      <FormSaveOrReview
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={formErrors}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed} />
  </div>
  )
}