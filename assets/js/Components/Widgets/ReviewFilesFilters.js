import React, { useState, useEffect } from 'react'
import SearchIcon from '../Icons/SearchIcon'
import Combobox from './Combobox'
import ToggleSwitch from './ToggleSwitch'

import './FixIssuesFilters.css'

export default function ReviewFilesFilters({
  t,
  settings,
  
  activeFilters,
  handleSearchTerm,
  searchTerm,
  sections,
  updateActiveFilters
 }) {

  const FILTER = settings.FILE_FILTER

  const filterLabels = {
    [FILTER.TYPE.UTILIZATION]: t('filter.label.utilization'),
    [FILTER.TYPE.FILE_TYPE]: t('filter.label.file_type'),
    [FILTER.TYPE.RESOLUTION]: t('filter.label.resolution'),
    [FILTER.TYPE.MODULE]: t('filter.label.module'),
  }

  const allFilters = {
    [FILTER.TYPE.FILE_TYPE]: {
      [FILTER.ALL]: t('filter.label.file_type.all'),
      [FILTER.FILE_PDF]: t('label.mime.pdf'),
      [FILTER.FILE_WORD]: t('label.mime.doc'),
      [FILTER.FILE_POWERPOINT]: t('label.mime.ppt'),
      [FILTER.FILE_EXCEL]: t('label.mime.xls'),
      [FILTER.FILE_AUDIO]: t('label.mime.audio'),
      [FILTER.FILE_VIDEO]: t('label.mime.video'),
    },
    [FILTER.TYPE.MODULE]: {
      [FILTER.ALL]: t('filter.label.review.all'),
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

  const updateCompleteFilesToggle = (newValue) => {
    if(newValue === false) {
      updateActiveFilters(FILTER.TYPE.RESOLUTION, FILTER.UNREVIEWED)
    }
    else {
      updateActiveFilters(FILTER.TYPE.RESOLUTION, FILTER.ALL)
    }
  }

  const updateUnusedFilesToggle = (newValue) => {
    if(newValue === false) {
      updateActiveFilters(FILTER.TYPE.UTILIZATION, FILTER.USED)
    }
    else {
      updateActiveFilters(FILTER.TYPE.UTILIZATION, FILTER.ALL)
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
              role="searchbox"
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
            labelId={"unusedFiles"}
            initialValue={activeFilters[FILTER.TYPE.UTILIZATION] === FILTER.ALL}
            updateToggle={updateUnusedFilesToggle}
          />
          <div
            id="unusedFiles"
            className="align-self-center subtext">
              {t('filter.label.toggle.show_unused')}
          </div>
        </div>

        <div className="flex-row gap-1 pe-2">
          <ToggleSwitch
            labelId={"completeFiles"}
            initialValue={activeFilters[FILTER.TYPE.RESOLUTION] === FILTER.ALL}
            updateToggle={updateCompleteFilesToggle}
          />
          <div
            id="completeFiles"
            className="align-self-center subtext">
              {t('filter.label.toggle.show_reviewed')}
          </div>
        </div>

      </div>
      
      { usedFilters && (
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