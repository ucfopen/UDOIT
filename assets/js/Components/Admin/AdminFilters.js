import React, { useState, useEffect } from 'react'
import SearchIcon from '../Icons/SearchIcon'

import '../FixIssuesFilters.css'

export default function AdminFilters({
  t,
  settings,
  filters,
  handleFilter,
  loadingContent,
  searchTerm,
  handleSearchTerm
}) {
  
  const [accountOptions, setAccountOptions] = useState([])
  const [termOptions, setTermOptions] = useState([])
  
  // When the "settings" are loaded, create the Account and Term dropdown options
  useEffect(() => {
    let tempAccountOptions = []
    for (const acct of Object.values(settings.accounts)) {
      tempAccountOptions.push({
        id: acct.id,
        name: acct.name
      })
    }
    setAccountOptions(tempAccountOptions)

    let tempTermOptions = []
    for (const [key, val] of Object.entries(settings.terms)) {
      tempTermOptions.push({
        id: key,
        name: val,
      })
    }
    setTermOptions(tempTermOptions)
  }, [settings])

  const handleAccountSelect = (newValue) => {
    handleFilter({ accountId: newValue })
  }

  const handleTermSelect = (newValue) => {
    handleFilter({ termId: newValue })
  }

  const handleIncludeSubaccount = (e) => {
    handleFilter({ includeSubaccounts: e.target.checked })
  }

  return (
    <div className="filter-container mb-2">
      <div className="flex-row flex-wrap gap-1">
        <div className="search-group">
          <input
            value={searchTerm}
            type="text"
            placeholder={t('filter.label.search')}
            onChange={(e) => handleSearchTerm(e.target.value)}
          />
          <SearchIcon className="search-icon icon-sm" />
        </div>
        <div className="flex-row me-3">
          <div className="flex-column justify-content-center">
            <label for="inputAccount" className="me-2">{t('filter.label.account')}</label>
          </div>
          <div className="filter-group">
            <select
              id="inputAccount"
              disabled={loadingContent}
              onChange={(e) => handleAccountSelect(e.target.value)}
            >
              {accountOptions.map((acct, i) => {
                return (
                  <option
                    key={`acct-${i}`}
                    value={acct.id}
                    selected={filters.accountId.toString() === acct.id.toString()}
                    >
                    {acct.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <div className="flex-row me-3">
          <div className="flex-column justify-content-center">
            <label for="inputTerm" className="me-2">{t('filter.label.term')}</label>
          </div>
          <div className="filter-group">
            <select
              id="inputTerm"
              disabled={loadingContent}
              onChange={(e) => handleTermSelect(e.target.value)}
            >
              {termOptions.map((term, i) => {
                return (
                  <option
                    key={`term-${i}`}
                    value={term.id}
                    selected={filters.termId.toString() === term.id.toString()}
                    >
                    {term.name}
                  </option>
                )
              })}
            </select>
          </div>
        </div>
        <div className="flex-row">
          <div className="filter-group">
            <input
              id="inputSubaccounts"
              type="checkbox"
              value="on"
              disabled={loadingContent}
              checked={filters.includeSubaccounts}
              onChange={handleIncludeSubaccount}
            />
          </div>
          <div className="flex-column justify-content-center">
            <label className="ms-2" for="inputSubaccounts">{t('filter.label.include_subaccounts')}</label>
          </div>
        </div>
      </div>
    </div>
  )
}