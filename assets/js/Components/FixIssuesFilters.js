import React, { useState, useEffect } from 'react';
import './FixissuesPage.css'

export default function FixIssuesFilters({ allFilters, activeFilters, updateActiveFilters, searchTerm, handleSearchTerm }) {

  // TODO: Icons on the Content Type dropdown
  // TODO: Cool-looking, yet fully accessible dropdown. Maybe like https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/

  return (
    <div className="filter-container">
      <div className="flex-row gap-1">
        <div className="search-group">
          <label>Search</label>
          <input
            value={searchTerm}
            type="text"
            placeholder="Search"
            onChange={(e) => handleSearchTerm(e.target.value)}
          />
        </div>
        {Object.keys(allFilters).map((filterType) => {
          return (
            <div className="filter-group">
              {/* <label>{filterType}</label> */}
              <select
                aria-label={filterType}
                onChange={(e) => updateActiveFilters(filterType, e.target.value)}
              >
                {Object.keys(allFilters[filterType]).map((filter) => {
                  return (
                    <option value={filter} selected={activeFilters[filterType] === filter}>
                      {allFilters[filterType][filter]}
                    </option>
                  )
                })}
              </select>
            </div>
          )
        })}
      </div>
    </div>
  )
}