import React, { useEffect, useState } from "react"
import RadioSelector from '../Widgets/RadioSelector'
import OptionFeedback from "../Widgets/OptionFeedback"
import Combobox from "../Widgets/Combobox"
import * as Html from "../../Services/Html"

export default function AriaRoleForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  activeOption,
  setActiveOption,
  formErrors,
  setFormErrors
 }) {

  const FORM_OPTIONS = {
    SELECT_ROLE: settings.UFIXIT_OPTIONS.SELECT_ROLE,
    DELETE_ROLE: settings.UFIXIT_OPTIONS.DELETE_ATTRIBUTE,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const ariaRoleMap = {
    A: [
      "button",
      "checkbox",
      "menuitem",
      "menuitemcheckbox",
      "menuitemradio",
      "option",
      "radio",
      "switch",
      "tab",
      "treeitem",
    ],
    ABBR: ["contentinfo", "group"],
    ADDRESS: ["note"],
    ARTICLE: [
      "application",
      "document",
      "feed",
      "main",
      "presentation",
      "region",
    ],
    ASIDE: ["feed", "note", "presentation", "region", "search"],
    AUDIO: ["application"],
    BLOCKQUOTE: ["group", "note"],
    BUTTON: [
      "checkbox",
      "combobox",
      "gridcell",
      "link",
      "menuitem",
      "menuitemcheckbox",
      "menuitemradio",
      "option",
      "radio",
      "separator",
      "slider",
      "switch",
      "tab",
      "treeitem",
    ],
    DETAILS: ["group", "region"],
    DIV: ["presentation", "group", "region", "feed", "document"],
    DIALOG: ["alertdialog"],
    EMBED: ["application", "document", "img", "image", "presentation"],
    FIGCAPTURE: ["group", "presentation"],
    FOOTER: ["contentinfo", "group"],
    FORM: ["form", "none", "presentation", "search"],
    H1: ["none", "presentation", "tab"],
    H2: ["none", "presentation", "tab"],
    H3: ["none", "presentation", "tab"],
    H4: ["none", "presentation", "tab"],
    H5: ["none", "presentation", "tab"],
    H6: ["none", "presentation", "tab"],
    IMG: [
      "button",
      "checkbox",
      "link",
      "math",
      "menuitem",
      "menuitemcheckbox",
      "menuitemradio",
      "meter",
      "option",
      "progressbar",
      "radio",
      "scrollbar",
      "separator",
      "switch",
      "tab",
      "treeitem",
    ],
    INPUT: [
      "checkbox",
      "combobox",
      "gridcell",
      "link",
      "menuitem",
      "menuitemcheckbox",
      "menuitemradio",
      "radio",
      "separator",
      "slider",
      "switch",
      "tab",
      "treeitem",
    ],
    MENU: [
      "group",
      "listbox",
      "menu",
      "menubar",
      "presentation",
      "radiogroup",
      "tablist",
      "toolbar",
      "tree",
    ],
    NAV: ["menu", "menubar", "none", "presentation", "tablist"],
    SELECT: ["combobox", "listbox", "menu"],
    SEARCH: ["form", "group", "none", "presentation", "region"],
    SECTION: [
      "alert",
      "alertdialog",
      "application",
      "banner",
      "complementary",
      "contentinfo",
      "dialog",
      "document",
      "feed",
      "group",
      "log",
      "main",
      "marquee",
      "navigation",
      "note",
      "presentation",
      "search",
      "status",
      "tabpanel",
    ],
    SPAN: ["presentation", "group", "region", "feed", "document"],
    VIDEO: ["application"],
    UL: ["list", "menu", "menubar", "tablist", "tree"],
    FOOTER: ["group", "presentation"],
    FORM: ["none", "presentation", "search"],
  }

  const [detectedTag, setDetectedTag] = useState("")
  const [validRoles, setValidRoles] = useState([])
  const [selectValue, setSelectValue] = useState("")
  const [selectOptions, setSelectOptions] = useState([])
  
  useEffect(() => {
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)
    let currentRole = element ? Html.getAttribute(element, "role") : ''
    if (!currentRole) {
      currentRole = ''
    }    
    
    const deleted = (!element && activeIssue.status === 1)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    const tagName = Html.getTagName(html)
    const validRoles = ariaRoleMap[tagName] || []
    const hasValidRole = (currentRole !== '' && validRoles.indexOf(currentRole) !== -1)

    if (tagName) {
      setDetectedTag(tagName)
      setValidRoles(validRoles)
      setSelectOptions(computeSelectOptions(tagName, currentRole))
    }
    else {
      setDetectedTag("")
      setValidRoles([])
    }

    if (deleted) {
      setActiveOption(FORM_OPTIONS.DELETE_ROLE)
    }
    else if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (hasValidRole) {
      setActiveOption(FORM_OPTIONS.SELECT_ROLE)
    }
    else {
      setActiveOption('')
    }

    setSelectValue(currentRole)
  }, [activeIssue])

  const computeSelectOptions = (tagName, currentSelection) => {
    const tempValidRoles = ariaRoleMap[tagName] || []
    let tempSelectOptions = []

    if (tempValidRoles.length > 0) {
      tempSelectOptions.push({
        value: '',
        name: t('form.aria_role.label.none_selected'),
        selected: currentSelection === ''
      })
      tempValidRoles.forEach(role => {
        tempSelectOptions.push({
          value: role,
          name: role,
          selected: role.toLowerCase() === currentSelection.toLowerCase()
        })
      })
    }
      
    return tempSelectOptions
  }

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [selectValue, activeOption])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true
    
    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    let html = Html.getIssueHtml(activeIssue)
    let updatedElement = Html.toElement(html)
    const deleteRole = (activeOption === FORM_OPTIONS.DELETE_ROLE)

    if (deleteRole) {
      updatedElement = Html.removeAttribute(updatedElement, "role")
    } else {
      updatedElement = Html.setAttribute(updatedElement, "role", selectValue)
    }

    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.SELECT_ROLE]: [],
      [FORM_OPTIONS.DELETE_ROLE]: []
    }

    if (activeOption === FORM_OPTIONS.SELECT_ROLE) {
      if (selectValue === '' || validRoles.indexOf(selectValue) === -1) {
        tempErrors[FORM_OPTIONS.SELECT_ROLE].push({ text: t('form.aria_role.msg.role_required'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleComboboxSelect = (id, value) => {
    setSelectValue(value)

    // This recomputes the select options to update which one is marked as selected
    // That way if the user switches between options, the one they previously chose remains selected
    const tempSelectOptions = computeSelectOptions(detectedTag, value)
    setSelectOptions(tempSelectOptions)
  }

  return (
    <>
      {/* OPTION 1: Select valid role... If there is a valid tag with valid role options. ID: "select-role" */}
      {(detectedTag === '') ? (
        <div className="resolve-option">
          <label className="option-label disabled">
            <input
              type="radio"
              id="no-select-1"
              disabled={true}
              checked={false} />
            {t('form.aria_role.feedback.no_tag')}
          </label>
        </div>
      ) : (validRoles.length === 0) ? (
        <div className="resolve-option">
          <label className="option-label disabled">
            <input
              type="radio"
              id="no-select-2"
              disabled={true}
              checked={false} />
            {t('form.aria_role.feedback.no_roles', {tagName: detectedTag})}
          </label>
        </div>
      ) : (
        <div className={`resolve-option ${activeOption === FORM_OPTIONS.SELECT_ROLE ? 'selected' : ''}`}>
          <RadioSelector
            activeOption={activeOption}
            isDisabled={isDisabled}
            setActiveOption={setActiveOption}
            option={FORM_OPTIONS.SELECT_ROLE}
            labelId = 'combo-label-role-select'
            labelText = {t('form.aria_role.label.select')}
            />
          {activeOption === FORM_OPTIONS.SELECT_ROLE && (
            <>
              <Combobox
                handleChange={handleComboboxSelect}
                id='role-select'
                isDisabled={isDisabled}
                label=''
                options={selectOptions}
                settings={settings}
              />
              <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.SELECT_ROLE]} />
            </>
          )}
        </div>
      )}

      {/* OPTION 2: Delete Role. ID: "delete-role" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.DELETE_ROLE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.DELETE_ROLE}
          labelText = {t('form.aria_role.label.remove')}
          />
        {activeOption === FORM_OPTIONS.DELETE_ROLE && (
          <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.DELETE_ROLE]} />
        )}
      </div>
      
      {/* OPTION 3: Mark as Reviewed. ID: "mark-as-reviewed" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_AS_REVIEWED}
          labelText = {t('fix.label.no_changes')}
          />
      </div>
    </>
  )
}