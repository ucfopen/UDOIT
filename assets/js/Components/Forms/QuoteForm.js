import React, { useEffect, useState } from 'react'
import * as Html from '../../Services/Html'

export default function QuoteForm(props) {

  let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml

  if (props.activeIssue.status === '1') {
    html = props.activeIssue.newHtml
  }

  let issueType = props.activeIssue.scanRuleId
  let activeIssue = props.activeIssue

  let initialElement = Html.toElement(html)
  let cite = initialElement ? Html.getAttribute(initialElement, "cite") : ""

  // State setup
  const [originalHtml, setOriginalHtml] = useState(html)
  const [modifiedHtml, setModifiedHtml] = useState(html)
  const [addCitation, setAddCitation] = useState(!!cite)
  const [citationText, setCitationText] = useState(cite || "")
  const [selectedTag, setSelectedTag] = useState(initialElement ? Html.getTagName(initialElement)?.toLowerCase() : "")
  const [deleteQuotes, setRemoveQuotes] = useState(!initialElement && activeIssue.status === 1)
  const [textInputErrors, setTextInputErrors] = useState([])
  const [selectErrors, setSelectErrors] = useState([])
  const [prevIssueID, setPrevIssueID] = useState(null)

  // Re-init form when activeIssue changes
  useEffect(() => {
    issueType = props.activeIssue.scanRuleId
    activeIssue = props.activeIssue
    if (prevIssueID !== null && prevIssueID === activeIssue.id) return;

    let html = activeIssue.newHtml || activeIssue.sourceHtml || ''
    if (activeIssue.status === 1) {
      html = activeIssue.newHtml || ''
    }

    const newElement = Html.toElement(html)
    const newCite = newElement ? Html.getAttribute(newElement, "cite") : ""

    setOriginalHtml(html)
    setModifiedHtml(html)
    setRemoveQuotes(!newElement && activeIssue.status === 1)
    setSelectedTag(newElement ? Html.getTagName(newElement)?.toLowerCase() : "")
    setAddCitation(!!newCite)
    setCitationText(newCite || "")
    setTextInputErrors([])
    setSelectErrors([])
    setPrevIssueID(activeIssue.id)
  }, [activeIssue])

  useEffect(() => {
    console.log()
    handleHtmlUpdate()
  }, [selectedTag, citationText, deleteQuotes, addCitation])

  const handleHtmlUpdate = () => {
    const updatedElement = Html.toElement(originalHtml)
    if (!updatedElement) return

    let innerHtml = updatedElement.innerHTML

    // Handles Handles blockquote_cite_exists issue
    if (issueType === 'blockquote_cite_exists') {
      if (citationText.length > 0) {
        Html.setAttribute(updatedElement, 'cite', citationText)
      }
    }
    // Handles text_quoted_correctly issue
    else {
      if (deleteQuotes) {
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

    setModifiedHtml(newHtmlString)
    props.handleActiveIssue({ ...activeIssue, newHtml: newHtmlString })
  }

  const handleButton = () => {
    const newSelectErrors = []
    const newTextErrors = []

    if (!selectedTag && !deleteQuotes) {
      newSelectErrors.push("Please select a quotation style.")
    }

    if (addCitation && !citationText.trim()) {
      newTextErrors.push("Citation text cannot be empty.")
    }

    setSelectErrors(newSelectErrors)
    setTextInputErrors(newTextErrors)

    if (newSelectErrors.length === 0 && newTextErrors.length === 0) {
      props.handleIssueSave({ ...activeIssue, newHtml: modifiedHtml })
    }
  }

  const handleRemoveQuotesCheckbox = () => {
    const newDeleteQuotes = !deleteQuotes
    setRemoveQuotes(newDeleteQuotes)

    if (!newDeleteQuotes) {
      setSelectedTag("")
      setModifiedHtml(originalHtml)
      props.handleActiveIssue({ ...activeIssue, newHtml: originalHtml })
    }

    if (addCitation) {
      setAddCitation(false)
    }
  }

  const pending = activeIssue?.pending === "1"
  const buttonLabel = pending ? "Processing..." : "Submit"

  return (
    <div style={{ padding: '4px' }}>
    {issueType === 'blockquote_cite_exists' ? (
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
          {textInputErrors.length > 0 && <div>{textInputErrors[0]}</div>}
        </div>
      </>
    ) : (
      <>
        <div style={{ margin: '8px 0' }}>
          <label htmlFor="quote-style">Select quotation style</label><br />
          <select
            id="quote-style"
            value={selectedTag}
            disabled={deleteQuotes}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">-- Choose --</option>
            <option value="q">Regular Quote</option>
            <option value="block">Block Quote</option>
          </select>
          {selectErrors.length > 0 && <div>{selectErrors[0]}</div>}
        </div>

        {addCitation && (
          <div style={{ margin: '8px 0' }}>
            <label htmlFor="citation">Enter Citation</label><br />
            <input
              id="citation"
              type="text"
              placeholder="e.g., a URL"
              value={citationText}
              disabled={deleteQuotes}
              onChange={(e) => setCitationText(e.target.value)}
            />
            {textInputErrors.length > 0 && <div>{textInputErrors[0]}</div>}
          </div>
        )}

        <div style={{ margin: '8px 0' }}>
          <label>
            <input
              type="checkbox"
              checked={deleteQuotes}
              onChange={handleRemoveQuotesCheckbox}
            />
            Remove quotes
          </label>
          <label style={{ marginLeft: '16px' }}>
            <input
              type="checkbox"
              checked={addCitation}
              disabled={deleteQuotes}
              onChange={() => setAddCitation(!addCitation)}
            />
            Add a citation
          </label>
        </div>
      </>
    )}

    <div style={{ margin: '8px 0' }}>
      <button
        onClick={handleButton}
        disabled={pending || activeIssue.status === 2}
      >
        {buttonLabel}
      </button>
    </div>
  </div>
  )
}
