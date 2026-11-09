import React, { useEffect, useState } from "react"
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from "../Widgets/OptionFeedback"
import * as Html from "../../Services/Html"
import { UFIXIT_OPTIONS } from "../../Services/Constants"

export default function AriaRoleForm({
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
    DELETE_ROLE: UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
  }
  const [selectValue, setSelectValue] = useState("")

  useEffect(() => {
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    let currentRole = element ? Html.getAttribute(element, "role") : ''
    if (!currentRole) {
      currentRole = ''
    }

    setSelectValue(currentRole)

    const fixed = activeIssue.newHtml && activeIssue.status > 0
    const deleted = !currentRole;
    let startingOption = ''

    if (fixed && deleted) {
      startingOption = FORM_OPTIONS.DELETE_ROLE
    }
    setActiveOption(startingOption)
    
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, selectValue])

  const updateHtmlContent = () => {
    let issue = activeIssue

    let html = Html.getIssueHtml(activeIssue)
    let updatedElement = Html.toElement(html)
    const deleteRole = (activeOption === FORM_OPTIONS.DELETE_ROLE)

    if (deleteRole) {
      updatedElement = Html.removeAttribute(updatedElement, "role")
    }
    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.DELETE_ROLE]: []
    }
    setFormErrors(tempErrors)
  }

  return (
    <>
      {/* Delete Role. ID: "DELETE_ROLE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ROLE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DELETE_ROLE}
          labelText = {t('form.aria_role.label.remove')}
        />
        {activeOption === FORM_OPTIONS.DELETE_ROLE && (
          <OptionFeedback
            t={t}
            feedbackArray={formErrors[FORM_OPTIONS.DELETE_ROLE]}
          />
        )}
      </div>
    </>
  )
}