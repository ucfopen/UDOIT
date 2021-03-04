import React from 'react';
import { Select } from '@instructure/ui-select'
import { Tag } from '@instructure/ui-tag'
import { Alert } from '@instructure/ui-alerts'
import { View } from '@instructure/ui-view'

class IssueRuleSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isShowingOptions: false,
      inputValue: '',
      highlightedOptionId: null,
      selectedOptionIds: this.props.issueTitles,
      filteredOptions: this.props.options,
    }
  }
  
  getOptionById (queryId) {
    return this.props.options.find(({ id }) => id === queryId)
  }

  getOptionsChangedMessage (newOptions) {
    let message = newOptions.length !== this.state.filteredOptions.length
      ? `${newOptions.length} ${this.props.t('options.available')}.` // options changed, announce new total
      : null // options haven't changed, don't announce
    if (message && newOptions.length > 0) {
      // options still available
      if (this.state.highlightedOptionId !== newOptions[0].id) {
        // highlighted option hasn't been announced
        const option = this.getOptionById(newOptions[0].id).label
        message = `${option}. ${message}`
      }
    }
    return message
  }

  filterOptions = (value) => {
    const { selectedOptionIds } = this.state
    return this.props.options.filter(option => (
      selectedOptionIds.indexOf(option.id) === -1 // ignore selected options removed from list
      && option.label.toLowerCase().includes(value.toLowerCase())
    ))
  }

  matchValue() {
    const {
      filteredOptions,
      inputValue,
      highlightedOptionId,
      selectedOptionIds
    } = this.state

    // an option matching user input exists
    if (filteredOptions.length === 1) {
      const onlyOption = filteredOptions[0]
      // automatically select the matching option
      if (onlyOption.label.toLowerCase() === inputValue.toLowerCase()) {
        return {
          inputValue: '',
          selectedOptionIds: [...selectedOptionIds, onlyOption.id],
          filteredOptions: this.filterOptions('')
        }
      }
    }
    // input value is from highlighted option, not user input
    // clear input, reset options
    if (highlightedOptionId) {
      if (inputValue === this.getOptionById(highlightedOptionId).label) {
        return {
          inputValue: '',
          filteredOptions: this.filterOptions('')
        }
      }
    }
  }

  handleShowOptions = (event) => {
    this.setState({ isShowingOptions: true })
  }

  handleHideOptions = (event) => {
    this.setState({
      isShowingOptions: false,
      ...this.matchValue()
    })
  }

  handleBlur = (event) => {
    this.setState({
      highlightedOptionId: null
    })
  }

  handleHighlightOption = (event, { id }) => {
    event.persist()
    const option = this.getOptionById(id)
    if (!option) return // prevent highlighting empty option
    this.setState((state) => ({
      highlightedOptionId: id,
      inputValue: event.type === 'keydown' ? option.label : state.inputValue,
      announcement: option.label
    }))
  }

  handleSelectOption = (event, { id }) => {
    const option = this.getOptionById(id)
    if (!option) return // prevent selecting of empty option

    this.setState((state) => ({
      selectedOptionIds: [...state.selectedOptionIds, id],
      highlightedOptionId: null,
      filteredOptions: this.filterOptions(''),
      inputValue: '',
      isShowingOptions: false,
      announcement: `${option.label} ${this.props.t('label.selected.list_collapsed')}.`
    }))

    this.props.handleIssueTitleChange([...this.state.selectedOptionIds, id])
  }

  handleInputChange = (event) => {
    const value = event.target.value
    const newOptions = this.filterOptions(value)
    this.setState({
      inputValue: value,
      filteredOptions: newOptions,
      highlightedOptionId: newOptions.length > 0 ? newOptions[0].id : null,
      isShowingOptions: true,
      announcement: this.getOptionsChangedMessage(newOptions)
    })
  }

  handleKeyDown = (event) => {
    const { selectedOptionId, inputValue } = this.state
    if (event.keyCode === 8) {
      // when backspace key is pressed
      if (inputValue === '' && selectedOptionId.length > 0) {
        // remove last selected option, if input has no entered text
        this.setState((state) => ({
          highlightedOptionId: null,
          selectedOptionIds: state.selectedOptionIds.slice(0, -1)
        }))
      }
    }
  }
  // remove a selected option tag
  dismissTag (e, tag) {
    // prevent closing of list
    e.stopPropagation()
    e.preventDefault()

    const newSelection = this.state.selectedOptionIds.filter((id) => id !== tag)
    this.setState({
      selectedOptionIds: newSelection,
      highlightedOptionId: null
    }, () => {
      this.inputRef.focus()
    })

    this.props.handleIssueTitleChange(newSelection)
  }
  // render tags when multiple options are selected
  renderTags () {
    const { selectedOptionIds } = this.state
    return selectedOptionIds.map((id, index) => (
      <Tag
        dismissible
        key={id}
        title={`${this.props.t('remove.label')} ${this.getOptionById(id).label}`}
        text={this.getOptionById(id).label}
        margin="x-small 0 0 0"
        onClick={(e) => this.dismissTag(e, id)}
      />
    ))
  }

  render () {
    const {
      inputValue,
      isShowingOptions,
      highlightedOptionId,
      selectedOptionIds,
      filteredOptions,
      announcement
    } = this.state

    return (
      <View as="div" padding="small 0">
        <Select
          renderLabel={this.props.t('label.plural.issue')}
          assistiveText={this.props.t('srlabel.multi_select.help')}
          inputValue={inputValue}
          isShowingOptions={isShowingOptions}
          inputRef={(el) => this.inputRef = el}
          onBlur={this.handleBlur}
          onInputChange={this.handleInputChange}
          onRequestShowOptions={this.handleShowOptions}
          onRequestHideOptions={this.handleHideOptions}
          onRequestHighlightOption={this.handleHighlightOption}
          onRequestSelectOption={this.handleSelectOption}
          onKeyDown={this.handleKeyDown}
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
          {selectedOptionIds.length > 0 ? this.renderTags() : null}
        </View>
      </View>
    )
  }
}

export default IssueRuleSelect;