import React, { useEffect, useRef, useState } from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import * as Html from '../../Services/Html'

import { Editor } from '@tinymce/tinymce-react'

// TODO: verify if theres a better way to "selfhost" and load tinymce

export default function SensoryMisuseForm(props) {
  let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml

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
    console.log(editorHtml)
    const matchedWords = checkForSensoryWords(editorHtml);
    setSensoryErrors(matchedWords)

    // handleHtmlUpdate()
  }, [editorHtml])

  const handleEditorChange = (html) => {
    setEditorHtml(html)
  }

  // TODO: this is supposed to update the preview, but it causes the editor to refresh for some reason?
  // const handleHtmlUpdate = () => {
  //   let issue = props.activeIssue
  //   issue.newHtml = editorHtml
  //   props.handleActiveIssue(issue)
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

  const handleButton = () => {
    if (sensoryErrors.length > 0) {
      console.log("more than 0 sensory errors found")
    }
    else {
      if (editorRef.current) {
        let issue = props.activeIssue
        issue.newHtml = editorRef.current.getContent()
        props.handleActiveIssue(issue)

        props.handleIssueSave(props.activeIssue)
      }
    }
  }

  const pending = props.activeIssue && props.activeIssue.pending == "1"
  const buttonLabel = pending ? "form.processing" : "form.submit"

  return (
    <View as="div" padding="x-small">
      <View>
        <Editor
          tinymceScriptSrc="/udoit3/build/static/tinymce/tinymce.min.js"
          licenseKey="gpl"
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={html}
          onChange={(evt, editor) => {
            handleEditorChange(editor.getContent())
          }}
          onKeyUp={(evt, editor) => {
            handleEditorChange(editor.getContent())
          }}
          init={{
            height: 250,
            menubar: false,
            toolbar: "undo redo | bold italic underline",
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
            branding: false,
            skin: "oxide",
          }}
        />
      </View>

      {sensoryErrors.length > 0 ? 
        <View as="div" margin="small 0">
          <p style={{color: "red"}}>Potential sensory words: {sensoryErrors.toString()}</p>
        </View>
      : <></>}

      <View as="div" margin="small 0">
        <Button 
          color="primary" 
          onClick={handleButton}
          interaction={(!pending && props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}  
        >
          {('1' == pending) && <Spinner size="x-small" renderTitle={props.t(buttonLabel)} />}
          {props.t(buttonLabel)}
        </Button>
      </View>
    </View>
  )
}