import React, { useEffect, useState } from 'react'
import * as Html from '../../Services/Html'

export default function QuoteForm(props) {
  // Determine initial HTML content based on issue status
  let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml
  if (props.activeIssue.status === 1) {
    html = props.activeIssue.newHtml
  }

  let element = Html.toElement(html)
  let cite = Html.getAttribute(element, "cite")

  // State variables to track form data
  const [originalHtml, setOriginalHtml] = useState(html)
  const [modifiedHtml, setModifiedHtml] = useState(html)
  const [addCitation, setAddCitation] = useState(!!cite)
  const [citationText, setCitationText] = useState(cite ? cite : "")
  const [selectedTag, setSelectedTag] = useState(element ? Html.getTagName() : "");
  const [deleteQuotes, setRemoveQuotes] = useState(!element && (props.activeIssue.status === 1))
  const [textInputErrors, setTextInputErrors] = useState([])
  const [selectErrors, setSelectErrors] = useState([])
  const [prevIssueID, setPrevIssueID] = useState(null)

  // Effect to reset form when the active issue changes
  useEffect(() => {
    if (prevIssueID !== null && prevIssueID === props.activeIssue.id) return;

    let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml
    if (props.activeIssue.status === 1) {
      html = props.activeIssue.newHtml
    }

    setOriginalHtml(html);
    setModifiedHtml(html);
    setRemoveQuotes(!element && props.activeIssue.status === 1)
    setSelectedTag("")
    setAddCitation(!!cite)
    setCitationText(cite ? cite : "")
    setTextInputErrors([])
    setSelectErrors([])
    setPrevIssueID(props.activeIssue.id)
  }, [props.activeIssue])

  // Effect to update the modified HTML whenever form inputs change
  useEffect(() => {
    handleHtmlUpdate();
  }, [selectedTag, citationText, deleteQuotes, addCitation])

  /**
   * Updates the HTML content based on user selections.
   * - Removes quotes if deleteQuotes is enabled.
   * - Wraps quotes in <q> or <blockquote> based on selection.
   * - Adds citation attribute if applicable.
   */
  const handleHtmlUpdate = () => {
    let updatedElement = Html.toElement(originalHtml)

    if (deleteQuotes) {
      // Remove quotation marks from text content
      let innerHtml = updatedElement.innerHTML
      innerHtml = innerHtml.replace(/"([^"<]+)"/g, '$1')
      updatedElement.innerHTML = innerHtml
    } else if (selectedTag === 'q' || selectedTag === 'block') {
      // Replace quotes with <q> or <blockquote> elements
      const quoteRegex = /"([^"<]+)"/g;
      let innerHtml = updatedElement.innerHTML;
      let match;
      const tag = selectedTag === 'q' ? 'q' : 'blockquote'

      while ((match = quoteRegex.exec(innerHtml)) !== null) {
        const quoteText = match[1]
        const newElement = document.createElement(tag)
        newElement.textContent = quoteText

        if (addCitation && citationText.length > 0) {
          Html.setAttribute(newElement, 'cite', citationText)
        }

        innerHtml = innerHtml.replace(match[0], Html.toString(newElement))
      }

      updatedElement.innerHTML = innerHtml;
    }

    // Convert element back to HTML string and update state
    const newHtmlString = Html.toString(updatedElement)
    setModifiedHtml(newHtmlString)
    let issue = { ...props.activeIssue, newHtml: newHtmlString }
    props.handleActiveIssue(issue)
  }

  /**
   * Handles the submission of the form.
   * - Validates selection and citation input.
   * - Updates the active issue with the new HTML.
   */
  const handleButton = () => {
    let errors = [];

    if (!selectedTag) {
      errors.push("Please select a quotation style.")
    }
    setSelectErrors(errors);

    errors = [];
    if (addCitation && !citationText.trim()) {
      errors.push("Citation text cannot be empty.")
    }
    setTextInputErrors(errors);

    if (errors.length === 0) {
      let issue = { ...props.activeIssue, newHtml: modifiedHtml }
      props.handleIssueSave(issue)
    }
  }

  /**
   * Toggles the "Remove quotes" checkbox.
   * - If unchecked, restores the original HTML.
   * - Disables citation when quotes are removed.
   */
  const handleRemoveQuotesCheckbox = () => {
    const newDeleteQuotes = !deleteQuotes
    setRemoveQuotes(newDeleteQuotes)

    if (!newDeleteQuotes) {
      setSelectedTag("")
      setModifiedHtml(originalHtml)
      let issue = { ...props.activeIssue, newHtml: originalHtml }
      props.handleActiveIssue(issue)
    }

    if (addCitation) {
      setAddCitation(false)
    }
  }

  const pending = props.activeIssue && props.activeIssue.pending === "1"
  const buttonLabel = pending ? "Processing..." : "Submit"

  return (
    <div style={{ padding: "4px" }}>
      {/* Dropdown for selecting quote formatting */}
      <div style={{ margin: "8px 0" }}>
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
        {selectErrors.length > 0 && (
          <div style={{ color: "red" }}>{selectErrors[0]}</div>
        )}
      </div>

      {/* Input for citation text */}
      {addCitation && (
        <div style={{ margin: "8px 0" }}>
          <label htmlFor="citation">Enter Citation</label><br />
          <input
            id="citation"
            type="text"
            placeholder="e.g., a URL"
            value={citationText}
            disabled={deleteQuotes}
            onChange={(e) => setCitationText(e.target.value)}
          />
          {textInputErrors.length > 0 && (
            <div style={{ color: "red" }}>{textInputErrors[0]}</div>
          )}
        </div>
      )}

      {/* Checkboxes for removing quotes and adding citations */}
      <div style={{ margin: "8px 0" }}>
        <label>
          <input
            type="checkbox"
            checked={deleteQuotes}
            onChange={handleRemoveQuotesCheckbox}
          />
          Remove quotes
        </label>
        <label style={{ marginLeft: "16px" }}>
          <input
            type="checkbox"
            checked={addCitation}
            disabled={deleteQuotes}
            onChange={() => setAddCitation(!addCitation)}
          />
          Add a citation
        </label>
      </div>

      {/* Submit button */}
      <div style={{ margin: "8px 0" }}>
        <button
          onClick={handleButton}
          disabled={pending || props.activeIssue.status === 2}
        >
          {pending ? "Loading..." : buttonLabel}
        </button>
      </div>
    </div>
  )
}
