import React, { useState } from 'react';
import { Select } from '@instructure/ui-select'
import { Tag } from '@instructure/ui-tag'
import { Alert } from '@instructure/ui-alerts'
import { View } from '@instructure/ui-view'

export default function IssueRuleSelect({ t, options, issueTitles, handleIssueTitleChange }) {

  const [ isShowingOptions, setIsShowingOptions ] = useState(false)
  const [ inputValue, setInputValue ] = useState('')
  const [ highlightedOptionId, setHighlightedOptionId ] = useState(null)
  const [ selectedOptionIds, setSelectedOptionIds ] = useState(issueTitles)
  const [ filteredOptions, setFilteredOptions ] = useState(options)
  const [ announcement, setAnnouncement ] = useState('')

  const getOptionById = (queryId) => {
    return options.find(({ id }) => id === queryId)
  }

  const getOptionsChangedMessage = (newOptions) => {
    let message = newOptions.length !== filteredOptions.length
      ? `${newOptions.length} ${t('options.available')}.` // options changed, announce new total
      : null // options haven't changed, don't announce
    if (message && newOptions.length > 0) {
      // options still available
      if (highlightedOptionId !== newOptions[0].id) {
        // highlighted option hasn't been announced
        const option = getOptionById(newOptions[0].id).label
        message = `${option}. ${message}`
      }
    }
    return message
  }

  const filterOptions = (value) => {
    return options.filter(option => (
      selectedOptionIds.indexOf(option.id) === -1 // ignore selected options removed from list
      && option.label.toLowerCase().includes(value.toLowerCase())
    ))
  }

  const matchValue = () => {

    // an option matching user input exists
    if (filteredOptions.length === 1) {
      const onlyOption = filteredOptions[0]
      // automatically select the matching option
      if (onlyOption.label.toLowerCase() === inputValue.toLowerCase()) {
        setInputValue('')
        setSelectedOptionIds([...selectedOptionIds, onlyOption.id])
        setFilteredOptions(filterOptions(''))
      }
    }
    // input value is from highlighted option, not user input
    // clear input, reset options
    if (highlightedOptionId) {
      if (inputValue === getOptionById(highlightedOptionId).label) {
        setInputValue('')
        setFilteredOptions(filterOptions(''))
      }
    }
  }

  const handleShowOptions = () => {
    setIsShowingOptions(true)
  }

  const handleHideOptions = () => {
    setIsShowingOptions(false)
    matchValue()
  }

  const handleBlur = () => {
    setHighlightedOptionId(null)
  }

  const handleHighlightOption = (event, { id }) => {
    event.persist()
    const option = getOptionById(id)
    if (!option) return // prevent highlighting empty option
    setHighlightedOptionId(id)
    setInputValue(event.type === 'keydown' ? option.label : inputValue)

    setHighlightedOptionId(id)
    setInputValue(event.type === 'keydown' ? option.label : inputValue)
    setAnnouncement(option.label)
  }

  const handleSelectOption = (event, { id }) => {
    const option = getOptionById(id)
    if (!option) return // prevent selecting of empty option

    setSelectedOptionIds([...selectedOptionIds, id])
    setHighlightedOptionId(null)
    setFilteredOptions(filterOptions(''))
    setInputValue('')
    setIsShowingOptions(false)
    setAnnouncement(`${option.label} ${t('label.selected.list_collapsed')}.`)
    
    handleIssueTitleChange([...selectedOptionIds, id])
  }

  const handleInputChange = (event) => {
    const value = event.target.value
    const newOptions = filterOptions(value)

    setInputValue(value)
    setFilteredOptions(newOptions)
    setHighlightedOptionId(newOptions.length > 0 ? newOptions[0].id : null)
    setIsShowingOptions(true)
    setAnnouncement(getOptionsChangedMessage(newOptions))
  }

  const handleKeyDown = (event) => {

    if (event.keyCode === 8) {
      // when backspace key is pressed
      if (inputValue === '' && selectedOptionId.length > 0) {
        // remove last selected option, if input has no entered text
        setHighlightedOptionId(null)
        setSelectedOptionIds(selectedOptionIds.slice(0, -1))
      }
    }
  }

  // remove a selected option tag
  const dismissTag = (e, tag) => {
    // prevent closing of list
    e.stopPropagation()
    e.preventDefault()

    const newSelection = selectedOptionIds.filter((id) => id !== tag)

    setSelectedOptionIds(newSelection)
    setHighlightedOptionId(null)

    // this?.inputRef.focus()

    handleIssueTitleChange(newSelection)
  }
  // render tags when multiple options are selected
  const renderTags = () => {

    return selectedOptionIds.map((id, index) => (
      <Tag
        dismissible
        key={id}
        title={`${t('remove.label')} ${getOptionById(id).label}`}
        text={getOptionById(id).label}
        margin="x-small 0 0 0"
        onClick={(e) => dismissTag(e, id)}
      />
    ))
  }

  return (
    <View as="div" padding="small 0">
      <Select
        renderLabel={t('label.plural.issue')}
        assistiveText={t('srlabel.multi_select.help')}
        inputValue={inputValue}
        isShowingOptions={isShowingOptions}
        // inputRef={(el) => this.inputRef = el}
        onBlur={handleBlur}
        onInputChange={handleInputChange}
        onRequestShowOptions={handleShowOptions}
        onRequestHideOptions={handleHideOptions}
        onRequestHighlightOption={handleHighlightOption}
        onRequestSelectOption={handleSelectOption}
        onKeyDown={handleKeyDown}
      >
        {filteredOptions.length > 0 ? filteredOptions.map((option, index) => {
          if (selectedOptionIds.indexOf(option.id) === -1) {
            return (
              <Select.Option
                id={option.id}
                key={option.id}
                isHighlighted={option.id === highlightedOptionId}
              >
                { option.label }
              </Select.Option>
            )
          }
        }) : (
          <Select.Option
            id="empty-option"
            key="empty-option"
          >
            ---
          </Select.Option>
        )}
      </Select>
      <Alert
        liveRegion={() => document.getElementById('flash-messages')}
        liveRegionPoliteness="polite"
        isLiveRegionAtomic
        screenReaderOnly
      >
        { announcement }
      </Alert>
      <View as="div">
        {selectedOptionIds.length > 0 ? renderTags() : null}
      </View>
    </View>
  )
}