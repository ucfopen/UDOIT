import React, { useState, useEffect } from 'react'
import FormFeedback from './FormFeedback'
import * as Html from '../../Services/Html';

export default function TableHeadersForm({
  t,
  settings,
  activeIssue, 
  handleIssueSave, 
  isDisabled, 
  handleActiveIssue,
}) {
  const radioOptions = [
    'col',
    'row',
    'both'
  ]
  const [selectedValue, setSelectedValue] = useState(null)
  const [cachedValue, setCachedValue] = useState(null)
  const [decorationOnly, setDecorationOnly] = useState(false)

  useEffect(() => {
    if(activeIssue) {
      setSelectedValue(getTableHeader())
      setCachedValue(null)
    }
  }, [activeIssue])

  useEffect(() => {
    handleHtmlUpdate()
  }, [selectedValue])

  const getTableHeader = () => {
    const html = Html.getIssueHtml(activeIssue)
    const table = Html.toElement(html)

    if(table.getAttribute('role') === 'presentation') {
      setDecorationOnly(true)
    } else {
      setDecorationOnly(false)
    }

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
    const html = Html.getIssueHtml(activeIssue)
    let table = Html.toElement(html)

    if(!table || !table.rows || table.rows.length === 0) {
      return Html.toString(table)
    }

    removeHeaders(table)

    if (decorationOnly) {
      Html.setAttribute(table, 'role', 'presentation')
      return Html.toString(table)
    }
    else {
      Html.removeAttribute(table, 'role')
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

  const handleHtmlUpdate = () => {
    let issue = activeIssue
    issue.newHtml = fixHeaders()
    handleActiveIssue(issue)
  }

  const handleChange = (newValue) => {
    setSelectedValue(newValue)
  }

  const handleDecoration = (checked) => {
    setDecorationOnly(checked)
    if(checked) {
      setCachedValue(selectedValue)
      setSelectedValue('')
    }
    else {
      setSelectedValue(cachedValue)
      setCachedValue(null)
    }
  }

  const handleSubmit = () => {
    let issue = activeIssue
    issue.newHtml = fixHeaders()
    handleIssueSave(issue)
  }

  return (
    <>
      <div className="instructions">{t('form.table_headers.selection_description')}</div>
      <div className="w-100 mt-2 flex-column gap-1">
        { radioOptions.map(value => (
          <div className="flex-row gap-1">
            <input
              type="radio" 
              id={value}
              name="tableHeaderSelect"
              value={selectedValue}
              tabIndex="0"
              disabled={isDisabled || decorationOnly}
              onChange={() => handleChange(value)} />
            <label htmlFor={value}>{t(`form.table_headers.${value}`)}</label>
          </div>
        ))}
      </div>
      <div className="separator mt-2">{t('fix.label.or')}</div>
      <div className="flex-row justify-content-start mt-2 gap-1">
        <input
          type="checkbox"
          id="decorationOnlyCheckbox"
          name="decorationOnlyCheckbox"
          tabIndex="0"
          checked={decorationOnly}
          disabled={isDisabled}
          onChange={(e) => handleDecoration(e.target.checked)} />
        <label className="instructions" htmlFor="decorationOnlyCheckbox">
          {t('form.table_headers.decoration_only')}
        </label>
      </div>
      <FormFeedback
        t={t}
        settings={settings}
        activeIssue={activeIssue}
        isDisabled={isDisabled || (!selectedValue && !decorationOnly)}
        handleSubmit={handleSubmit} />
    </>
  )
}