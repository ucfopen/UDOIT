import React, { useState, useEffect } from 'react'
import SearchIcon from '../Icons/SearchIcon'
import CloseIcon from '../Icons/CloseIcon'
import ContentTypeIcon from '../Icons/ContentTypeIcon'
import FilterOnIcon from '../Icons/FilterOnIcon'
import FilterOffIcon from '../Icons/FilterOffIcon'
import Combobox from './Combobox'

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

  const FILTER = settings.FILTER

  const filterLabels = {
    [FILTER.TYPE.UTILIZATION]: t('filter.label.utilization'),
    // [FILTER.TYPE.PUBLISHED]: t('filter.label.published'),
    [FILTER.TYPE.FILE_TYPE]: t('filter.label.file_type'),
    [FILTER.TYPE.RESOLUTION]: t('filter.label.resolution'),
    [FILTER.TYPE.MODULE]: t('filter.label.module'),
  }

  const allFilters = {
    [FILTER.TYPE.UTILIZATION]: {
      [FILTER.ALL]: t('filter.label.utilization.all'),
      [FILTER.USED]: t('filter.label.utilization.referenced'),
      [FILTER.UNUSED]: t('filter.label.utilization.unreferenced'),
    },
    [FILTER.TYPE.FILE_TYPE]: {
      [FILTER.ALL]: t('filter.label.file_type.all'),
      [FILTER.FILE_PDF]: t('label.mime.pdf'),
      [FILTER.FILE_WORD]: t('label.mime.doc'),
      [FILTER.FILE_POWERPOINT]: t('label.mime.ppt'),
      [FILTER.FILE_EXCEL]: t('label.mime.xls'),
      [FILTER.FILE_VIDEO]: t('label.mime.video'),
      [FILTER.FILE_AUDIO]: t('label.mime.audio'),
    },
    [FILTER.TYPE.RESOLUTION]: {
      [FILTER.ALL]: t('filter.label.review.all'),
      [FILTER.UNREVIEWED]: t('filter.label.review.unreviewed'),
      [FILTER.REVIEWED]: t('filter.label.review.reviewed'),
    },
    [FILTER.TYPE.MODULE]: {
      [FILTER.ALL]: t('filter.label.module.all'),
    },
  }

  const [usedFilters, setUsedFilters] = useState(null)
  const [detailedFilters, setDetailedFilters] = useState(null)
  // For new users, the 'show_filters' attribute may not be set, so we need to check if it exists before using it
  const [showFilters, setShowFilters] = useState(settings?.user?.roles && ('show_filters' in settings.user.roles) ? settings.user.roles.show_filters : true)

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

  const removeFilter = (filterType) => {
    updateActiveFilters(filterType, FILTER.ALL)
  }

  // TODO: Icons on the Content Type dropdown
  // TODO: Cool-looking, yet fully accessible dropdown. Maybe like https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/

  return (
    <div className="filter-container flex-column gap-1">
      <div className="flex-row justify-content-between">
        <div className="flex-column flex-shrink-0 justify-content-center">
          {/* <label htmlFor='search-bar'>{t('filter.label.search')}</label> */}
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
        <div className="flex-column flex-grow-1 justify-content-center">
          <div className="flex-row flex-wrap gap-1">
            { usedFilters !== null ? Object.keys(activeFilters).map((filterType) => {
              if(activeFilters[filterType] !== FILTER.ALL) {
                return (
                  <button
                    className="filter-pill flex-row gap-1"
                    key={filterType}
                    aria-label={t('filter.label.remove_filter', { filterName: usedFilters[filterType][activeFilters[filterType]] })}
                    title={t('filter.label.remove_filter', { filterName: usedFilters[filterType][activeFilters[filterType]] })}
                    onClick={() => removeFilter(filterType)}
                    id={'pill-' + filterType + '-' + activeFilters[filterType]}>
                    <div className="filter-pill-text flex-column align-self-center white">
                      {usedFilters[filterType][activeFilters[filterType]]}
                    </div>
                    <div className="filter-pill-remove flex-column align-self-center">
                      <CloseIcon className="icon-sm" />
                    </div>
                  </button>
                )
              }
            }) : null }
          </div>
        </div>
        <div className="flex-column flex-shrink-0 ms-3 justify-content-center">
          <button
            className="btn-small btn-secondary btn-icon-left"
            tabIndex="0"
            onClick={() => setShowFilters(!showFilters)}
          >
            { showFilters ? (
              <>
                <FilterOffIcon className="icon-sm" />
                {t('filter.label.hide_filters')}
              </> ) : (
              <>
                <FilterOnIcon className="icon-sm" />
                {t('filter.label.show_filters')}
              </>
            )}
          </button>
        </div>
      </div>
      {showFilters && usedFilters && (
        <div className="flex-row flex-wrap gap-1">
          {Object.keys(detailedFilters).map((filterType, index) => {
            return (
              <div className="filter-group flex-column justify-content-center" key={index}>
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