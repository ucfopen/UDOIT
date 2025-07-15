import React, { useEffect, useState } from "react"
import FormFeedback from './FormFeedback'
import * as Html from "../../Services/Html"

export default function AriaRoleForm({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  isDisabled,
  handleActiveIssue
 }) {

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

  const [deleteRole, setDeleteRole] = useState(false)
  const [detectedTag, setDetectedTag] = useState("")
  const [validRoles, setValidRoles] = useState([])
  const [selectValue, setSelectValue] = useState("")
  
  const handleHtmlUpdate = () => {
    let oldHtml = Html.getIssueHtml(activeIssue)
    let updatedElement = Html.toElement(oldHtml)

    if (deleteRole) {
      updatedElement = Html.removeAttribute(updatedElement, "role")
    } else {
      updatedElement = Html.setAttribute(
        updatedElement,
        "role",
        selectValue
      )
    }

    let issue = activeIssue
    issue.newHtml = Html.toString(updatedElement)
    handleActiveIssue(issue)
  }

  useEffect(() => {
    let html = Html.getIssueHtml(activeIssue)
    let element = Html.toElement(html)
    setSelectValue(element ? Html.getAttribute(element, "role") : "")
    setDeleteRole(!element && activeIssue.status === 1)

    const tagName = Html.getTagName(html)

    if (tagName) {
      setDetectedTag(tagName)
      setValidRoles(ariaRoleMap[tagName] || [])
    }
 
    else {
      setDetectedTag("")
      setValidRoles([])
    }
  }, [activeIssue])

  useEffect(() => {
    handleHtmlUpdate()
  }, [selectValue, deleteRole])
  

  const handleSubmit = () => {
    handleIssueSave(activeIssue)
  }

  const handleSelect = (newValue) => {
    setSelectValue(newValue)
  }

  const handleCheckbox = () => {
   setDeleteRole(!deleteRole)
  }

  return (
    <>
      {(detectedTag === '') ? (
        <label>{t('form.aria_role.feedback.no_tag')}</label>
      ) : (validRoles.length === 0) ? (
        <label>{t('form.aria_role.feedback.no_roles', {tagName: detectedTag})}</label>
      ) : (
        <>
          <label htmlFor="role-select" className="instructions">{t('form.aria_role.label.select')}</label>
          <select
            id="role-select"
            name="role-select"
            className="w-100 mt-2"
            value={selectValue}
            onChange={(e) => handleSelect(e.target.value)}
            tabIndex="0"
            disabled={isDisabled || deleteRole}>
            <option key='empty' id='opt-empty' value=''>
              {t('form.aria_role.label.none_selected')}
            </option>
            {validRoles.map((opt, index) => (
              <option key={index} id={`opt-${index}`} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="separator mt-2">{t('fix.label.or')}</div>
        </>
      )}
      <div className="flex-row justify-content-start gap-1 mt-2">
        <input type="checkbox"
          id="deleteRoleCheckbox"
          name="deleteRoleCheckbox"
          tabIndex="0"
          disabled={isDisabled}
          checked={deleteRole}
          onChange={handleCheckbox} />
        <label htmlFor="deleteRoleCheckbox" className="instructions">{t('form.aria_role.label.remove')}</label>
      </div>
      <FormFeedback
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled || !deleteRole && selectValue === ''}
        handleSubmit={handleSubmit}
        formErrors={[]} />
    </>
  )
}
