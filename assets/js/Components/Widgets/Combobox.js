import React, { useState, useEffect } from 'react'
import ContentAnnouncementIcon from '../Icons/ContentAnnouncementIcon'
import ContentAssignmentIcon from '../Icons/ContentAssignmentIcon'
import ContentDiscussionForumIcon from '../Icons/ContentDiscussionForumIcon'
import ContentDiscussionTopicIcon from '../Icons/ContentDiscussionTopicIcon'
import ContentFileIcon from '../Icons/ContentFileIcon'
import ContentPageIcon from '../Icons/ContentPageIcon'
import ContentQuizIcon from '../Icons/ContentQuizIcon'
import ContentSyllabusIcon from '../Icons/ContentSyllabusIcon'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import SeverityPotentialIcon from '../Icons/SeverityPotentialIcon'
import SeveritySuggestionIcon from '../Icons/SeveritySuggestionIcon'
import FixedIcon from '../Icons/FixedIcon'
import ResolvedIcon from '../Icons/ResolvedIcon'
import SortIcon from '../Icons/SortIcon'
import './Combobox.css'


/*   This component is adapted from: 
 *   https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/
 *
 *   This content is licensed according to the W3C Software License at:
 *   https://www.w3.org/copyright/software-license-2023/
 */

export default function Combobox({
  isDisabled = false,
  handleChange,
  id = '',
  label = '',
  options = [],
  settings,
}) {

  /* Ideally, the options array contains objects in the form of:
   * {
   *   value: 'value',
   *   name: 'name',
   *   (optional) icon: 'icon',  (default '')
   *   (optional) selected: true,  (default false)
   * }
   */

  const selectActions = {
    Close: 0,
    CloseSelect: 1,
    First: 2,
    Last: 3,
    Next: 4,
    Open: 5,
    PageDown: 6,
    PageUp: 7,
    Previous: 8,
    Select: 9,
    Type: 10,
  }

  const [activeIndex, setActiveIndex] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [localOptions, setLocalOptions] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [searchTimeout, setSearchTimeout] = useState(null)

  useEffect(() => {
    let tempSelectedIndex = 0
    // Initialize the local options from the provided options
    const initialOptions = options.map((option, index) => ({
      ...option,
      icon: option.icon || '',
      selected: option.selected && (tempSelectedIndex = index) || false,
      id: `combo-${id}-option-${index}`
    }))
    setLocalOptions(initialOptions)

    if (initialOptions.length > 0) {
      setActiveIndex(tempSelectedIndex)
      setSelectedIndex(tempSelectedIndex)
    }
  }, [options])

  const getIconComponent = (iconString) => {

    let size = 'icon-md'

    switch(iconString?.toUpperCase()) {
      case settings.ISSUE_FILTER.ISSUE:
        return <SeverityIssueIcon className={`${size} color-issue`} />
      case settings.ISSUE_FILTER.POTENTIAL:
      case settings.ISSUE_FILTER.UNREVIEWED:
        return <SeverityPotentialIcon className={`${size} color-potential`} />
      case settings.ISSUE_FILTER.SUGGESTION:
        return <SeveritySuggestionIcon className={`${size} color-suggestion`} />
      case settings.ISSUE_FILTER.ANNOUNCEMENT:
        return <ContentAnnouncementIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.ASSIGNMENT:
        return <ContentAssignmentIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.DISCUSSION_FORUM:
        return <ContentDiscussionForumIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.DISCUSSION_TOPIC:
        return <ContentDiscussionTopicIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.FILE:
        return <ContentFileIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.PAGE:
        return <ContentPageIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.QUIZ:
        return <ContentQuizIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.SYLLABUS:
        return <ContentSyllabusIcon className={`${size} gray`} />
      case settings.ISSUE_FILTER.FIXED:
      case settings.ISSUE_FILTER.FIXEDANDRESOLVED:
        return <FixedIcon className={`${size} color-success`} />
      case settings.ISSUE_FILTER.RESOLVED:
      case settings.ISSUE_FILTER.REVIEWED:
        return <ResolvedIcon className={`${size} color-success`} />
      default:
        return ''
    }
  }

  const getNameWithIcon = (option) => {
    if(!option) {
      return ''
    }
    let iconComponent = null
    if(option.icon != '') {
      iconComponent = getIconComponent(option.icon)
    }
    return (
      <div className="flex-row">
        { iconComponent ? (
          <div className="flex-column align-self-center pe-2">
            {iconComponent}
          </div>
        ) : '' }
        <div className="flex-column align-self-center">
          {option.name}
        </div>
      </div>
    )
  }

  // Filter an array of options against an input string
  // Returns an array of options that begin with the filter string, case-independent
  const filterOptions = (optionNames, filter) => {
    return optionNames.filter((option) => {
      const matches = option.toLowerCase().indexOf(filter.toLowerCase()) === 0
      return matches
    })
  }

  // Map a key press to an action
  const getActionFromKey = (event) =>{
    const { key, altKey, ctrlKey, metaKey } = event
    const openKeys = ['ArrowDown', 'ArrowUp', 'Enter', ' '] // All keys that will do the default open action
    // Handle opening when closed
    if (!menuOpen && openKeys.includes(key)) {
      return selectActions.Open
    }

    // Home and End move the selected option when open or closed
    if (key === 'Home') {
      return selectActions.First
    }
    if (key === 'End') {
      return selectActions.Last
    }

    // Handle typing characters when open or closed
    if (
      key === 'Backspace' ||
      key === 'Clear' ||
      (key.length === 1 && key !== ' ' && !altKey && !ctrlKey && !metaKey)
    ) {
      return selectActions.Type
    }

    // Handle keys when open
    if (menuOpen) {
      if (key === 'ArrowUp' && altKey) {
        return selectActions.CloseSelect
      } else if (key === 'ArrowDown' && !altKey) {
        return selectActions.Next
      } else if (key === 'ArrowUp') {
        return selectActions.Previous
      } else if (key === 'PageUp') {
        return selectActions.PageUp
      } else if (key === 'PageDown') {
        return selectActions.PageDown
      } else if (key === 'Escape') {
        return selectActions.Close
      } else if (key === 'Enter' || key === ' ') {
        return selectActions.CloseSelect
      }
    }
  }

  const getIndexByName = (name) => {
    // Find the index of the first option that matches the name
    return localOptions.findIndex((option) => option.name.toLowerCase() === name.toLowerCase())
  }

  // return the index of an option from an array of options, based on a search string
  // if the filter is multiple iterations of the same letter (e.g "aaa"), then cycle through first-letter matches
  const getIndexByLetter = (filter, startIndex = 0) => {
    const offsetOptions = [
      ...localOptions.slice(startIndex),
      ...localOptions.slice(0, startIndex),
    ]
    const orderedOptionNames = offsetOptions.map((option) => option.name)
    const firstMatch = filterOptions(orderedOptionNames, filter)[0]
    const allSameLetter = (array) => array.every((letter) => letter === array[0])

    // first check if there is an exact match for the typed string
    if (firstMatch) {
      return localOptions.findIndex((option) => option.name.toLowerCase() === firstMatch.toLowerCase())
    }

    // if the same letter is being repeated, cycle through first-letter matches
    else if (allSameLetter(filter.split(''))) {
      const matches = filterOptions(orderedOptionNames, filter[0])
      if(matches.length > 0) {
        return localOptions.findIndex((option) => option.name.toLowerCase() === matches[0].toLowerCase())
      }
    }

    return -1
  }

  // Get an updated option index after performing an action
  const getUpdatedIndex = (action) => {
    const maxIndex = localOptions.length - 1
    const pageSize = 10

    switch (action) {
      case selectActions.First:
        return 0
      case selectActions.Last:
        return maxIndex
      case selectActions.Previous:
        return Math.max(0, activeIndex - 1)
      case selectActions.Next:
        return Math.min(maxIndex, activeIndex + 1)
      case selectActions.PageUp:
        return Math.max(0, activeIndex - pageSize)
      case selectActions.PageDown:
        return Math.min(maxIndex, activeIndex + pageSize)
      default:
        return activeIndex
    }
  }

  // check if element is visible in browser view port
  function isElementInView(element) {
    var bounding = element.getBoundingClientRect()

    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  // check if an element is currently scrollable
  function isScrollable(element) {
    return element && element.clientHeight < element.scrollHeight
  }

  // ensure a given child element is within the parent's visible scroll area
  // if the child is not visible, scroll the parent
  function maintainScrollVisibility(activeElement, scrollParent) {
    const { offsetHeight, offsetTop } = activeElement
    const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent

    const isAbove = offsetTop < scrollTop
    const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight

    if (isAbove) {
      scrollParent.scrollTo(0, offsetTop)
    } else if (isBelow) {
      scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight)
    }
  }
  const getSearchString = (char) => {
    // reset typing timeout and start new timeout
    // this allows us to make multiple-letter matches, like a native select
    if (typeof searchTimeout === 'number') {
      window.clearTimeout(searchTimeout)
    }

    setSearchTimeout(window.setTimeout(() => {
      setSearchString('')
    }, 500))

    // add most recent letter to saved search string
    let newSearchString = searchString + char
    setSearchString(newSearchString)
    return newSearchString
  }

  const onLabelClick = () => {
    
    let comboEl = document.getElementById('combo-' + id)
    if(!comboEl) {
      return
    }
    
    comboEl.focus()
  }

  const onComboBlur = (event) =>{
    if(isDisabled) {
      updateMenuState(false, false)
      return
    }
    
    let listboxEl = document.getElementById('combo-listbox-' + id)
    if(!listboxEl || listboxEl.contains(event.relatedTarget)) {
      return
    }

    // Select current option and close
    if (menuOpen) {
      selectOption(activeIndex)
      updateMenuState(false, false)
    }
  }

  const onComboClick = () => {
    if(isDisabled) {
      return
    }
    updateMenuState(!menuOpen, false)
  }

  const onComboKeyDown = (event) => {
    if(isDisabled) {
      return
    }
    const action = getActionFromKey(event)

    switch (action) {
      case selectActions.Last:
      case selectActions.First:
        updateMenuState(true)
      // intentional fallthrough
      case selectActions.Next:
      case selectActions.Previous:
      case selectActions.PageUp:
      case selectActions.PageDown:
        event.preventDefault()
        return onOptionChange(
          getUpdatedIndex(action)
        )
      case selectActions.CloseSelect:
        event.preventDefault()
        selectOption(activeIndex)
      // intentional fallthrough
      case selectActions.Close:
        event.preventDefault()
        return updateMenuState(false)
      case selectActions.Type:
        return onComboType(event.key)
      case selectActions.Open:
        event.preventDefault()
        return updateMenuState(true)
      }
  }

  const onComboType = (letter) => {
    // Open the listbox if it is closed
    updateMenuState(true)

    // find the index of the first matching option
    const searchString = getSearchString(letter)
    const searchIndex = getIndexByLetter(
      searchString,
      activeIndex + 1
    )

    // if a match was found, go to it
    if (searchIndex >= 0) {
      onOptionChange(searchIndex)
    }
    // if no matches, clear the timeout and search string
    else {
      window.clearTimeout(searchTimeout)
      setSearchString('')
    }
  }

  const onOptionChange = (index) => {
    setActiveIndex(index)
    let optionEl = document.getElementById('combo-' + id + '-option-' + index)
    let listboxEl = document.getElementById('combo-listbox-' + id)

    if(!optionEl || !listboxEl) {
      return
    }

    // Ensure the new option is in view
    if (isScrollable(listboxEl)) {
      maintainScrollVisibility(optionEl, listboxEl)
    }

    // ensure the new option is visible on screen
    // ensure the new option is in view
    if (!isElementInView(optionEl)) {
      optionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  const onOptionClick = (index) => {
    onOptionChange(index)
    selectOption(index)
    updateMenuState(false)
  }

  const selectOption = (index) => {
    setActiveIndex(index)
    setSelectedIndex(index)
    let selectedOption = localOptions[index]
    if (!selectedOption) {
      return
    }
    // Call the change handler with the selected option
    handleChange(id, selectedOption.value)
  }

  const updateMenuState = (open, callFocus = true) => {
    if (menuOpen === open) {
      return
    }

    // update state
    setMenuOpen(open)

    let comboEl = document.getElementById('combo-' + id)
    if(!comboEl) {
      return
    }

    if (!open && !isElementInView(comboEl)) {
      comboEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    // move focus back to the combobox, if needed
    callFocus && comboEl.focus()
  }

  return (
    <div
      id={'combo-container-' + id}
      className="combo-container">
      <div        // labelEl
        id={'combo-label-' + id}
        className="combo-label"
        onClick={() => onLabelClick()}>
          {label}
      </div>
      <div className="combo-interactive-container flex-column">
        <div        // 'comboEl'
          id={'combo-' + id}
          aria-labelledby={'combo-label-' + id}
          aria-controls={'combo-listbox-' + id}
          aria-expanded={menuOpen ? "true" : "false"}
          aria-haspopup="listbox"
          aria-activedescendant={'combo-' + id + '-option-' + activeIndex}
          className={`combo-input flex-row justify-content-between` + (isDisabled ? ' disabled' : '')}
          role="combobox"
          tabIndex={isDisabled ? "-1" : "0"}
          onBlur={(e) => onComboBlur(e) }
          onClick={() => onComboClick() }
          onKeyDown={(e) => { onComboKeyDown(e) }}
          >
          <div className="combo-input-text">
            { getNameWithIcon(localOptions[selectedIndex]) }
          </div>
          <div className="combo-input-icon flex-column align-self-center ps-2">
            <SortIcon className={`expand-icon icon-md gray ${menuOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <div      // 'listboxEl'
          id={'combo-listbox-' + id}
          aria-labelledby={'combo-label-' + id} 
          className={`combo-menu ${menuOpen ? 'open' : ''}`}
          role="listbox"
          tabIndex="-1">
            {localOptions.map((option, index) => (
              <div
                key={index}
                id={'combo-' + id + '-option-' + index}
                className={`combo-option ${index === activeIndex ? 'option-current' : ''} ${index === selectedIndex ? 'option-selected' : ''}`}
                role="option"
                aria-selected={index === activeIndex ? "true" : "false"}
                onClick={() => { onOptionClick(index) }}
              >
                {getNameWithIcon(option)}
              </div>
            ))}
        </div>
      </div>
    </div>
  )


}