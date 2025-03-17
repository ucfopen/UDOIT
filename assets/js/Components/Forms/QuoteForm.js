import React, { useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import * as Html from '../../Services/Html'
import { SimpleSelect } from '@instructure/ui-simple-select'

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
  
    let issue = { ...props.activeIssue, newHtml: newHtmlString };
    props.handleActiveIssue(issue);
  }

  /**
   * Handles the submission of the form.
   * - Validates selection and citation input.
   * - Updates the active issue with the new HTML.
   */
  const handleButton = () => {
    let errors = [];

    if (!selectedTag) {
        errors.push({ text: "Please select a quotation style.", type: "error" });
    }
    setSelectErrors(errors);

    errors = [];
    if (addCitation && !citationText.trim()) {
        errors.push({ text: "Citation text cannot be empty.", type: "error" });
    }
    setTextInputErrors(errors);

    if (errors.length === 0) {
        let issue = { ...props.activeIssue, newHtml: modifiedHtml };
        props.handleIssueSave(issue);
    }
  };

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
  const buttonLabel = pending ? "form.processing" : "form.submit"

  return (
    <View as="div" padding="x-small">
      {/* Dropdown for selecting quote formatting */}
      <View as="div" margin="small 0">
        <SimpleSelect
          renderLabel="Select quotation style"
          value={selectedTag}
          width="100%"
          onChange={(event, { value }) => setSelectedTag(value)}
          interaction={deleteQuotes ? "disabled" : "enabled"}
          messages={selectErrors}
        >
          <SimpleSelect.Option key="opt-empty" id="opt-empty" value="">
            -- Choose --
          </SimpleSelect.Option>
          <SimpleSelect.Option key="opt-1" id="opt-1" value="q">
            Regular Quote
          </SimpleSelect.Option>
          <SimpleSelect.Option key="opt-2" id="opt-2" value="block">
            Block Quote
          </SimpleSelect.Option>
        </SimpleSelect>
      </View>

      {/* Input for citation text */}
      {addCitation && (
        <View as="div" margin="small 0">
          <TextInput
            renderLabel="Enter Citation"
            placeholder="e.g., a URL"
            value={citationText}
            onChange={(e) => setCitationText(e.target.value)}
            interaction={deleteQuotes ? "disabled" : "enabled"}
            messages={textInputErrors}
          />
        </View>
      )}

      {/* Checkboxes for removing quotes and adding citations */}
      <View>
        <View as='span' display='inline-block'>
          <Checkbox
            label='Remove quotes'
            checked={deleteQuotes}
            onChange={handleRemoveQuotesCheckbox}
          />
        </View>
        <View as='span' display='inline-block' margin="0 small">
          <Checkbox
            label='Add a citation'
            checked={addCitation}
            onChange={() => setAddCitation(!addCitation)}
            disabled={deleteQuotes}
          />
        </View>
      </View>

      {/* Submit button */}
      <View as='div' margin='small 0'>
        <Button
          color='primary'
          onClick={handleButton}
          interaction={(!pending && props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}
        >
          {pending && <Spinner size="x-small" renderTitle={props.t(buttonLabel)} />}
          {props.t(buttonLabel)}
        </Button>
      </View>
    </View>
  );
}
