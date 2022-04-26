import React from 'react'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { View } from '@instructure/ui-view'
import { Checkbox } from '@instructure/ui-checkbox'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default class EmphasisForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      useBold: this.isBold(),
      useItalics: this.isItalicized(),
      checkboxErrors: []
    }

    this.formErrors = []

    this.handleBoldToggle = this.handleBoldToggle.bind(this)
    this.handleItalicsToggle = this.handleItalicsToggle.bind(this)
    this.updatePreview = this.updatePreview.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount(prevProps, prevState) {
    this.updatePreview()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {

      this.setState({
        useBold: this.isBold(),
        useItalics: this.isItalicized(),
        checkBoxErrors: []
      },() => {
        this.formErrors = []
        this.updatePreview()
      })
    }
  }

  handleBoldToggle() {
    this.setState({
      useBold: !this.state.useBold
    }, () => {
      this.updatePreview()
    })
  }

  handleItalicsToggle() {
    this.setState({
      useItalics: !this.state.useItalics
    }, () => {
      this.updatePreview()
    })
  }

  handleSubmit() {
    let issue = this.props.activeIssue
    
    if (this.cssEmphasisIsValid(issue)) {
      let issue = this.props.activeIssue
      issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
      this.props.handleIssueSave(issue)
    } 
    else {
      //push errors
      this.formErrors = []
      this.formErrors.push({ text: `${this.props.t('form.contrast.must_select')}` , type: 'error' })

      this.setState({
        checkboxErrors: this.formErrors
      })
    }
  }

  render() {
    const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
    
    return (
      <View as="div" padding="0 x-small">
        <div id="flash-messages" role="alert"></div>
        <View as="div" margin="small 0">
          <Checkbox label={this.props.t('form.contrast.bolden_text')}
            checked={this.state.useBold}
            onChange={this.handleBoldToggle}>
          </Checkbox>
        </View>

        <View as="div" margin="small 0">
          <Checkbox label={this.props.t('form.contrast.italicize_text')}
            checked={this.state.useItalics}
            onChange={this.handleItalicsToggle}
            messages={this.state.checkboxErrors}>
          </Checkbox>
        </View>

        <View as="div" margin="medium 0">
          <Button color="primary" onClick={this.handleSubmit} interaction={(!pending && this.props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}>
            {('1' == pending) && <Spinner size="x-small" renderTitle={buttonLabel} />}
            {this.props.t(buttonLabel)}
          </Button>
          {this.props.activeIssue.recentlyUpdated &&
            <View margin="0 small">
              <IconCheckMarkLine color="success" />
              <View margin="0 x-small">{this.props.t('label.fixed')}</View>
            </View>
          }
        </View>
      </View>
    );
  }

  processHtml(html) {
    let element = Html.toElement(html)

    // Clean up tags
    Html.removeTag(element, 'strong')
    Html.removeTag(element, 'em')

    element.innerHTML = (this.state.useBold) ? `<strong>${element.innerHTML}</strong>` : element.innerHTML
    element.innerHTML = (this.state.useItalics) ? `<em>${element.innerHTML}</em>` : element.innerHTML
    
    return Html.toString(element)
  }

  updatePreview() {
    let issue = this.props.activeIssue
    const html = Html.getIssueHtml(this.props.activeIssue)

    issue.newHtml = this.processHtml(html)
    this.props.handleActiveIssue(issue)
  }

  isBold()
  {
    const issue = this.props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(this.props.activeIssue)
    const element = Html.toElement(html)

    return ((Html.hasTag(element, 'strong')) || (metadata.fontWeight === 'bold'))
  }

  isItalicized()
  {
    const issue = this.props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(this.props.activeIssue)
    const element = Html.toElement(html)

    return ((Html.hasTag(element, 'em')) || (metadata.fontStyle == 'italic'))
  }

  cssEmphasisIsValid(issue) {
    if(issue.scanRuleId === 'CssTextStyleEmphasize') {
      if(!this.state.useBold && !this.state.useItalics) {
        return false
      }
    }
    return true
  }
}
