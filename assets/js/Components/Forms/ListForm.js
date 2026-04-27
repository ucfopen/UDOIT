import React, { useEffect, useRef, useState } from 'react'
import MagicIcon from '../Icons/MagicIcon'
import * as Html from '../../Services/Html'
import './SensoryMisuseForm.css'
import { numberedPattern, letteredPattern, bulletPattern } from '../../Services/Lists'

export default function ListForm({
  t,
  settings,
  activeIssue,
  activeContentItem,
  isDisabled,
  handleActiveIssue,
  isContentLoading,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors,
  setPreviewData
}) {
  
  const FORM_OPTIONS = {
    EDIT_TEXT: settings.UFIXIT_OPTIONS.ADD_TEXT
  }

  const editorRef = useRef(null)
  const [editorHtml, setEditorHtml] = useState('')

  useEffect(() => {
    if(!activeIssue) {
      return
    }
    
    let tempPreviewData = {}
    try {
      tempPreviewData = typeof activeIssue?.metadata === 'string' 
        ? JSON.parse(activeIssue.metadata) 
        : (activeIssue?.metadata || {})
    } catch (e) {
      tempPreviewData = {}
    }
    setPreviewData(tempPreviewData)

    let html = Html.getIssueHtml(activeIssue)
    setActiveOption(FORM_OPTIONS.EDIT_TEXT)
    setFormErrors([])

    tinymce.remove()
    tinymce.init({
      selector: '#list-form-textarea',
      license_key: "gpl",
      height: 250,
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
        // The 'input' event 
        editor.on('change', () => {
          handleEditorChange(editor.getContent())
        })
        editor.on('SetContent', () => {
          handleEditorChange(editor.getContent())
        })

        // By default, certain commands like undo/redo and toggling things like bold and italic do not trigger the 'input' event,
        // meaning that the updatePreview function isn't called (which can affect saving).
        editor.on('ExecCommand', (e) => {
          const updateCommands = [
            'undo',
            'redo',
            'mceToggleFormat', 
            'InsertUnorderedList',
            'InsertOrderedList'
          ]
          if(e.command && updateCommands.includes(e.command)) {
            handleEditorChange(editor.getContent())
          }
        })
      }
    })
  }, [activeIssue])

  const handleEditorChange = (html) => {
    if (html === null || html === undefined) {
      return
    }
    setEditorHtml(html)
  }

  useEffect(() => {
    rebuildContentItem(editorHtml)
  }, [editorHtml])


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
  }

  /* We want the activeContentItem to ALWAYS reflect the current state of the issue.
     This way, we can have an up-to-date preview AND when the user clicks "Save", we can just
     send the up-to-date activeContentItem without any additional processing.

     What this means in THIS instance is that we need to remove the old "list" and
     replace it with exactly what's in the HTML editor every time the editor content changes.
  */
  const rebuildContentItem = (html) => {
    if(!activeIssue || !activeContentItem) {
      return
    }

    let issue = activeIssue
    let editorCode = html
    if(editorCode === null || editorCode === undefined) {
      console.warn('Problem getting HTML out of the editor...')
      return
    }
    issue.newHtml = editorCode

    // Start with the clean original content item.
    let tempActiveContentItem = JSON.parse(JSON.stringify(activeContentItem))
    let fullPageHtml = tempActiveContentItem?.body
    if(!fullPageHtml){
      console.warn('No HTML content found in page...')
      return
    }

    const parser = new DOMParser()
    let doc = parser.parseFromString(fullPageHtml, 'text/html')

    let editorElement = Html.toElement(editorCode)
    if (editorElement === null || editorElement === undefined) {
      console.warn('Problem converting the editor HTML to an element...')
      return
    }

    /********************************************************************************************************************
     * Usually, the replace-old-element-with-new-html is very straightforward. But here, it's hard, since both
     * the old content and the new content can be multiple elements (like several paragraphs OR a single list).
     * So here, we have to: 
     * 1. Identify the targeted element(s) in the original HTML.
     *    - Set a "bookmark" element to place new stuff just before.
     *    - Flag all of the original elements that need to be removed (in case of multiple).
     * 2. Insert the new HTML from the editor right before the bookmark element.
     *    - If there are multiple elements in the new HTML, we need to insert them one by one and keep track of them
     *      so we can update the issue xpath to point to the first one.
     *    - Only AFTER an element is placed in a document can we get an xpath for it.
     *    - If there are multiple new items, we need to track their xpaths for the HtmlPreview to group and highlight.
     * 3. Remove all of the original elements that have been replaced.
     *******************************************************************************************************************/

    let bookmarkElement = null
    let elementsToRemove = []
    if (issue.isGrouped && issue.groupedIssues && issue.groupedIssues.length > 0) {
      // Use the first grouped issue's real identifiers so the server can find it via xpath
      const firstGroupedIssue = issue.groupedIssues[0]
      issue.id = firstGroupedIssue.id
      bookmarkElement = Html.findElementWithXpath(doc, firstGroupedIssue.xpath)

      issue.groupedIssues.forEach(groupedIssue => {
        let tempElementToRemove = Html.findElementWithXpath(doc, groupedIssue.xpath)
        if (tempElementToRemove && tempElementToRemove.parentNode) {
          elementsToRemove.push(tempElementToRemove)
        }
      })
    }
    else {
      bookmarkElement = Html.findElementWithXpath(doc, issue.xpath)
      elementsToRemove.push(bookmarkElement)
    }

    if(!bookmarkElement || !bookmarkElement.parentNode) {
      console.warn('Problem finding the original element in the page HTML...')
      return
    }

    let tempIsListGroup = false
    let tempListGroupXpaths = []

    // Insert all of the new content from the editor.
    // If the content in the editor is not a single element (like several paragraps NOT in an <ol>),
    // then we need to add each one's xpath to the previewData so the HtmlPreview can group them in a div.
    if (editorElement?.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      if (editorElement.childNodes.length > 1) {
        tempIsListGroup = true
      }
      for (let i = 0; i < editorElement.childNodes.length; i++) {

        // The editorElement does not have an xpath since it's not in the document. We have to insert it first,
        // then find the inserted element in the document, then get the xpath from that.
        const child = editorElement.childNodes[i]
        Html.addClass(child, 'udoit-list-group-temp-item-' + i.toString())
        bookmarkElement.parentNode.insertBefore(child, bookmarkElement)
        let embeddedElement = doc.querySelector('.udoit-list-group-temp-item-' + i.toString())
        if (embeddedElement) {
          Html.removeClass(embeddedElement, 'udoit-list-group-temp-item-' + i.toString())
          tempListGroupXpaths.push(Html.findXpathFromElement(embeddedElement))
        }
      }
    }
    
    else if (editorElement?.nodeType === Node.ELEMENT_NODE) {
      Html.addClass(editorElement, 'udoit-list-group-temp-item-single')
      bookmarkElement.parentNode.insertBefore(editorElement, bookmarkElement)
      let embeddedElement = doc.querySelector('.udoit-list-group-temp-item-single')
      if (embeddedElement) {
        Html.removeClass(embeddedElement, 'udoit-list-group-temp-item-single')
        tempListGroupXpaths.push(Html.findXpathFromElement(embeddedElement))
      }
    }

    // Finally, remove all of the original elements that have been replaced.
    elementsToRemove.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })

    setPreviewData(prev => ({
      ...prev,
      isListGroup: tempIsListGroup,
      listGroupXpaths: tempListGroupXpaths
    }))
    tempActiveContentItem.body = doc.body.innerHTML
    handleActiveIssue(issue, activeOption, tempActiveContentItem)
  }

  return (
    <>
      <div className="instructions">
        {t('form.list.label.instructions')}
      </div>

      <div className="flex-row justify-content-end">
        <button 
          className="btn-small btn-icon-left btn-secondary"
          onClick={handleAutoFix}
          disabled={isContentLoading}
        >
          <MagicIcon className="icon-md" alt="" aria-hidden="true"/>
          {t('form.list.button.auto_fix')}
        </button>
      </div>

      <div className="mt-2">
        <textarea id="list-form-textarea"></textarea>
      </div>
    </>
  )
}