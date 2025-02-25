import React, { useState, useEffect } from 'react'
import { Checkbox } from '@instructure/ui-checkbox';
import { View } from '@instructure/ui-view'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import { Text } from '@instructure/ui-text'
import { TextArea } from '@instructure/ui-text-area'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import * as Html from '../../Services/Html';

export default function AltText ({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
  handleManualScan
 }) {
  
  const maxLength = 150

  const [textInputValue, setTextInputValue] = useState('')
  const [isDecorative, setIsDecorative] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [textInputErrors, setTextInputErrors] = useState([])
  const [formErrors, setFormErrors] = useState([])
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (activeIssue) {
      const html = Html.getIssueHtml(activeIssue)
      let altText = Html.getAttribute(html, 'alt')
      altText = (typeof altText === 'string') ? altText : ''

      setTextInputValue(altText)
      setIsDecorative((elementIsDecorative(html) === 'true'))
      setCharacterCount(altText.length)
      setTextInputErrors([])
    }
  }, [activeIssue])

  const handleHtmlUpdate = () => {
    const html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    
    if (isDecorative) {
      element = Html.setAttribute(element, "role", "presentation")
      element = Html.addClass(element, 'phpally-ignore')
      element = Html.setAttribute(element, 'alt', '')
    } else {
      element = Html.removeAttribute(element, "role")
      element = Html.removeClass(element, 'phpally-ignore')
      element = Html.setAttribute(element, "alt", textInputValue)
    }

    let issue = activeIssue
    issue.newHtml = Html.toString(element)

    handleActiveIssue(issue)
  }

  const handleButton = () => {
    setFormErrors([])
    if (!isDecorative) {
      checkTextNotEmpty()
      checkTextLength()
      checkForFileExtensions()
      checkFileName()
    }

    if (formErrors.length > 0) {
      setTextInputErrors(formErrors)
    } else {
      handleIssueSave(activeIssue)
    }
  }

  const handleInput = (event) => {
    setTextInputValue(event.target.value)
    setCharacterCount(event.target.value.length)
    handleHtmlUpdate()
  }

  const handleCheckbox = () => {
    setIsDecorative(!isDecorative)
    handleHtmlUpdate()
  }

  const checkTextNotEmpty = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text === '') {
      formErrors.push({ text: t('form.alt.msg.text_empty'), type: 'error' })
    }
  }

  const checkTextLength = () => {
    const text = textInputValue.trim().toLowerCase()
    if (text.length > maxLength) {
      formErrors.push({ text: t('form.alt.msg.text_too_long'), type: 'error' })
    }
  }

  const checkForFileExtensions = () => {
    let fileRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.png|.jpg|.jpeg|.gif)$/i

    if (textInputValue.match(fileRegex) != null) {
      formErrors.push({ text: t('form.alt.msg.text_has_file_extension'), type: 'error' })
    }
  }

  const checkFileName = () => {
    let fileName = Html.getAttribute(activeIssue.sourceHtml, "src")
    
    if (textInputValue === fileName) {
      formErrors.push({ text: t('form.alt.msg.text_matches_filename'), type: 'error' })
    }
  }

  const elementIsDecorative = (htmlString) => {
    const decorativeAttribute = Html.getAttribute(htmlString, "data-decorative")
    const roleAttribute = Html.getAttribute(htmlString, "role")
    const classes = Html.getClasses(htmlString)

    if (Html.getTagName(htmlString) !== 'IMG') {
      return false
    }

    return (decorativeAttribute === 'true' || roleAttribute === 'presentation' || (classes.includes('phpally-ignore')))
  }

  return (
    <View as="div" padding="x-small">
      <View>
        <TextArea
          label={t('form.alt.text')}
          display="inline-block"
          width="100%"
          onChange={handleInput}
          value={textInputValue}
          id="textInputValue"
          disabled={isDecorative}
          messages={textInputErrors}
        />
      </View>
      <View as="div" textAlign="end" padding="x-small 0 0 0">
        <Text size="small" weight="light">
          {characterCount} {t('form.alt.of')} {maxLength} {t('form.alt.chars')}
        </Text>
      </View>
      <View as="div" margin="0 0 small 0">
        <Checkbox label={t('form.alt.mark_decorative')} 
          checked={isDecorative} 
          onChange={handleCheckbox} />
      </View>
      <View as="div" margin="small 0">
        <Button color="primary" onClick={handleButton} interaction={(!pending && activeIssue?.status !== 2) ? 'enabled' : 'disabled'}>
          {('1' == pending) && <Spinner size="x-small" renderTitle={t('form.processing')} />}
          {t('form.submit')}
        </Button>
        {activeIssue.recentlyUpdated &&
          <View margin="0 small">
            <IconCheckMarkLine color="success" />
            <View margin="0 x-small">{t('label.fixed')}</View>
          </View>
        }
      </View>
    </View>
  )
}