import React, { useState, useEffect } from 'react';
import SearchIcon from './Icons/SearchIcon';

import './FixIssuesFilters.css'

export default function FixIssuesFilters({ t, settings, sections, activeFilters, updateActiveFilters, searchTerm, handleSearchTerm }) {

  const FILTER = settings.FILTER

  const allFilters = {
    [FILTER.TYPE.SEVERITY]: {
      [FILTER.ALL]: t('label.filter.severity.all'),
      [FILTER.ISSUE]: t('label.filter.severity.issue'),
      [FILTER.POTENTIAL]: t('label.filter.severity.potential'),
      [FILTER.SUGGESTION]: t('label.filter.severity.suggestion'),
    },
    [FILTER.TYPE.CONTENT_TYPE]: {
      [FILTER.ALL]: t('label.filter.type.all'),
      [FILTER.PAGE]: t('label.filter.type.page'),
      [FILTER.ASSIGNMENT]: t('label.filter.type.assignment'),
      [FILTER.ANNOUNCEMENT]: t('label.filter.type.announcement'),
      [FILTER.DISCUSSION_TOPIC]: t('label.filter.type.discussion_topic'),
      [FILTER.DISCUSSION_FORUM]: t('label.filter.type.discussion_forum'),
      [FILTER.FILE]: t('label.filter.type.file'),
      [FILTER.QUIZ]: t('label.filter.type.quiz'),
      [FILTER.SYLLABUS]: t('label.filter.type.syllabus'),
      [FILTER.MODULE]: t('label.filter.type.module'),
    },
    [FILTER.TYPE.RESOLUTION]: {
      [FILTER.ALL]: t('label.filter.resolution.all'),
      [FILTER.ACTIVE]: t('label.filter.resolution.active'),
      [FILTER.FIXED]: t('label.filter.resolution.fixed'),
      [FILTER.RESOLVED]: t('label.filter.resolution.resolved'),
    },
    [FILTER.TYPE.MODULE]: {
      [FILTER.ALL]: t('label.filter.module.all'),
    },
  }

  const [usedFilters, setUsedFilters] = useState([])

  // When the page loads, only show the "Modules" filter is there are modules to filter by...
  useEffect(() => {
    let tempFilters = Object.assign({}, allFilters)
    if(sections && sections.length > 0) {
      // ... and add each module to the "Modules" filter
      sections.forEach((section) => {
        tempFilters[FILTER.TYPE.MODULE][section.id] = section.title
      })
    }
    else {
      delete tempFilters[FILTER.TYPE.MODULE]
    }
    setUsedFilters(tempFilters)
  })  

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
        {Object.keys(usedFilters).map((filterType) => {
          return (
            <div className="filter-group">
              {/* <label>{filterType}</label> */}
              <select
                aria-label={filterType}
                onChange={(e) => updateActiveFilters(filterType, e.target.value)}
              >
                {Object.keys(usedFilters[filterType]).map((filter) => {
                  return (
                    <option value={filter} selected={activeFilters[filterType] === filter}>
                      {usedFilters[filterType][filter]}
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