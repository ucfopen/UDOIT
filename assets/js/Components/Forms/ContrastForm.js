import React from 'react'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import { CondensedButton } from '@instructure/ui-buttons'
import Html from '../../Services/Html'
import Contrast from '../../Services/Contrast'

export default class ContrastForm extends React.Component {
  constructor(props) {
    super(props)

    let element = Html.toElement(this.props.activeIssue.sourceHtml)

    this.state = {
      backgroundColor: Contrast.rgb2hex(element.style.backgroundColor),
      textColor: Contrast.rgb2hex(element.style.color),
      useBold: false,
      useItalics: false,
      textInputErrors: []
    }

    this.formErrors = []

    this.handleInputBackground = this.handleInputBackground.bind(this)
    this.handleInputText = this.handleInputText.bind(this)
    this.handleLightenBackground = this.handleLightenBackground.bind(this)
    this.handleDarkenBackground = this.handleDarkenBackground.bind(this)
    this.handleLightenText = this.handleLightenText.bind(this)
    this.handleDarkenText = this.handleDarkenText.bind(this)
    this.handleBoldToggle = this.handleBoldToggle.bind(this)
    this.handleItalicsToggle = this.handleItalicsToggle.bind(this)
    this.updatePreview = this.updatePreview.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {
        let element = Html.toElement((this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml)

        this.state = {
          backgroundColor: Contrast.rgb2hex(element.style.backgroundColor),
          textColor: Contrast.rgb2hex(element.style.color),
          useBold: false,
          useItalics: false,
          textInputErrors: []
        }
    
        this.formErrors = []
    }
  }

  handleInputBackground(event, value) {
    this.setState({
      backgroundColor: value
    }, () => {
      this.updatePreview()
    })
  }

  handleInputText(event, value) {
    this.setState({
      textColor: value
    }, () => {
      this.updatePreview()
    })
  }

  handleLightenBackground() {
    this.setState({
      backgroundColor: Contrast.changehue(this.state.backgroundColor, 'lighten')
    }, () => {
      this.updatePreview()
    })
  }

  handleDarkenBackground() {
    this.setState({
      backgroundColor: Contrast.changehue(this.state.backgroundColor, 'darken')
    }, () => {
      this.updatePreview()
    })
  }

  handleLightenText() {
    this.setState({
      textColor: Contrast.changehue(this.state.textColor, 'lighten')
    }, () => {
      this.updatePreview()
    })
  }

  handleDarkenText() {
    this.setState({
      textColor: Contrast.changehue(this.state.textColor, 'darken')
    }, () => {
      this.updatePreview()
    })
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
    if(this.state.textInputErrors.length === 0) {
      let issue = this.props.activeIssue
      issue.newHtml = this.processHtml()
      this.props.handleIssueSave(issue)
    }
  }

  render() {
    const pending = (this.props.activeIssue && this.props.activeIssue.pending)
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
    const canSubmit = (!pending && !this.props.activeIssue.status)

    return (
      <View>
        <Flex alignItems="end" justifyItems="space-between" width="300px">
          <Flex.Item>
            <TextInput
            renderLabel={this.props.t('form.contrast.replace_background')}
            placeholder={this.state.backgroundColor}
            value={this.state.backgroundColor}
            onChange={this.handleInputBackground}
            width="200px"
            />
          </Flex.Item>

          <Flex.Item>
            <div style={{...{backgroundColor: this.state.backgroundColor},...{width: '60px'},...{height: '60px'},...{borderRadius: '50%'},...{opacity: 1.0}}}>
              <h1>&nbsp;</h1>
            </div>
          </Flex.Item>
        </Flex>

        <CondensedButton color="primary" margin="xx-small" onClick={this.handleLightenBackground}>
            {this.props.t('form.contrast.lighten')}
        </CondensedButton>

        <CondensedButton color="primary" margin="xx-small" onClick={this.handleDarkenBackground}>
            {this.props.t('form.contrast.darken')}
        </CondensedButton>


        <Flex alignItems="end" justifyItems="space-between" width="300px">
          <Flex.Item>
            <TextInput
            renderLabel={this.props.t('form.contrast.replace_text')}
            placeholder={this.state.textColor}
            value={this.state.textColor}
            onChange={this.handleInputText}
            width="200px"
            messages={this.state.textInputErrors}
            />
          </Flex.Item>

          <Flex.Item>
            <div style={{...{backgroundColor: this.state.textColor},...{width: '60px'},...{height: '60px'},...{borderRadius: '50%'}}}>
              <h1>&nbsp;</h1>
            </div>
          </Flex.Item>
        </Flex>

        <CondensedButton color="primary" margin="xx-small" onClick={this.handleLightenText}>
            {this.props.t('form.contrast.lighten')}
        </CondensedButton>

        <CondensedButton color="primary" margin="xx-small" onClick={this.handleDarkenText}>
            {this.props.t('form.contrast.darken')}
        </CondensedButton>

        <View as="div" margin="small 0">
          <Checkbox label={this.props.t('form.contrast.bolden_text')} onChange={this.handleBoldToggle}>
          </Checkbox>
        </View>

        <View as="div" margin="small 0">
          <Checkbox label={this.props.t('form.contrast.italicize_text')} onChange={this.handleItalicsToggle}>
          </Checkbox>
        </View>

        <View as="div" margin="medium 0">
          <Button color="primary" onClick={this.handleSubmit} interaction={(canSubmit) ? 'enabled' : 'disabled'}>
              {pending && <Spinner size="x-small" renderTitle={buttonLabel} />}
              {this.props.t(buttonLabel)}
          </Button>
        </View>
        
        </View>
    );
  }

  processHtml() {
    let element = Html.toElement(this.props.activeIssue.sourceHtml)

    element.style.backgroundColor = this.state.backgroundColor
    element.style.color = this.state.textColor

    if(this.state.useBold) {
      element.style.fontWeight = "bold"
    }

    if(this.state.useItalics) {
      element.style.fontStyle = "italic"
    }

    return Html.toString(element)
  }

  updatePreview() {
    let issue = this.props.activeIssue
    let ratio = Contrast.contrastRatio(this.state.backgroundColor, this.state.textColor)
    let tagName = Html.toElement(issue.sourceHtml).tagName
    let largeTextTags = this.props.t('form.contrast.large_text_tags')

    this.formErrors = []
    
    if(largeTextTags.includes(tagName)) {
      if(ratio < 3) {
        //push errors
        this.formErrors.push({ text: `${this.props.t('form.contrast.invalid')}: ${ratio}` , type: 'error' })
      }
    } else {
      if(ratio < 4.5) {
        //push errors
        this.formErrors.push({ text: `${this.props.t('form.contrast.invalid')}: ${ratio}` , type: 'error' })
      }
    }

    if(this.formErrors.length > 0) {
      this.setState({ textInputErrors: this.formErrors })
    } else {
      this.setState({ textInputErrors: []})
    }

    issue.newHtml = this.processHtml()
    this.props.handleActiveIssue(issue)
  }
}