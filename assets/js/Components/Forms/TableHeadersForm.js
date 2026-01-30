import React, { useState, useEffect } from 'react'
import RadioSelector from '../Widgets/RadioSelector';
import OptionFeedback from '../Widgets/OptionFeedback';
import * as Html from '../../Services/Html';

export default function TableHeadersForm({
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
    SELECT_DIRECTION: settings.UFIXIT_OPTIONS.SELECT_ATTRIBUTE_VALUE,
    MARK_DECORATIVE: settings.UFIXIT_OPTIONS.MARK_DECORATIVE,
    MARK_AS_REVIEWED: settings.UFIXIT_OPTIONS.MARK_AS_REVIEWED
  }

  const radioOptions = [
    'col',
    'row',
    'both'
  ]
  const [selectedValue, setSelectedValue] = useState('')

  useEffect(() => {
    if(!activeIssue) {
      return
    }

    const html = Html.getIssueHtml(activeIssue)
    const table = Html.toElement(html)
    const decorationOnly = (table.getAttribute('role') === 'presentation')
    const headerDirection = getTableHeaderDirection(table)
    const reviewed = activeIssue.newHtml && (activeIssue.status === 2 || activeIssue.status === 3)

    if (reviewed) {
      setActiveOption(FORM_OPTIONS.MARK_AS_REVIEWED)
    }
    else if (decorationOnly) {
      setActiveOption(FORM_OPTIONS.MARK_DECORATIVE)
    }
    else if(headerDirection !== '') {
      setActiveOption(FORM_OPTIONS.SELECT_DIRECTION)
    }
    else {
      setActiveOption('')
    }

    setSelectedValue(headerDirection)
    
  }, [activeIssue])

  useEffect(() => {
    updateHtmlContent()
    checkFormErrors()
  }, [activeOption, selectedValue])

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
    for (let row of table.rows) {
      for (let cell of row.cells) {
        if (cell.tagName === 'TH') {
          let newCell = Html.renameElement(cell, 'td')
          newCell.removeAttribute('scope')
          row.replaceChild(newCell, cell)
        }
      }
    }

    return table
  }

  const fixHeaders = () => {
    const html = activeIssue.initialHtml
    let table = Html.toElement(html)
''
    if(!table || !table.rows || table.rows.length === 0) {
      return Html.toString(table)
    }

    removeHeaders(table)

    if (activeOption === FORM_OPTIONS.MARK_DECORATIVE) {
      Html.setAttribute(table, 'role', 'presentation')
      return Html.toString(table)
    }

    if ('col' === selectedValue || 'both' === selectedValue) {
      let row = table.rows[0]
      
      for (let cell of row.cells) {
        let newCell = Html.renameElement(cell, 'th')
        newCell.setAttribute('scope', 'col')
        row.replaceChild(newCell, cell)        
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

    return Html.toString(table)
  }

  const updateHtmlContent = () => {
    let issue = activeIssue
    issue.isModified = true

    if (activeOption === FORM_OPTIONS.MARK_AS_REVIEWED) {
      issue.newHtml = issue.initialHtml
      handleActiveIssue(issue)
      return
    }
    
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
          labelText = {t('form.table_headers.selection_description')}
          />
        {activeOption === FORM_OPTIONS.SELECT_DIRECTION && (
          <>
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
            <OptionFeedback feedbackArray={formErrors[FORM_OPTIONS.SELECT_DIRECTION]} />
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
          labelText = {t('form.table_headers.decoration_only')}
          />
      </div>

      {/* OPTION 3: Mark as Reviewed. ID: "MARK_AS_REVIEWED" */}
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