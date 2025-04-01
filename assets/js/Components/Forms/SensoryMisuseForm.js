import React, { useEffect, useRef, useState } from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import { Pill } from '@instructure/ui-pill'
import * as Html from '../../Services/Html'
import { Tag } from '@instructure/ui-tag'

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
  const sensoryWords = ["top-left", "top-right", "bottom-right", "bottom-left",
    "top-to-bottom", "left-to-right", "bottom-to-top", "right-to-left",
    "right", "left", "above", "below", "top", "bottom",
    "upper", "lower", "corner", "beside", "round", "square", "shape", "rectangle", "triangle",
    "size", "large", "small", "medium", "big", "huge", "tiny", "extra",
    "larger", "smaller", "bigger", "little", "largest", "smallest", "biggest"]

  const editorRef = useRef(null)
  const [editorHtml, setEditorHtml] = useState(html)

  const [sensoryErrors, setSensoryErrors] = useState([])

  useEffect(() => {
    const matchedWords = checkForSensoryWords(editorHtml);
    setSensoryErrors(matchedWords)

    // handleHtmlUpdate()
  }, [editorHtml])

  const handleEditorChange = (html) => {
    setEditorHtml(html)
  }

  // TODO: this is supposed to update the preview, but it causes the editor to refresh for some reason?
  // const handleHtmlUpdate = () => {
  //   let issue = activeIssue
  //   issue.newHtml = editorHtml
  //   handleActiveIssue(issue)
  // }

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

  const handleButton = () => {
    if (sensoryErrors.length > 0) {
      console.log("Can't save, more than 0 sensory errors found.")
    }
    else {
      if (editorRef.current) {
        let issue = activeIssue
        issue.newHtml = editorRef.current.getContent()
        handleActiveIssue(issue)

        handleIssueSave(activeIssue)
      }
    }
  }

  const pending = activeIssue && activeIssue.pending == "1"
  const buttonLabel = pending ? "form.processing" : "form.submit"

  return (
    <div className="p-3">
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
          <span style={{ fontWeight: "bold" }}>Potential sensory words:</span>
          <span style={{ flexWrap: "wrap", display: "flex", columnGap: "0.15rem", rowGap: "0.15rem", marginTop: "0.5rem" }}>
            {sensoryErrors.map((word) => (
              <button
                className="tag mt-0 mr-2 mb-1 ml-0"
                onClick={() => goToWord(word)}
              >
                <span style={{ cursor: "pointer" }}>{word}</span>
              </button>
            ))}
          </span>
        </div>
        : <></>}

      <div className='m-0'>
        <button
          onClick={handleButton}
          disabled={pending || sensoryErrors.length > 0 || activeIssue.status === 2}
          className={pending || sensoryErrors.length > 0 || activeIssue.status === 2 ? 'btn' : 'btn btn-primary'}
        >
          {/* {('1' == pending) && <Spinner size="x-small" renderTitle={t(buttonLabel)} />} */}
          {t(buttonLabel)}
        </button>
      </div>
    </div>
  )
}