import React, { useState, useEffect } from 'react'
import SearchIcon from '../Icons/SearchIcon'
import Combobox from '../Widgets/Combobox'
import ToggleSwitch from './ToggleSwitch'

import './FixIssuesFilters.css'

export default function FixIssuesFilters({
  t,
  settings,
  
  activeFilters,
  handleSearchTerm,
  searchTerm,
  sections,
  updateActiveFilters
 }) {

  const FILTER = settings.ISSUE_FILTER

  const filterLabels = {
    [FILTER.TYPE.SEVERITY]: t('filter.label.severity'),
    [FILTER.TYPE.PUBLISHED]: t('filter.label.published'),
    [FILTER.TYPE.CONTENT_TYPE]: t('filter.label.type'),
    [FILTER.TYPE.RESOLUTION]: t('filter.label.resolution'),
    [FILTER.TYPE.MODULE]: t('filter.label.module'),
  }

  const allFilters = {
    [FILTER.TYPE.SEVERITY]: {
      [FILTER.ALL]: t('filter.label.severity.all'),
      [FILTER.ISSUE]: t('filter.label.severity.issue'),
      [FILTER.POTENTIAL]: t('filter.label.severity.potential')
    },
    [FILTER.TYPE.CONTENT_TYPE]: {
      [FILTER.ALL]: t('filter.label.type.all'),
      [FILTER.PAGE]: t('filter.label.type.page'),
      [FILTER.ASSIGNMENT]: t('filter.label.type.assignment'),
      [FILTER.ANNOUNCEMENT]: t('filter.label.type.announcement'),
      [FILTER.DISCUSSION_TOPIC]: t('filter.label.type.discussion_topic'),
      [FILTER.DISCUSSION_FORUM]: t('filter.label.type.discussion_forum'),
      [FILTER.QUIZ]: t('filter.label.type.quiz'),
      [FILTER.SYLLABUS]: t('filter.label.type.syllabus'),
    },
    [FILTER.TYPE.MODULE]: {
      [FILTER.ALL]: t('filter.label.module.all'),
    },
  }

  const [usedFilters, setUsedFilters] = useState(null)
  const [detailedFilters, setDetailedFilters] = useState(null)
  // For new users, the 'show_filters' attribute may not be set, so we need to check if it exists before using it
  const [showFilters, setShowFilters] = useState(settings?.user?.roles && ('show_filters' in settings.user.roles) ? settings.user.roles.show_filters : settings.DEFAULT_USER_SETTINGS.SHOW_FILTERS)

  // When the page loads, only show the "Modules" filter is there are modules to filter by...
  useEffect(() => {
    let tempFilters = Object.assign({}, allFilters)
    if(sections && sections.length > 0) {
      // ... and add each module to the "Modules" filter
      sections.forEach((section) => {
        tempFilters[FILTER.TYPE.MODULE]["section-" + section.id] = section.title
      })
    }
    else {
      delete tempFilters[FILTER.TYPE.MODULE]
    }

    let tempDetailedFilters = []
    Object.keys(tempFilters).forEach((filterType) => {
      let filterOptions = []
      Object.keys(tempFilters[filterType]).forEach((filter) => {
        filterOptions.push({
          value: filter,
          name: tempFilters[filterType][filter],
          icon: filter,
          selected: activeFilters[filterType] === filter
        })
      })
      tempDetailedFilters.push({
        label: filterLabels[filterType],
        value: filterType,
        options: filterOptions
      })
    })

    setDetailedFilters(tempDetailedFilters)
    setUsedFilters(tempFilters)
  }, [activeFilters])

  const updateResolvedIssuesToggle = (newValue) => {
    if(newValue === false) {
      updateActiveFilters(FILTER.TYPE.RESOLUTION, FILTER.ACTIVE)
    }
    else {
      updateActiveFilters(FILTER.TYPE.RESOLUTION, FILTER.ALL)
    }
  }

  const updateUnpublishedToggle = (newValue) => {
    if(newValue === false) {
      updateActiveFilters(FILTER.TYPE.PUBLISHED, FILTER.PUBLISHED)
    }
    else {
      updateActiveFilters(FILTER.TYPE.PUBLISHED, FILTER.ALL)
    }
  }

  return (
    <div className="filter-container flex-row justify-content-between gap-3">
      <div className="flex-row flex-wrap gap-1">
        <div className="flex-column flex-shrink-0 justify-content-center pe-2">
          <div className="search-group">
            <input
              id="search-bar"
              name="search-bar"
              tabIndex="0"
              aria-label={t('filter.label.search')}
              value={searchTerm}
              type="text"
              placeholder={t('filter.label.search')}
              onChange={(e) => handleSearchTerm(e.target.value)}
            />
            <SearchIcon className="search-icon icon-sm" />
          </div>
        </div>

        <div className="flex-row gap-1 pe-2">
          <ToggleSwitch
            labelId={"unpublished"}
            initialValue={activeFilters[FILTER.TYPE.PUBLISHED] === FILTER.ALL}
            updateToggle={updateUnpublishedToggle}
          />
          <div
            id="unpublished"
            className="align-self-center subtext">
              {t('filter.label.toggle.show_unpublished')}
          </div>
        </div>

        <div className="flex-row gap-1 pe-2">
          <ToggleSwitch
            labelId={"resolvedIssues"}
            initialValue={activeFilters[FILTER.TYPE.RESOLUTION] === FILTER.ALL}
            updateToggle={updateResolvedIssuesToggle}
          />
          <div
            id="resolvedIssues"
            className="align-self-center subtext">
              {t('filter.label.toggle.show_resolved')}
          </div>
        </div>

      </div>

      {usedFilters && (
        <div className="flex-row flex-wrap flex-end gap-1">
          {Object.keys(detailedFilters).map((filterType, index) => {
            return (
              <div className="filter-group flex-column justify-content-center ps-2" key={index}>
                <Combobox
                  handleChange={updateActiveFilters}
                  id={detailedFilters[index].value}
                  label={detailedFilters[index].label}
                  options={detailedFilters[index].options}
                  settings={settings}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}