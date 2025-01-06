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

  let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml

  if (props.activeIssue.status === '1') {
    html = props.activeIssue.newHtml
  }

  let element = Html.toElement(html)

  const [textInputValue, setTextInputValue] = useState(element ? Html.getAttribute(element, "aria-label") : "")
  const [deleteQuotes, setRemoveQuotes] = useState(!element && (props.activeIssue.status === "1"))
  const [textInputErrors, setTextInputErrors] = useState([])

  let formErrors = []

  useEffect(() => {
    let html = props.activeIssue.newHtml ? props.activeIssue.newHtml : props.activeIssue.sourceHtml
    if (props.activeIssue.status === 1) {
      html = props.activeIssue.newHtml
    }

    let element = Html.toElement(html)
    setTextInputValue(element ? Html.getAttribute(element, "aria-label") : "")
    // setRemoveQuotes(!element && props.activeIssue.status === 1)

    formErrors = []

  }, [props.activeIssue])

  useEffect(() => {
    handleHtmlUpdate()
  }, [textInputValue])

  const handleHtmlUpdate = () => {
    let updatedElement = Html.toElement(html)

    updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)

    // if (deleteQuotes) {
    //   updatedElement = Html.removeAttribute(updatedElement, "aria-label")
    // }
    // else {
    //   updatedElement = Html.setAttribute(updatedElement, "aria-label", textInputValue)
    // }

    let issue = props.activeIssue
    issue.newHtml = Html.toString(updatedElement)
    props.handleActiveIssue(issue)

  }

  const handleButton = () => {
    formErrors = []

    // if (!deleteQuotes) {
    //   checkTextNotEmpty()
    // }

    checkTextNotEmpty()
    checkLabelIsUnique()

    if (formErrors.length > 0) {
      setTextInputErrors(formErrors)
    }
    else {
      props.handleIssueSave(props.activeIssue)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
    // handleHtmlUpdate()
  }

  const handleCheckbox = () => {
    setRemoveQuotes(!deleteQuotes)
    // handleHtmlUpdate()
  }

  const checkTextNotEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      formErrors.push({ text: "Empty label text.", type: "error" })
    }
  }

  const checkLabelIsUnique = () => {
    // in the case of aria_*_label_unique, messageArgs (from metadata) should have the offending label (at the first index)
    // i guess we could get it from the aria-label itself as well...
    const issue = props.activeIssue
    const metadata = issue.metadata ? JSON.parse(issue.metadata) : {}
    const labelFromMessageArgs = metadata.messageArgs ? metadata.messageArgs[0] : null
    const text = textInputValue.trim().toLowerCase()

    if (labelFromMessageArgs) {
      if (text == labelFromMessageArgs) {
        formErrors.push({ text: "Cannot reuse label text.", type: "error" })
      }
    }

  }

  const pending = props.activeIssue && props.activeIssue.pending == "1"
  const buttonLabel = pending ? "form.processing" : "form.submit"

  // TODO: use props.t (from en/es.json) to display text for renderLabel, etc
  return (
    <View as="div" padding="x-small">
      <View as="div" margin="small 0">
        <SimpleSelect
          renderLabel="Select quotation style"
          width="100%"
        >
          <SimpleSelect.Option
            key="opt-empty"
            id="opt-empty"
            value=""
          >
            -- Choose --
          </SimpleSelect.Option>

          <SimpleSelect.Group renderLabel="Regular quotation">
            <SimpleSelect.Option
              key="1"
              id="opt-1"
            >
              
            </SimpleSelect.Option>
          </SimpleSelect.Group>
        </SimpleSelect>
      </View>
      <View>
        <View as='span' display='inline-block'>
          <Checkbox
            label='Remove quotes'
            checked={deleteQuotes}
            onChange={handleCheckbox}
          />
        </View>
      </View>
      <View as='div' margin='small 0'>
        <Button
          color='primary'
          onClick={handleButton}
          interaction={(!pending && props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}
        >
          {('1' == pending) && <Spinner size="x-small" renderTitle={props.t(buttonLabel)} />}
          {props.t(buttonLabel)}
        </Button>
      </View>
    </View>
  );
}