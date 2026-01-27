import React, { useEffect, useState } from "react"
import OptionFeedback from "../Widgets/OptionFeedback"
import Combobox from "../Widgets/Combobox"
import * as Html from "../../Services/Html"

export default function AriaRoleForm({
  t,
  settings,
  activeIssue,
  isDisabled,
  handleActiveIssue,
  markAsReviewed,
  setMarkAsReviewed,
  setFormInvalid
 }) {

  const FORM_OPTIONS = {
    SELECT_ROLE: 'select-role',
    DELETE_ROLE: 'delete-role',
    MARK_AS_REVIEWED: 'mark-as-reviewed'
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

  const [activeOption, setActiveOption] = useState('')
  const [deleteRole, setDeleteRole] = useState(false)
  const [detectedTag, setDetectedTag] = useState("")
  const [validRoles, setValidRoles] = useState([])
  const [selectValue, setSelectValue] = useState("")
  const [selectOptions, setSelectOptions] = useState([])
  const [formErrors, setFormErrors] = useState([])
  
  useEffect(() => {
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    let currentRole = element ? Html.getAttribute(element, "role") : ''
    if (!currentRole) {
      currentRole = ''
    }
    
    let deleted = (!element && activeIssue.status === 1)
    let hasValidRole = false

    const tagName = Html.getTagName(html)
    let tempValidRoles = []

    if (tagName) {
      setDetectedTag(tagName)
      
      tempValidRoles = ariaRoleMap[tagName] || []
      if (tempValidRoles.indexOf(currentRole.toLowerCase()) !== -1) {
        hasValidRole = true
      }

      if (tempValidRoles.length > 0) {
        let tempSelectOptions = [{
          value: '',
          name: t('form.aria_role.label.none_selected'),
          selected: currentRole === ''
        }]
        tempValidRoles.forEach(role => {
          tempSelectOptions.push({
            value: role,
            name: role,
            selected: role.toLowerCase() === currentRole.toLowerCase()
          })
        })
        setValidRoles(tempValidRoles)
        setSelectOptions(tempSelectOptions)
      }
      else {
        setSelectOptions([])
      }
    }
    else {
      setDetectedTag("")
      setValidRoles([])
    }

    if (deleted) {
      setActiveOption(FORM_OPTIONS.DELETE_ROLE)
    }
    else if (hasValidRole) {
      setActiveOption(FORM_OPTIONS.SELECT_ROLE)
    }
    else if (markAsReviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else {
      setActiveOption('')
    }

    setSelectValue(currentRole)
    setDeleteRole(deleted)
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [selectValue, deleteRole, markAsReviewed])

  useEffect(() => {
    let invalid = false
    if(!markAsReviewed) {
      Object.keys(formErrors).forEach(optionKey => {
        if(formErrors[optionKey].length > 0) {
          invalid = true
        }
      })
    }
    setFormInvalid(invalid)
  }, [formErrors, markAsReviewed])

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true
    
    if (markAsReviewed) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }

    let html = Html.getIssueHtml(activeIssue)
    let updatedElement = Html.toElement(html)

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

    if (!deleteRole) {
      if (selectValue === '' || validRoles.indexOf(selectValue) === -1) {
        tempErrors[FORM_OPTIONS.SELECT_ROLE].push({ text: t('form.aria_role.msg.role_required'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleComboboxSelect = (id, value) => {
    setSelectValue(value)
  }

  const handleOptionChange = (option) => {
    setActiveOption(option)

    if (option === FORM_OPTIONS.SELECT_ROLE) {
      setDeleteRole(false)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.DELETE_ROLE) {
      setDeleteRole(true)
      setMarkAsReviewed(false)
    } else if (option === FORM_OPTIONS.MARK_AS_REVIEWED) {
      setDeleteRole(false)
      setMarkAsReviewed(true)
    }
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
          <label className={`option-label` + (isDisabled ? ' disabled' : '')} id='combo-label-role-select'>
            <input
              type="radio"
              id={FORM_OPTIONS.SELECT_ROLE}
              name="ufixitRadioOption"
              tabIndex="0"
              checked={activeOption === FORM_OPTIONS.SELECT_ROLE}
              disabled={isDisabled}
              onChange={() => {
                handleOptionChange(FORM_OPTIONS.SELECT_ROLE)
              }} />
            {t('form.aria_role.label.select')}
          </label>
          {activeOption === FORM_OPTIONS.SELECT_ROLE && (
            <>
              <Combobox
                handleChange={handleComboboxSelect}
                id='role-select'
                isDisabled={isDisabled || deleteRole}
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
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.DELETE_ROLE}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.DELETE_ROLE}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.DELETE_ROLE)
            }} />
          {t('form.aria_role.label.remove')}
        </label>
        {activeOption === FORM_OPTIONS.DELETE_ROLE && (
          <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.DELETE_ROLE]} />
        )}
      </div>
      
      {/* OPTION 3: Mark as Reviewed. ID: "mark-as-reviewed" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_AS_REVIEWED ? 'selected' : ''}`}>
        <label className={`option-label` + (isDisabled ? ' disabled' : '')}>
          <input
            type="radio"
            id={FORM_OPTIONS.MARK_AS_REVIEWED}
            name="ufixitRadioOption"
            tabIndex="0"
            checked={activeOption === FORM_OPTIONS.MARK_AS_REVIEWED}
            disabled={isDisabled}
            onChange={() => {
              handleOptionChange(FORM_OPTIONS.MARK_AS_REVIEWED)
            }} />
          {t('fix.label.no_changes')}
        </label>
      </div>
    </>
  )
}
