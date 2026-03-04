import React, { useEffect, useRef, useState } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
import './SensoryMisuseForm.css'

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
        })
        editor.on('input', () => {
          handleEditorChange(editor.getContent())
        })
      }
    })
  }, [activeIssue])

  useEffect(() => {
    const isValid = checkForValidList(editorHtml)
    setHasValidList(isValid)
  }, [editorHtml])

  const handleEditorChange = (html) => {
    setEditorHtml(html)
  }

  const checkForValidList = (html) => {
    if (!html) return false
    
    const tempElement = Html.toElement(html)
    if (!tempElement) return false
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

      if (metadata.isListGroup) {
        // Store the new HTML for the entire group
        issue.newHtml = editorElement.outerHTML
      } else {
        // Single issue - add ignore class
        const specificClassName = `udoit-ignore-${issue.scanRuleId.replaceAll("_", "-")}`
        let newElement = Html.addClass(issue.sourceHtml, specificClassName)
        newElement.innerHTML = editorElement.innerHTML
        issue.newHtml = Html.toString(newElement)
      }

      handleActiveIssue(issue)
      handleIssueSave(issue)
    }
  }

  return (
    <>
      <div className="instructions">
        {metadata?.isListGroup && activeIssue?.groupCount > 0 
          ? t('form.list.label.instructions_grouped', { count: activeIssue.groupCount })
          : t('form.list.label.instructions')
        }
      </div>
      
      {hasValidList ? (
        <div className="mt-3">
          <div className="ufixit-widget-label text-success">
            ✓ {t('form.list.label.valid')}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="ufixit-widget-label text-danger">
            ✗ {t('form.list.label.invalid')}
          </div>
        </div>
      )}

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