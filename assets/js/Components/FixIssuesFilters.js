import React, { useState, useEffect } from 'react';
import SearchIcon from './Icons/SearchIcon';

import './FixIssuesFilters.css'

export default function FixIssuesFilters({ allFilters, activeFilters, updateActiveFilters, searchTerm, handleSearchTerm }) {

  // TODO: Icons on the Content Type dropdown
  // TODO: Cool-looking, yet fully accessible dropdown. Maybe like https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/

  return (
    <div className="filter-container mt-2 mb-2">
      <div className="flex-row flex-wrap gap-1">
        <div className="search-group">
          <input
            value={searchTerm}
            type="text"
            placeholder="Search"
            onChange={(e) => handleSearchTerm(e.target.value)}
          />
          <SearchIcon className="search-icon icon-sm" />
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