import React, { useEffect, useRef, useState } from 'react'
import * as Html from '../../Services/Html'

import { Editor } from '@tinymce/tinymce-react'

// TODO: verify if theres a better way to "selfhost" and load tinymce

export default function SensoryMisuseForm({
  t, 
  settings, 
  activeIssue, 
  handleIssueSave, 
  addMessage, 
  handleActiveIssue, 
  handleManualScan
}) {
  const [html, setHtml] = useState(Html.getIssueHtml(activeIssue))

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

  const editorRef = useRef(null)
  const [editorHtml, setEditorHtml] = useState(html)

  const [sensoryErrors, setSensoryErrors] = useState([])

  useEffect(() => {
    // if the issue changes, pull new html and set tinymce's html
    if (activeIssue) {
      setHtml(Html.getIssueHtml(activeIssue))
      setEditorHtml(Html.getIssueHtml(activeIssue))
    }
  }, [activeIssue])

  useEffect(() => {
    const matchedWords = checkForSensoryWords(editorHtml);
    setSensoryErrors(matchedWords)
  }, [editorHtml])

  const handleEditorChange = (html) => {
    setEditorHtml(html)
  }

  const checkForSensoryWords = (html) => {
    // check for the same sensory words that equal access checks,
    // equal access will only mark whole words, so we do the same here
    const lowerHtml = html.toLowerCase()
    return sensoryWords.filter(word => {
      const pattern = new RegExp(`\\b${word}\\b`, 'i')
      return pattern.test(lowerHtml)
    })
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
        console.log(`An error occurred while trying to evaluate the XPath results: ${e}`)
      }
    }
  };

  // This form does NOT have a "Disabled" state: Users can choose to save the text EVEN WHEN there are still
  // potential sensory misuse words in the text. If they choose to save a change, then we ALSO apply the 
  // `udoit-ignore-[rule_id]` class to the element, so that it is ignored in the future.
  const handleButton = () => {
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

      console.log(issue.newHtml)
      handleActiveIssue(issue)
      
      handleIssueSave(issue)
    }
  }

  return (
    <>
      <div>
        <Editor
          tinymceScriptSrc="/udoit3/build/static/tinymce/tinymce.min.js"
          licenseKey="gpl"
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={html}
          onEditorChange={(evt, editor) => {
            handleEditorChange(editor.getContent())
          }}
          init={{
            height: 250,
            menubar: false,
            toolbar: "undo redo | bold italic underline ",
            // content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            branding: false,
            skin: "oxide",
            quickbars_insert_toolbar: false,
            statusbar: true
          }}
        />
      </div>

      {sensoryErrors.length > 0 ?
        <div className="mt-3">
          <label>{t('form.sensory_misuse.label.potential')}</label>
          <div className="flex-row flex-wrap gap-1 mt-2">
            {sensoryErrors.map((word) => (
              <button
                className="tag"
                tabindex="0"
                key={word}
                onClick={() => goToWord(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
        : <></>}

      <div className='mt-3'>
        <button
          onClick={handleButton}
          className="btn btn-primary"
          tabindex="0"
        >
          {t('form.submit')}
        </button>
      </div>
    </>
  )
}