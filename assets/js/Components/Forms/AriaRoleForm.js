import React, { useEffect, useState } from "react";
import { View } from "@instructure/ui-view";
import { Button } from "@instructure/ui-buttons";
import { Checkbox } from "@instructure/ui-checkbox";
import { Spinner } from "@instructure/ui-spinner";
import * as Html from "../../Services/Html";
import { SimpleSelect } from "@instructure/ui-simple-select";

export default function AriaRoleForm(props) {
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
  };

  const [deleteRole, setDeleteRole] = useState(
    !element && props.activeIssue.status === "1"
  );
  const [detectedTag, setDetectedTag] = useState("");



  let html = props.activeIssue.newHtml
    ? props.activeIssue.newHtml
    : props.activeIssue.sourceHtml;

  if (props.activeIssue.status === "1") {
    html = props.activeIssue.newHtml;
  }
  let element = Html.toElement(html);

  const [textInputValue, setTextInputValue] = useState(
    element ? Html.getAttribute(element, "role") : ""
  );
  const [textInputErrors, setTextInputErrors] = useState([]);
  let formErrors = [];
  useEffect(() => {
    let html = props.activeIssue.newHtml
      ? props.activeIssue.newHtml
      : props.activeIssue.sourceHtml;
    if (props.activeIssue.status === 1) {
      html = props.activeIssue.newHtml;
    }
    let element = Html.toElement(html);
    setTextInputValue(element ? Html.getAttribute(element, "role") : "");
    setDeleteRole(!element && props.activeIssue.status === 1);
    formErrors = [];

    const match = Html.getTagName(html);
    if (match) {
      setDetectedTag(match);
    }
  }, [props.activeIssue]);
  useEffect(() => {
    handleHtmlUpdate();
  }, [textInputValue, deleteRole]);
  const handleHtmlUpdate = () => {
    let updatedElement = Html.toElement(html);


    if (deleteRole) {
      updatedElement = Html.removeAttribute(updatedElement, "role");
    } else {
      updatedElement = Html.setAttribute(
        updatedElement,
        "role",
        textInputValue
      );
    }

    let issue = props.activeIssue;
    issue.newHtml = Html.toString(updatedElement);
    props.handleActiveIssue(issue);
  };
  const handleButton = () => {
    formErrors = [];
    if (formErrors.length > 0) {
      setTextInputErrors(formErrors);
    } else {
      props.handleIssueSave(props.activeIssue);
    }
  };
  const handleInput = (e, { id, value }) => {
    setTextInputValue(value);
    // handleHtmlUpdate()
  };

  const handleCheckbox = () => {
   setDeleteRole(!deleteRole)
  // handleHtmlUpdate()
  }


  const pending = props.activeIssue && props.activeIssue.pending == "1";
  const buttonLabel = pending ? "form.processing" : "form.submit";
  const validRoles = detectedTag ? ariaRoleMap[detectedTag] || [] : [];

  return (
    <View as="div" padding="x-small">
      <View>
        {!validRoles.length ? (
          <div>No valid ARIA roles for &lt;{detectedTag}&gt;</div>
        ) : (
          <SimpleSelect
            renderLabel="Please choose one option"
            assistiveText="Use arrow keys to navigate options."
            value={textInputValue}
            onChange={handleInput}
          >
            {validRoles.map((opt, index) => (
              <SimpleSelect.Option key={index} id={`opt-${index}`} value={opt}>
                {opt}
              </SimpleSelect.Option>
            ))}
          </SimpleSelect>
        )}
      </View>
      <View>
        <View as="span" display="inline-block">
          <Checkbox
            label="form.label.remove_label"
            checked={deleteRole}
            onChange={handleCheckbox}
          />
        </View>
      </View>
      <View as="div" margin="small 0">
        <Button
          color="primary"
          onClick={handleButton}
          interaction={
            !pending && props.activeIssue.status !== 2 ? "enabled" : "disabled"
          }
        >
          {"1" == pending && (
            <Spinner size="x-small" renderTitle={props.t(buttonLabel)} />
          )}
          {props.t(buttonLabel)}
        </Button>
      </View>
    </View>
  );
}
