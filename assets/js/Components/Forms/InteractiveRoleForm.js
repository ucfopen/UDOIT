import React, { useEffect, useState } from 'react'
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from '../Widgets/OptionFeedback'
import * as Html from '../../Services/Html'
import { UFIXIT_OPTIONS } from '../../Services/Constants'

export default function InteractiveRoleForm({
  t,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
}) {
  const FORM_OPTIONS = {
    MAKE_LINK: UFIXIT_OPTIONS.ADD_TEXT,
    MAKE_DISCLOSURE: 'make-disclosure',
    REMOVE_ROLE: UFIXIT_OPTIONS.DELETE_ATTRIBUTE
  }
  const [href, setHref] = useState('')

  const getBaseElement = () => Html.toElement(activeIssue.initialHtml || activeIssue.sourceHtml)
  const getSummary = (detailsElement) => Array.from(detailsElement?.childNodes || [])
    .find((node) => node.nodeType === 1 && node.tagName === 'SUMMARY')
  const isDisclosure = (element) => element?.tagName === 'DETAILS' && Boolean(getSummary(element))
  const canMakeDisclosure = activeIssue && isDisclosure(getBaseElement())

  useEffect(() => {
    if (!activeIssue) return

    const element = getBaseElement()
    const fixed = activeIssue.newHtml && (activeIssue.status === 1 || activeIssue.status === 3)
    const fixedElement = fixed ? Html.toElement(activeIssue.newHtml) : null
    const isLink = fixedElement?.tagName === 'A' && fixedElement.hasAttribute('href')
    const isFixedDisclosure = isDisclosure(fixedElement)

    setHref((isLink ? fixedElement : element)?.getAttribute('href') || '')
    setActiveOption(isLink
      ? FORM_OPTIONS.MAKE_LINK
      : isFixedDisclosure
        ? FORM_OPTIONS.MAKE_DISCLOSURE
        : fixed
          ? FORM_OPTIONS.REMOVE_ROLE
          : '')
    setFormErrors([])
  }, [activeIssue])

  const getErrors = (option, hrefValue = href) => {
    const errors = {
      [FORM_OPTIONS.MAKE_LINK]: [],
      [FORM_OPTIONS.MAKE_DISCLOSURE]: [],
      [FORM_OPTIONS.REMOVE_ROLE]: []
    }

    if (option === FORM_OPTIONS.MAKE_LINK && !hrefValue.trim()) {
      errors[FORM_OPTIONS.MAKE_LINK].push({
        text: t('form.interactive_role.msg.href_required'),
        type: 'error'
      })
    }

    return errors
  }

  const createLink = (element, hrefValue) => {
    const link = document.createElement('a')

    Array.from(element.attributes).forEach((attribute) => {
      if (!['href', 'role', 'tabindex'].includes(attribute.name)) {
        link.setAttribute(attribute.name, attribute.value)
      }
    })

    if (element.tagName === 'DIV') {
      const style = link.getAttribute('style') || ''
      link.setAttribute('style', `${style}${style ? '; ' : ''}display: inline-block`)
    }

    link.setAttribute('href', hrefValue.trim())
    while (element.firstChild) {
      link.appendChild(element.firstChild)
    }

    return link
  }

  const copySafeAttributes = (source, target) => {
    Array.from(source.attributes).forEach((attribute) => {
      if (!['role', 'tabindex', 'aria-expanded', 'aria-controls'].includes(attribute.name)) {
        target.setAttribute(attribute.name, attribute.value)
      }
    })
  }

  const createDisclosure = (detailsElement) => {
    const disclosure = document.createElement('details')
    const childNodes = Array.from(detailsElement.childNodes)
    const originalSummary = getSummary(detailsElement)
    const summary = document.createElement('summary')

    copySafeAttributes(detailsElement, disclosure)
    copySafeAttributes(originalSummary, summary)

    while (originalSummary.firstChild) {
      summary.appendChild(originalSummary.firstChild)
    }

    disclosure.appendChild(summary)
    childNodes
      .filter((node) => node !== originalSummary)
      .forEach((node) => disclosure.appendChild(node))

    return disclosure
  }

  const createPlainContent = (detailsElement) => {
    const content = document.createElement('div')
    const childNodes = Array.from(detailsElement.childNodes)
    const originalSummary = getSummary(detailsElement)

    copySafeAttributes(detailsElement, content)

    while (originalSummary.firstChild) {
      content.appendChild(originalSummary.firstChild)
    }

    childNodes
      .filter((node) => node !== originalSummary)
      .forEach((node) => content.appendChild(node))

    return content
  }

  const updateHtml = (option, hrefValue = href) => {
    const issue = activeIssue

    const element = getBaseElement()
    if (option === FORM_OPTIONS.MAKE_LINK) {
      issue.newHtml = Html.toString(createLink(element, hrefValue))
    } else if (option === FORM_OPTIONS.MAKE_DISCLOSURE) {
      issue.newHtml = Html.toString(createDisclosure(element))
    } else if (option === FORM_OPTIONS.REMOVE_ROLE) {
      if (isDisclosure(element)) {
        issue.newHtml = Html.toString(createPlainContent(element))
      } else {
        element.removeAttribute('role')
        element.removeAttribute('tabindex')
        issue.newHtml = Html.toString(element)
      }
    }

    handleActiveIssue(issue, option)
  }

  const handleOptionChange = (option) => {
    const errors = getErrors(option)
    setFormErrors(errors)
    setActiveOption(option)
    if (errors[FORM_OPTIONS.MAKE_LINK]?.length === 0) {
      updateHtml(option)
    }
  }

  const handleHrefChange = (event) => {
    const hrefValue = event.target.value
    setHref(hrefValue)
    const errors = getErrors(FORM_OPTIONS.MAKE_LINK, hrefValue)
    setFormErrors(errors)
    if (errors[FORM_OPTIONS.MAKE_LINK].length === 0) {
      updateHtml(FORM_OPTIONS.MAKE_LINK, hrefValue)
    }
  }

  return (
    <>
      <div className="instructions">
        {t(canMakeDisclosure
          ? 'form.interactive_role.label.question_disclosure'
          : 'form.interactive_role.label.question')}
      </div>

      {!canMakeDisclosure && (
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.MAKE_LINK ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={handleOptionChange}
            option={FORM_OPTIONS.MAKE_LINK}
            labelId="make-link-label"
            labelText={t('form.interactive_role.label.make_link')}
          />
          {activeOption === FORM_OPTIONS.MAKE_LINK && (
            <>
              <input
                id="interactiveRoleHref"
                aria-labelledby="make-link-label"
                className="w-100"
                type="text"
                value={href}
                onChange={handleHrefChange}
                placeholder="https://example.com"
                disabled={isDisabled}
              />
              <OptionFeedback
                t={t}
                feedbackArray={formErrors[FORM_OPTIONS.MAKE_LINK]}
              />
            </>
          )}
        </div>
      )}

      {canMakeDisclosure && (
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.MAKE_DISCLOSURE ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={handleOptionChange}
            option={FORM_OPTIONS.MAKE_DISCLOSURE}
            labelText={t('form.interactive_role.label.make_expandable_section')}
          />
        </div>
      )}

      <div className={`resolve-option ${activeOption === FORM_OPTIONS.REMOVE_ROLE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={handleOptionChange}
          option={FORM_OPTIONS.REMOVE_ROLE}
          labelText={t('form.interactive_role.label.remove_role')}
        />
      </div>
    </>
  )
}
