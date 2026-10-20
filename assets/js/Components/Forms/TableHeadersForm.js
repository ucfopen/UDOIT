import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector';
import OptionFeedback from '../Widgets/OptionFeedback';
import ToggleSwitch from '../Widgets/ToggleSwitch';
import * as Html from '../../Services/Html';
import { UFIXIT_OPTIONS } from '../../Services/Constants';

export default function TableHeadersForm({
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
    SELECT_DIRECTION: UFIXIT_OPTIONS.SELECT_ATTRIBUTE_VALUE,
    MARK_DECORATIVE: UFIXIT_OPTIONS.MARK_DECORATIVE
  }

  const radioOptions = [
    'col',
    'row',
    'both'
  ]
  const [selectedValue, setSelectedValue] = useState('');
  const [extractCaption, setExtractCaption] = useState(false);
  const [hasPotentialCaption, setHasPotentialCaption] = useState(false);

  useEffect(() => {
    if(!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue);
    const table = Html.toElement(html);
    const decorationOnly = (table.getAttribute('role') === 'presentation');
    const headerDirection = getTableHeaderDirection(table);
    setSelectedValue(headerDirection);

    // If the table's first row only has one cell, it may be the table title (<caption>).
    // This occurs a LOT in user-created content. If so, let's help them fix it here.
    let tempHasPotentialCaption = false;

    // First, if there is already a <caption> element, skip this check.
    let existingCaption = table.querySelector('caption');

    if (!existingCaption) {
      let firstRow = table.querySelector('tr');
      
      if (firstRow.children.length === 1) {
        tempHasPotentialCaption = true;
      }
    }

    const fixed = activeIssue.newHtml && activeIssue.status > 0;
    let startingOption = '';

    if (fixed) {
      if (decorationOnly) {
        startingOption = FORM_OPTIONS.MARK_DECORATIVE;
      }
      else if(headerDirection !== '') {
        startingOption = FORM_OPTIONS.SELECT_DIRECTION;
      }
    }

    setActiveOption(startingOption);
    setHasPotentialCaption(tempHasPotentialCaption);
    setExtractCaption(false);

  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, selectedValue, extractCaption])

  const getTableHeaderDirection = (table) => {

    let isRow = true
    let isCol = true

    for (let rowInd in table.rows) {
      let row = table.rows[rowInd]

      for (let cellInd in row.cells) {
        let cell = row.cells[cellInd]
        if (cell.tagName === 'TD') {
          if (rowInd === '0') {
            isCol = false
          }
          if (cellInd === '0') {
            isRow = false
          }
          break
        }
      }

      if (!isRow && !isCol) {
        return ''
      }
    }

    if (isRow && isCol) {
      return 'both'
    }

    return (isRow) ? 'row' : 'col'
  }

  const removeHeaders = (table) => {

    // The table_structure_misuse rule means that when a table is marked as decorative,
    // it should not contain any data-related elements, like <th> or <caption>. All 'summary',
    // 'scope', and 'headers' attributes should also be removed.
    const decorationOnly = (table.getAttribute('role') === 'presentation')
    if(decorationOnly) {
      table.removeAttribute('summary')
      let caption = table.querySelector('caption')
      if(caption) {
        caption.remove()
      }
    }

    for (let row of table.rows) {
      for (let cell of row.cells) {
        cell.removeAttribute('scope')
        cell.removeAttribute('headers')
        if (cell.tagName === 'TH') {
          let newCell = Html.renameElement(cell, 'td')
          row.replaceChild(newCell, cell)
        }
      }
    }

    // Remove the <thead> and move its children to the <tbody>
    let tableHead = table.querySelector("thead");
    let tableBody = table.querySelector("tbody");

    if (tableHead && tableBody) {
      tableBody.prepend(...tableHead.children);
      tableHead.remove();
    }

    // If the user says the first row is really the title, then remove its content
    // and put it in a <caption>.
    if (activeOption === FORM_OPTIONS.SELECT_DIRECTION && extractCaption) {
      let firstRow = table.querySelector('tr');
      const newCaption = document.createElement('caption');
      newCaption.innerText = firstRow.innerText?.trim();
      table.prepend(newCaption);
      firstRow.remove();
    }

    return table
  }

  const fixHeaders = () => {
    const html = activeIssue.initialHtml;
    let table = Html.toElement(html);

    if(!table || !table.rows || table.rows.length === 0) {
      return Html.toString(table)
    }

    removeHeaders(table)
    const decorationRoles = ['presentation', 'none']

    if (activeOption === FORM_OPTIONS.MARK_DECORATIVE) {
      Html.setAttribute(table, 'role', 'presentation')
      return Html.toString(table)
    }
    else {
      let role = Html.getAttribute(table, 'role')
      if (role && typeof(role.toLowerCase) === "function" && decorationRoles.includes(role.toLowerCase())) {
        Html.removeAttribute(table, 'role')
      }
    }

    if ('row' === selectedValue || 'both' === selectedValue) {
      for (let row of table.rows) {
        let firstCell = row.cells[0]
        let newCell = Html.renameElement(firstCell, 'th')
        newCell.setAttribute('scope', 'row')
        row.replaceChild(newCell, firstCell)
      }
    }

    // Create a <thead> row before the <tbody> with its first row.
    if ('col' === selectedValue || 'both' === selectedValue) {
      let firstRow = table.rows[0]
      
      // If the user has selected the extractCaption option, there may be a table with no more rows.
      if (firstRow) {
        for (let cell of firstRow.cells) {
        let newCell = Html.renameElement(cell, 'th')
        newCell.setAttribute('scope', 'col')
          firstRow.replaceChild(newCell, cell)        
      }

      let tableBody = table.querySelector("tbody");
      if (tableBody) {
        let tableHeader = Html.toElement("<thead></thead>");
          let rowClone = Html.toElement(Html.toString(firstRow));
        tableHeader.append(rowClone);
        tableBody.before(tableHeader);
          firstRow.remove();
        }
      }
    }

    return Html.toString(table)
  }

  const updateHtmlContent = () => {
    let issue = activeIssue
    
    issue.newHtml = fixHeaders()
    handleActiveIssue(issue)
  }

  const checkFormErrors = () => {
    let tempErrors = {
      [FORM_OPTIONS.SELECT_DIRECTION]: [],
      [FORM_OPTIONS.MARK_DECORATIVE]: [],
    }

    if (activeOption === FORM_OPTIONS.SELECT_DIRECTION) {
      if (!selectedValue || selectedValue === '') {
        tempErrors[FORM_OPTIONS.SELECT_DIRECTION].push({ text: t('form.table_headers.msg.no_selection'), type: 'error' })
      }
    }

    setFormErrors(tempErrors)
  }

  const handleChange = (newValue) => {
    setSelectedValue(newValue)
  }

  return (
    <>
      {/* OPTION 1: Add label. ID: "SELECT_DIRECTION" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.SELECT_DIRECTION ? 'selected' : ''}`}>
        <RadioSelector
          activeOption = {activeOption}
          isDisabled = {isDisabled}
          setActiveOption = {setActiveOption}
          option = {FORM_OPTIONS.SELECT_DIRECTION}
          labelId = "headerDirectionLabel"
          labelText = {t('form.table_headers.decision.data')}
        />
        {activeOption === FORM_OPTIONS.SELECT_DIRECTION && (
          <>
            <div className="instructions mb-2">{t('form.table_headers.selection_description')}</div>
            <div className="flex-column indented gap-1" role="radiogroup" aria-labelledby="headerDirectionLabel">
              { radioOptions.map(value => (
                <RadioSelector
                  key = {value}
                  name = "tableHeaderDirection"
                  activeOption = {selectedValue}
                  isDisabled = {isDisabled}
                  setActiveOption = {handleChange}
                  option = {value}
                  labelText = {t(`form.table_headers.${value}`)}
                />
              ))}
            </div>
            { hasPotentialCaption && (
              <label>
                <ToggleSwitch
                  initialValue={extractCaption}
                  updateToggle={setExtractCaption}
                  disabled={isDisabled}
                  small={false}
                />
                <div>{t('form.table_headers.label.caption')}</div>
              </label>
            )}
            <OptionFeedback
              t={t}
              feedbackArray={formErrors[FORM_OPTIONS.SELECT_DIRECTION]}
            />
          </>
        )}
      </div>

      {/* OPTION 2: Mark as Decorative. ID: "MARK_DECORATIVE" */}
      <div className={`resolve-option ${activeOption === FORM_OPTIONS.MARK_DECORATIVE ? 'selected' : ''}`}>
        <RadioSelector
          activeOption={activeOption}
          isDisabled={isDisabled}
          setActiveOption={setActiveOption}
          option={FORM_OPTIONS.MARK_DECORATIVE}
          labelText = {t('form.table_headers.decision.no_data')}
        />
      </div>
    </>
  )
}