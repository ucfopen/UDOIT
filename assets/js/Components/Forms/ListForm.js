import React, { useEffect, useRef, useState } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import './SensoryMisuseForm.css'
import { numberedPattern, letteredPattern, bulletPattern } from '../../Services/Lists'

export default function ListForm({
  t,
  settings, 
  activeIssue,
  isContentLoading,
  markAsReviewed,
  setMarkAsReviewed,
  handleIssueSave,
  handleActiveIssue,
  addMessage,
  isDisabled
}) {
  
  const [html, setHtml] = useState(Html.getIssueHtml(activeIssue))
  const [editorHtml, setEditorHtml] = useState(Html.getIssueHtml(activeIssue))
  const [hasValidList, setHasValidList] = useState(false)
  const editorRef = useRef(null)

  // Parse metadata at component level
  let metadata = {}
  try {
    metadata = typeof activeIssue?.metadata === 'string' 
      ? JSON.parse(activeIssue.metadata) 
      : (activeIssue?.metadata || {})
  } catch (e) {
    metadata = {}
  }

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    
    let html = Html.getIssueHtml(activeIssue)
    setHtml(html)
    setEditorHtml(html)

    tinymce.remove()
    tinymce.init({
      selector: '#list-form-textarea',
      license_key: "gpl",
      height: 300,
      menubar: false,
      plugins: "code lists",
      toolbar: "undo redo | bold italic underline | bullist numlist | code",
      branding: false,
      skin: "oxide",
      quickbars_insert_toolbar: false,
      statusbar: true,
      setup: (editor) => {
        editor.on('init', () => {
          editor.setContent(html)
          editorRef.current = editor
          validateContent()
        })
        editor.on('change keyup input', () => {
          validateContent()
        })
      }
    })
  }, [activeIssue])

  const validateContent = () => {
    if (editorRef.current) {
      const currentContent = editorRef.current.getContent()
      const isValid = checkForValidList(currentContent)
      setHasValidList(isValid)
    }
  }

  const handleEditorChange = (html) => {
    setEditorHtml(html)
  }

  const checkForValidList = (html) => {
    if (!html) return false
    
    const tempElement = Html.toElement(html)
    if (!tempElement) return false

    // Check if the element itself is a list
    if (tempElement.tagName === 'OL' || tempElement.tagName === 'UL') {
      const listItems = tempElement.querySelectorAll(':scope > li')
      return listItems.length > 0
    }

    // Check if there's at least one <ul> or <ol> element inside
    const lists = tempElement.querySelectorAll('ul, ol')
    if (lists.length === 0) return false

    // Check that each list has at least one <li> child
    for (let list of lists) {
      const listItems = list.querySelectorAll(':scope > li')
      if (listItems.length === 0) return false
    }

    return true
  }

  const detectListType = (text) => {
    if (text.match(numberedPattern)) return 'ol'
    if (text.match(letteredPattern)) return 'ol'
    if (text.match(bulletPattern)) return 'ul'
    return 'ul'
  }

  const handleAutoFix = () => {
    if (!editorRef.current) return

    const currentContent = editorRef.current.getContent()
    
    // Check if already a valid list - don't auto-fix again
    if (checkForValidList(currentContent)) {
      return
    }
    
    const parser = new DOMParser()
    const doc = parser.parseFromString(currentContent, 'text/html')
    const elements = Array.from(doc.body.children)
    
    if (elements.length === 0) return

    // Detect list type from first element
    const firstText = elements[0].textContent.trim()
    const listType = detectListType(firstText)

    // Build semantic list
    let listHtml = `<${listType}>\n`
    elements.forEach(element => {
      let text = element.textContent.trim()
      if (!text) return
      
      // Strip prefix from text content to know what to remove
      const cleanText = text
        .replace(numberedPattern, '')
        .replace(letteredPattern, '')
        .replace(bulletPattern, '')
        .trim()
      
      if (!cleanText) return
      
      // Clone the element to manipulate it
      const clone = element.cloneNode(true)
      
      // Get the first text node and strip the prefix from it
      const walker = document.createTreeWalker(
        clone,
        NodeFilter.SHOW_TEXT,
        null,
        false
      )
      
      const firstTextNode = walker.nextNode()
      if (firstTextNode) {
        const originalText = firstTextNode.textContent
        const strippedText = originalText
          .replace(numberedPattern, '')
          .replace(letteredPattern, '')
          .replace(bulletPattern, '')
      
        firstTextNode.textContent = strippedText
      }
    
      listHtml += `  <li>${clone.innerHTML}</li>\n`
    })
    listHtml += `</${listType}>`

    // Make the content change undoable
    editorRef.current.undoManager.transact(() => {
      editorRef.current.setContent(listHtml)
    })
    
    validateContent()
  }

  const handleSubmit = () => {
    if (editorRef.current) {
      let issue = activeIssue

      let editorCode = editorRef.current.getContent()
      if(editorCode === null || editorCode === undefined || editorCode === '') {
        addMessage('Problem getting HTML out of the editor...', 'error')
        return
      }

      // Remove the wrapper div if it exists
      editorCode = editorCode.replace(/<div data-udoit-list-group="true">\s*/gi, '')
                             .replace(/\s*<\/div>\s*$/gi, '')
                             .trim()

      let editorElement = Html.toElement(editorCode)
      if (editorElement === null || editorElement === undefined) {
        addMessage('Problem converting the editor HTML to an element...', 'error')
        return
      }

      if (metadata.isListGroup && issue.groupedIssues && issue.groupedIssues.length > 0) {
        // Use the first grouped issue's real identifiers so the server can find it via xpath
        const firstGroupedIssue = issue.groupedIssues[0]

        // Store the remaining elements' HTML for removal (skip first element, it gets replaced)
        const remainingElementsHtml = (issue.groupedElementsHtml || []).slice(1)

        issue.id = firstGroupedIssue.id
        issue.xpath = firstGroupedIssue.xpath
        issue.sourceHtml = firstGroupedIssue.sourceHtml
        issue.contentItemId = firstGroupedIssue.contentItemId
        issue.scanRuleId = firstGroupedIssue.scanRuleId
        issue.newHtml = editorElement.outerHTML

        // Pass remaining grouped issues AND their original element HTML for removal
        const remainingGroupedIssues = issue.groupedIssues.slice(1)
        handleActiveIssue(issue)
        handleIssueSave(issue, remainingGroupedIssues, remainingElementsHtml)
      } else {
        // Single issue - add ignore class
        const specificClassName = `udoit-ignore-${issue.scanRuleId.replaceAll("_", "-")}`
        let newElement = Html.addClass(issue.sourceHtml, specificClassName)
        newElement.innerHTML = editorElement.innerHTML
        issue.newHtml = Html.toString(newElement)

        handleActiveIssue(issue)
        handleIssueSave(issue)
      }
    }
  }

  return (
    <>
      <div className="instructions">
        {t('form.list.label.instructions')}
      </div>

      <div className="mt-3">
        <button 
          className="btn-primary btn-small" 
          onClick={handleAutoFix}
          disabled={isContentLoading}
        >
          {t('form.list.button.auto_fix')}
        </button>
      </div>

      <div className="mt-3">
        <textarea id="list-form-textarea"></textarea>
      </div>

      <FormSaveOrReview
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={!hasValidList}
        handleSubmit={handleSubmit}
        formErrors={[]}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed} />
    </>
  )
}