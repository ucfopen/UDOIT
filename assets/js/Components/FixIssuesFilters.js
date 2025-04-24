import React, { useState, useEffect } from 'react'
import SearchIcon from './Icons/SearchIcon'
import ContentTypeIcon from './Icons/ContentTypeIcon'

import './FixIssuesFilters.css'

export default function FixIssuesFilters({ t, settings, sections, activeFilters, updateActiveFilters, searchTerm, handleSearchTerm }) {

  const FILTER = settings.FILTER

  const allFilters = {
    [FILTER.TYPE.SEVERITY]: {
      [FILTER.ALL]: t('filter.label.severity.all'),
      [FILTER.ISSUE]: t('filter.label.severity.issue'),
      [FILTER.POTENTIAL]: t('filter.label.severity.potential'),
      [FILTER.SUGGESTION]: t('filter.label.severity.suggestion'),
    },
    [FILTER.TYPE.CONTENT_TYPE]: {
      [FILTER.ALL]: t('filter.label.type.all'),
      [FILTER.PAGE]: t('filter.label.type.page'),
      [FILTER.ASSIGNMENT]: t('filter.label.type.assignment'),
      [FILTER.ANNOUNCEMENT]: t('filter.label.type.announcement'),
      [FILTER.DISCUSSION_TOPIC]: t('filter.label.type.discussion_topic'),
      [FILTER.DISCUSSION_FORUM]: t('filter.label.type.discussion_forum'),
      [FILTER.FILE]: t('filter.label.type.file'),
      [FILTER.QUIZ]: t('filter.label.type.quiz'),
      [FILTER.SYLLABUS]: t('filter.label.type.syllabus'),
      // [FILTER.MODULE]: t('filter.label.type.module'),
    },
    [FILTER.TYPE.RESOLUTION]: {
      [FILTER.ALL]: t('filter.label.resolution.all'),
      [FILTER.ACTIVE]: t('filter.label.resolution.active'),
      [FILTER.FIXED]: t('filter.label.resolution.fixed'),
      [FILTER.RESOLVED]: t('filter.label.resolution.resolved'),
    },
    [FILTER.TYPE.MODULE]: {
      [FILTER.ALL]: t('filter.label.module.all'),
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
    <div className="filter-container mb-3">
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
                      {filterType === FILTER.TYPE.CONTENT_TYPE && (
                        <ContentTypeIcon type={filter} alt="" className="icon-sm text-color" />
                      )}
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