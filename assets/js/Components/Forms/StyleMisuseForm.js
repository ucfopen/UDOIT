import React, { act, useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function StyleMisuseForm(props) {
  const [useBold, setUseBold] = useState(isBold())
  const [useItalics, setUseItalics] = useState(isItalicized())
  const [removeStyling, setRemoveStyling] = useState(false)
  const [checkBoxErrors, setCheckBoxErrors] = useState([])
  const [styleAttribute, setStyleAttribute] = useState(Html.getAttribute(Html.getIssueHtml(props.activeIssue), "style"))
  
  console.log(styleAttribute)

  let formErrors = []

  useEffect(() => {
    updatePreview()
  }, [])

  useEffect(() => {
    setUseBold(isBold())
    setUseItalics(isItalicized())
    setCheckBoxErrors([])

    formErrors = []
  }, [props.activeIssue])

  useEffect(() => {
    updatePreview()
  }, [useBold, useItalics, removeStyling])

  function handleBoldToggle() {
    setUseBold(!useBold)
    updatePreview()
  }

  function handleItalicsToggle() {
    setUseItalics(!useItalics)
    updatePreview()
  }

  function handleStyleToggle() {
    setRemoveStyling(!removeStyling)
    console.log("style tag:")
    console.log(styleAttribute)
    updatePreview()
  }

  function handleSubmit() {
    let issue = props.activeIssue

    if (cssEmphasisIsValid(issue)) {
      let issue = props.activeIssue
      issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
      props.handleIssueSave(issue)
    }
    else {
      // push errors
      formErrors = []
      formErrors.push({ text: `${props.t('form.contrast.must_select')}` , type: 'error' })

      setCheckBoxErrors(formErrors)
    }
  }

  function processHtml(html) {
    let element = Html.toElement(html)

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    element.innerHTML = (useBold) ? `<strong>${element.innerHTML}</strong>` : element.innerHTML
    element.innerHTML = (useItalics) ? `<em>${element.innerHTML}</em>` : element.innerHTML
    
    if (removeStyling) {
      Html.removeAttribute(element, "style")
    }
    else {
      Html.setAttribute(element, "style", styleAttribute)
    }

    return Html.toString(element)
  }

  function updatePreview() {
    let issue = props.activeIssue
    const html = Html.getIssueHtml(props.activeIssue)

    issue.newHtml = processHtml(html)
    props.handleActiveIssue(issue)
  }

  function isBold() {
    const issue = props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(props.activeIssue)
    const element = Html.toElement(html)

    return ((Html.hasTag(element, 'strong')) || (metadata.fontWeight === 'bold'))
  }

  function isItalicized() {
    const issue = props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(props.activeIssue)
    const element = Html.toElement(html)

    return ((Html.hasTag(element, 'em')) || (metadata.fontStyle == 'italic'))
  }

  function hasStyleTag() {
    const html = Html.getIssueHtml(props.activeIssue)
    const element = Html.toElement(html)

    console.log("checking style attribute")
    console.log(Html.getAttribute(element, "style"))

    return true

    // return (Html.getAttribute(element, "style") != null)
  }

  function cssEmphasisIsValid(issue) {
    if (issue.scanRuleId === 'style_color_misuse') {
      if (!useBold && !useItalics) {
        return false
      }
    }
    return true
  }

  const pending = (props.activeIssue && (props.activeIssue.pending == '1'))
  const buttonLabel = (pending) ? 'form.processing' : 'form.submit'

  return (
    <View as="div" padding="0 x-small">
      <div id="flash-messages" role="alert"></div>
      <View as="div" margin="small 0">
        <Checkbox label={props.t('form.contrast.bolden_text')}
          checked={useBold}
          onChange={handleBoldToggle}>
        </Checkbox>
      </View>

      <View as="div" margin="small 0">
        <Checkbox label={props.t('form.contrast.italicize_text')}
          checked={useItalics}
          onChange={handleItalicsToggle}
          messages={checkBoxErrors}>
        </Checkbox>
      </View>

      <View as="div" margin="small 0">
        {/* TOOD: use props.t */}
        <Checkbox label={"Remove styling from element"}
          checked={removeStyling}
          onChange={handleStyleToggle}
          messages={checkBoxErrors}>
        </Checkbox>
      </View>

      <View as="div" margin="medium 0">
        <Button color="primary" onClick={handleSubmit} interaction={(!pending && props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}>
          {('1' == pending) && <Spinner size="x-small" renderTitle={buttonLabel} />}
          {props.t(buttonLabel)}
        </Button>
        {props.activeIssue.recentlyUpdated &&
          <View margin="0 small">
            <IconCheckMarkLine color="success" />
            <View margin="0 x-small">{props.t('label.fixed')}</View>
          </View>
        }
      </View>
    </View>
  )
}