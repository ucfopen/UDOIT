import React, { useEffect, useRef, useState } from 'react'
import FormSaveOrReview from './FormSaveOrReview'
import * as Html from '../../Services/Html'
// The SensoryMisuseForm.css file is a copy of the tinyMCE oxide skin file, which does not consistently load at runtime, so we include it here
// Failure to do so often results in the TinyMCE editor not display, especially the first time the componenet is rendered.
import './SensoryMisuseForm.css'

export default function SensoryMisuseForm({
  t, 
  settings, 
  activeIssue, 
  handleIssueSave, 
  addMessage,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed
}) {
  const [html, setHtml] = useState(Html.getIssueHtml(activeIssue))
  const [editorHtml, setEditorHtml] = useState(Html.getIssueHtml(activeIssue))

  // equal access checks for these words - we can check for them while in tinymce
  // https://github.com/IBMa/equal-access/blob/83eaa932747d1a1156080c60849ff63029d5e293/accessibility-checker-engine/src/v4/rules/text_sensory_misuse.ts
  const sensoryWords = [
    "above", "below", "beside",
    "big", "bigger", "biggest",
    "bottom", "bottom-left", "bottom-right", "bottom-to-top",
    "corner", "extra", "huge",
    "large", "larger", "largest",
    "left", "left-to-right",
    "little", "lower", "medium",
    "right", "right-to-left",
    "rectangle", "round",
    "shape", "size",
    "small", "smaller", "smallest",
    "square", "tiny",
    "top", "top-left", "top-right", "top-to-bottom",
    "triangle",
    "upper",
  ]

  const sensoryWordRegexes = sensoryWords.map(word => ({
    word,
    regex: new RegExp(`\\b${word}\\b`, 'i')
  }))

  const excludedTags = ['script', 'style', 'noscript']
  const includedAttributes = ['alt', 'title', 'aria-label']

  const editorRef = useRef(null)
  
  const [sensoryErrors, setSensoryErrors] = useState([])

  useEffect(() => {
    // if the issue changes, pull new html and set tinymce's html
    if(!activeIssue) {
      return
    }
    
    let html = Html.getIssueHtml(activeIssue)
    setHtml(html)
    setEditorHtml(html)

    tinymce.remove()
    tinymce.init({
      selector: '#sensory-misuse-textarea',
      license_key: "gpl",
      height: 250,
      menubar: false,
      plugins: "code",
      toolbar: "undo redo | bold italic underline | code ",
      // content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
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
    const matchedWords = checkForSensoryWords(editorHtml);
    setSensoryErrors(matchedWords)
  }, [editorHtml])

  const handleEditorChange = (html) => {
    setEditorHtml(html)
  }

  const checkForSensoryWords = (html) => {

    const tempFoundWords = new Set()    

    const checkText = (text) => {
      sensoryWordRegexes.forEach(({ word, regex }) => {
        if (regex.test(text)) {
          tempFoundWords.add(word.toLowerCase())
        }
      })
    }

    const traverseNode = (node) => {
      if (node?.nodeType === Node.TEXT_NODE) {
        // Check if the text node contains any sensory words
        checkText(node.textContent);
      }

      if (node?.nodeType === Node.ELEMENT_NODE) {
        // If the element is excluded, skip it
        if (excludedTags.includes(node.tagName.toLowerCase())) {
          return
        }

        // Check attributes for sensory words
        includedAttributes.forEach(attr => {
          if (node?.hasAttribute(attr)) {
            checkText(node.getAttribute(attr));
          }
        })

        // Recursively traverse child nodes
        node?.childNodes?.forEach(child => traverseNode(child));
      }
    }

    let tempDoc = Html.toElement(html)
    traverseNode(tempDoc)
    
    return Array.from(tempFoundWords).sort((a, b) => a < b ? -1 : 1);
  }

  const goToWord = (word) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();

      // we first use xpath to find any text node that contains the sensory word, case insensitively
      // however, this also includes (in the example of "top") words like "laptop", "topic", etc.
      const body = editor.getBody()
      const xpath = `//text()[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${word.toLowerCase()}')]`
      const xpathResults = editor.getDoc().evaluate(
        xpath,
        body,
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null
      )

      try {
        let result = xpathResults.iterateNext()
        while (result) {
          let text = result.textContent
          // we use regex to further filter the xpath result so we're only matching whole words
          // so "laptop" no longer matches, but "top", "top.", "top;" ... etc. matches
          const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
          let match = wordRegex.exec(text)

          if (match) {
            // create selection range
            const range = editor.getDoc().createRange()
            range.setStart(result, match.index)
            range.setEnd(result, match.index + match[0].length)

            // set selection in tinymce then scroll to the selection
            editor.selection.setRng(range)
            editor.selection.scrollIntoView()
            break
          }
          // otherwise, if the regex fails, continue iterating through xpath results
          result = xpathResults.iterateNext()
        }
      }
      catch (e) {
        console.warn(`An error occurred while trying to evaluate the XPath results: ${e}`)
      }
    }
  };

  // This form does NOT have a "Disabled" state: Users can choose to save the text EVEN WHEN there are still
  // potential sensory misuse words in the text. If they choose to save a change, then we ALSO apply the 
  // `udoit-ignore-[rule_id]` class to the element, so that it is ignored in the future.
  const handleSubmit = () => {
    if (editorRef.current) {
      let issue = activeIssue

      let editorCode = editorRef.current.getContent()
      if( editorCode === null || editorCode === undefined || editorCode === '') {
        addMessage('Problem getting HTML out of the editor...', 'error')
        return
      }
      let editorElement = Html.toElement(editorCode)
      if (editorElement === null || editorElement === undefined) {
        addMessage('Problem converting the editor HTML to an element...', 'error')
        return
      }
      let editorInnerHtml = editorElement.innerHTML

      const specificClassName = `udoit-ignore-${issue.scanRuleId.replaceAll("_", "-")}`

      let newElement = Html.addClass(issue.sourceHtml, specificClassName)
      newElement.innerHTML = editorInnerHtml
      issue.newHtml = Html.toString(newElement)

      handleActiveIssue(issue)

      handleIssueSave(issue)
    }
  }

  return (
    <>
      <div className="instructions">{t('form.sensory_misuse.label.instructions')}</div>
      { sensoryErrors.length > 0 ? (
        <div className="mt-3">
          <div className="flex-row flex-wrap gap-1 mt-2">
            <div className="ufixit-widget-label flex-column align-self-center">{t('form.sensory_misuse.label.highlight')}</div>
            {sensoryErrors.map((word) => (
              <button
                className="tag"
                tabIndex="0"
                key={word}
                onClick={() => goToWord(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <div className="ufixit-widget-label">{t('form.sensory_misuse.label.none')}</div>
        </div>
      )}
      <div className="mt-3">
        <textarea id="sensory-misuse-textarea"></textarea>
      </div>

      <FormSaveOrReview
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled}
        handleSubmit={handleSubmit}
        formErrors={[]}
        markAsReviewed={markAsReviewed}
        setMarkAsReviewed={setMarkAsReviewed} />
    </>
  )
}