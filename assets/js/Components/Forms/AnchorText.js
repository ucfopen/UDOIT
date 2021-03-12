import React from 'react'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { Alert } from '@instructure/ui-alerts'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import Html from '../../Services/Html'


export default class AnchorText extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      textInputValue: Html.getInnerText(props.activeIssue.sourceHtml),
      textInputErrors: [],
      deleteLink: false,
    }

    this.formErrors = []

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleDeleteCheckbox = this.handleDeleteCheckbox.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {
      const html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml
      this.setState({
        textInputValue: Html.getInnerText(html),
        textInputErrors: [],
        deleteLink: false,
      })
    }
  }

  handleSubmit() {
    this.formErrors = []

    if (!this.state.deleteLink) {
      this.checkTextNotEmpty()
      this.checkTextDescriptive()
    }

    if (this.formErrors.length > 0) {
      this.setState({ textInputErrors: this.formErrors })
    }
    else {
      let issue = this.props.activeIssue
      issue.newHtml = this.processHtml()
      this.props.handleIssueSave(issue)
    }
  }

  handleInput(event, value) {
    this.setState({
      textInputValue: value
    }, () => {
      let issue = this.props.activeIssue
      issue.newHtml = this.processHtml()
      this.props.handleActiveIssue(issue)
    })
  }

  handleDeleteCheckbox(event, value) {
    this.setState({
      deleteLink: event.target.checked
    }, () => {
      let issue = this.props.activeIssue
      issue.newHtml = this.processHtml()
      this.props.handleActiveIssue(issue)
    })  
  }

  render() {
    const pending = (this.props.activeIssue && this.props.activeIssue.pending)
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
    const canSubmit = (!pending && !this.props.activeIssue.status)

    return (
      <View as="div" padding="0 x-small">
        <View as="div">
          <TextInput
            renderLabel={this.props.t('form.anchor.link_text')}
            display="inline-block"
            width="100%"
            onChange={this.handleInput}
            value={this.state.textInputValue}
            id="textInputValue"
            interaction={this.state.deleteLink ? 'disabled' : null}
            messages={this.state.textInputErrors}
          />
          <View as="div" margin="small 0">
            <Checkbox label={this.props.t('form.anchor.delete_link')} checked={this.state.deleteLink} onChange={this.handleDeleteCheckbox} />
          </View>
        </View>
        <View as="div" margin="small 0">
          <Button color="primary" onClick={this.handleSubmit} interaction={(canSubmit) ? 'enabled' : 'disabled'}>
            {pending && <Spinner size="x-small" renderTitle={this.props.t(buttonLabel)} />}
            {this.props.t(buttonLabel)}
          </Button>
        </View>
      </View>
    );
  }

  checkTextDescriptive() {
    const text = this.state.textInputValue.trim().toLowerCase()
    const badOptions = [
      'click',
      'click here',
      'more',
      'here',
    ]
    if (badOptions.includes(text)) {
      this.formErrors.push({ text: this.props.t('form.anchor.msg.text_descriptive'), type: 'error' })
    }
  }

  checkTextNotEmpty() {
    const text = this.state.textInputValue.trim().toLowerCase()
    if (text === '') {
      this.formErrors.push({text: this.props.t('form.anchor.msg.text_empty'), type: 'error'})
    }
  }

  processHtml(state, props) {
    if (!state) {
      state = this.state
    }
    if (!props) {
      props = this.props
    }

    const sourceHtml = props.activeIssue.sourceHtml
    const { textInputValue, deleteLink } = state
    
    if (deleteLink) {
      return '';
    }

    return Html.toString(Html.setInnerText(sourceHtml, textInputValue))
  }
}