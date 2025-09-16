import React, { useState, useEffect } from 'react'
import SortIconFilled from './Icons/SortIconFilled'
import DownloadIcon from './Icons/DownloadIcon'

import './SortableTable.css'

export default function SortableTable({
  t,
  caption,
  headers,
  rows,
  tableSettings,
  handleTableSettings,
}) {

  const [rowsPerPage, setRowsPerPage] = useState((tableSettings.rowsPerPage) ? parseInt(tableSettings.rowsPerPage) : 10)
  const [start, setStart] = useState(tableSettings.pageNum * rowsPerPage)
  const [sortBy, setSortBy] = useState(tableSettings.sortBy)
  const [ascending, setAscending] = useState(tableSettings.ascending)
  const [direction, setDirection] = useState((tableSettings.ascending) ? 'ascending': 'descending')
  const [showPagination, setShowPagination] = useState(rows.length >= rowsPerPage)
  const [pagedRows, setPagedRows] = useState([])

  useEffect(() => {
    const tempRowsPerPage = (tableSettings.rowsPerPage) ? parseInt(tableSettings.rowsPerPage) : 10
    const tempShowPagination = rows.length >= tempRowsPerPage
    const start = tempShowPagination ? tableSettings.pageNum * tempRowsPerPage : 0
    setRowsPerPage(tempRowsPerPage)
    setShowPagination(tempShowPagination)
    setStart(start)
    setSortBy(tableSettings.sortBy)
    setAscending(tableSettings.ascending)
    setDirection((tableSettings.ascending) ? 'ascending': 'descending')
    setPagedRows(rows.slice(start, (start + tempRowsPerPage)))
  }
  , [tableSettings, rows])

  const exportToCSV = () => {

    const tempHeaders = headers.map(header => header.text);

    const csvData = [];
    csvData.push(tempHeaders.join(','));

    rows.forEach(row => {
      const rowData = headers.map(header => {
        const value = row[header.id];
        return `"${value}"`;
      });
      csvData.push(rowData.join(','));
    });

    const csvString = csvData.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${caption}.csv`;
    link.click();
  }

  const handleSort = (id) => {
    if (['status', 'action'].includes(id)) {
      return
    }

    if (id === sortBy) {
      handleTableSettings({ascending: !ascending})
    } else {
      handleTableSettings({
        ascending: false,
        sortBy: id
      })
    }
  }

  const setPage = (newPageNum) => {
    handleTableSettings({pageNum: newPageNum})
  }

  const renderPagination = () => {
    const pageCount = rowsPerPage && Math.ceil(rows.length / rowsPerPage)
    if(pageCount < 2) {
      return null
    }

    // We will ALWAYS display the first and last page, which may or may not have ellipses next to them.
    // This portion will display up to two pages on either side of the current page, but will NOT include
    // the first page (i = 0) or the last page (i = pageCount - 1) in the list.
    let firstPage = Math.max(1, tableSettings.pageNum - 2)
    let lastPage = Math.min(pageCount - 2, tableSettings.pageNum + 2)

    let pageNumsToDisplay = []
    for(let i = firstPage; i <= lastPage; i++) {
      pageNumsToDisplay.push(i)
    }

    const pages = pageNumsToDisplay.map((v, i) => <button
      className={`paginationButton${(v === tableSettings.pageNum) ? ' selected' : ''}`}
      key={`page${v}`}
      onClick={() => setPage(v)}
      current={v === tableSettings.pageNum}>
      {v + 1}
    </button>)

    //  
    return (
      <div className="mt-3 flex-row justify-content-center">
        <nav
          className="pagination flex-row justify-content-center gap-1"
        >
          { tableSettings.pageNum > 0 && (
            <button
              className="paginationButton"
              title={t('report.button.previous')}
              aria-label={t('report.button.previous')}
              onClick={() => setPage(tableSettings.pageNum - 1)}>
              &lt;
            </button>
          )}
          <button
            className={`paginationButton${(tableSettings.pageNum === 0) ? ' selected' : ''}`}
            onClick={() => setPage(0)}>
              1
          </button>
          { tableSettings.pageNum > 3 && (<span className="paginationSpacer">...</span>) }
          {pages}
          { tableSettings.pageNum < pageCount -4 && (<span className="paginationSpacer">...</span>) }
          <button
            className={`paginationButton${(tableSettings.pageNum === pageCount - 1) ? ' selected' : ''}`}
            onClick={() => setPage(pageCount - 1)}>
              {pageCount}
          </button>
          { tableSettings.pageNum < (pageCount - 1) && (
            <button
              className="paginationButton"
              title={t('report.button.next')}
              aria-label={t('report.button.next')}
              onClick={() => setPage(tableSettings.pageNum + 1)}>
              &gt;
            </button>
          )}
        </nav>
      </div>
    )
  }

  return (
    <div>
      <table className="udoit-sortable-table">
        {( caption && caption.length > 0 ) &&
          <caption className="mb-2">
            <div className="flex-row">
              <div className="flex-grow-1 flex-row justify-content-center">
                <h2 className="flex-column align-self-center primary-dark mt-0 mb-0">{caption}</h2>
              </div>
              <div className="flex-grow-0">
                <button className="btn-secondary btn-small btn-icon-left" onClick={()=>exportToCSV()}>
                  <DownloadIcon className="icon-md" />
                  {t('report.button.download')}
                </button>
              </div>
            </div>
          </caption>
        }
        <thead aria-label={t('report.label.sort_by')}>
          <tr>
            {(headers || []).map(({ id, text }) => (
              (text) ? 
                <th
                  key={`header${id}`}
                  id={id}
                  tabIndex="0"
                  onClick={() => handleSort(id)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter' || e.key === ' ') {
                      handleSort(id)
                    }
                  }}
                >
                  <div className="flex-row">
                    <div className="header-spacer" />
                    <div className="flex-grow-1 clickable-text">{text}</div>
                    { (id === sortBy) ? (
                      <div className="flex-column justify-content-center flex-shrink-0 ps-2">
                        <SortIconFilled className={`icon-md${(direction === 'ascending') ? ' rotate-180' : ''}`} />
                      </div>
                      ) : (
                        <div className="header-spacer" />
                      )
                    }
                  </div>
                  </th>
                  :
                <th key={`header${id}`} id={id} />
              ))}
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((row) => (
            <tr key={`row${row.id}`}>
              {headers.map(({ id, renderCell, alignText, format }) => (
                <td
                  key={`row${row.id}cell${id}`}
                  className={
                    (alignText === 'center'
                      ? 'text-center'
                      : alignText === 'end'
                      ? 'text-end'
                      : 'text-start') +
                    (id === "label" && row.onClick ? ' clickable' : '')
                  }
                  onClick={id === "label" && row.onClick ? row.onClick : undefined}
                  style={id === "label" && row.onClick ? { cursor: "pointer" } : undefined}
                >
                  {renderCell ? renderCell(row[id]) : (format) ? format(row[id]) : <div>{row[id]}</div>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  )
}