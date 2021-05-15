import React from 'react'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import { IconButton } from '@instructure/ui-buttons'
import { IconArrowOpenDownSolid, IconArrowOpenUpSolid, IconCheckMarkLine } from '@instructure/ui-icons'
import Html from '../../Services/Html'
import Contrast from '../../Services/Contrast'

export default class ContrastForm extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      backgroundColor: this.getBackgroundColor(),
      textColor: this.getTextColor(),
      useBold: this.isBold(),
      useItalics: this.isItalicized(),
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

  componentDidMount(prevProps, prevState) {
    this.updatePreview()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {

      this.setState({
        backgroundColor: this.getBackgroundColor(),
        textColor: this.getTextColor(),
        useBold: this.isBold(),
        useItalics: this.isItalicized(),
        textInputErrors: []
      },() => {
        this.formErrors = []
        this.updatePreview()
      })
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
      this.props.handleIssueSave(issue)
    }
  }

  render() {
    const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'

    return (
      <View as="div" padding="0 x-small">
        <View as="div" padding="x-small 0">
          <TextInput
            renderLabel={this.props.t('form.contrast.replace_background')}
            placeholder={this.state.backgroundColor}
            value={this.state.backgroundColor}
            onChange={this.handleInputBackground}
            renderBeforeInput={
              <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: this.state.backgroundColor, width: '20px', height: '20px', opacity: 1.0 }}></div>
            }
            renderAfterInput={
              <View>
                <IconButton withBackground={false} withBorder={false} 
                  onClick={this.handleDarkenBackground}
                  screenReaderLabel={this.props.t('form.contrast.darken')}>
                  <IconArrowOpenDownSolid color="primary" size="x-small" />
                </IconButton>
                <IconButton withBackground={false} withBorder={false}
                  onClick={this.handleLightenBackground}
                  screenReaderLabel={this.props.t('form.contrast.lighten')}>
                  <IconArrowOpenUpSolid color="primary" size="x-small" />
                </IconButton>          
              </View>
            }
          />
        </View>
        <View as="div" padding="x-small 0">
          <TextInput
            renderLabel={this.props.t('form.contrast.replace_text')}
            placeholder={this.state.textColor}
            value={this.state.textColor}
            onChange={this.handleInputText}
            messages={this.state.textInputErrors}
            renderBeforeInput={
              <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: this.state.textColor, width: '20px', height: '20px', opacity: 1.0 }}></div>
            }
            renderAfterInput={
              <View>
                <IconButton withBackground={false} withBorder={false}
                  onClick={this.handleDarkenText}
                  screenReaderLabel={this.props.t('form.contrast.darken')}>
                  <IconArrowOpenDownSolid color="primary" size="x-small" />
                </IconButton>
                <IconButton withBackground={false} withBorder={false}
                  onClick={this.handleLightenText}
                  screenReaderLabel={this.props.t('form.contrast.lighten')}>
                  <IconArrowOpenUpSolid color="primary" size="x-small" />
                </IconButton>
              </View>
            }
          />
        </View>
        <View as="div" margin="small 0">
          <Checkbox label={this.props.t('form.contrast.bolden_text')} 
            checked={this.state.useBold}
            onChange={this.handleBoldToggle}>
          </Checkbox>
        </View>

        <View as="div" margin="small 0">
          <Checkbox label={this.props.t('form.contrast.italicize_text')} 
            checked={this.state.useItalics}
            onChange={this.handleItalicsToggle}>
          </Checkbox>
        </View>

        <View as="div" margin="medium 0">
          <Button color="primary" onClick={this.handleSubmit} interaction={(!pending) ? 'enabled' : 'disabled'}>
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

    element.style.backgroundColor = this.state.backgroundColor
    element.style.color = this.state.textColor

    element.style.fontWeight = (this.state.useBold) ? "bold" : "normal"
    element.style.fontStyle = (this.state.useItalics) ? "italic" : "normal"

    return Html.toString(element)
  }

  updatePreview() {
    let issue = this.props.activeIssue
    const html = Html.getIssueHtml(this.props.activeIssue)
    let ratio = Contrast.contrastRatio(this.state.backgroundColor, this.state.textColor)
    let tagName = Html.toElement(html).tagName
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

    this.setState({ textInputErrors: this.formErrors })

    issue.newHtml = this.processHtml(html)
    this.props.handleActiveIssue(issue)
  }

  isBold()
  {
    const issue = this.props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(this.props.activeIssue)
    const element = Html.toElement(html)
    
    console.log('weight', element.style.fontWeight)

    return ((element.style.fontWeight === 'bold') || (metadata.fontWeight === 'bold'))
  }

  isItalicized()
  {
    const issue = this.props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(this.props.activeIssue)
    const element = Html.toElement(html)
    
    console.log('style', element.style.fontStyle)

    return ((element.style.fontStyle == 'italic') || (metadata.fontStyle == 'italic'))
  }

  getBackgroundColor()
  {
    const issue = this.props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(this.props.activeIssue)
    const element = Html.toElement(html)

    if (element.style.backgroundColor) {
      return Contrast.rgb2hex(element.style.backgroundColor)
    } 
    else {
      return (metadata.backgroundColor) ? Contrast.rgb2hex(metadata.backgroundColor) : this.props.settings.backgroundColor
    }
  }

  getTextColor()
  {
    const issue = this.props.activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(this.props.activeIssue)
    const element = Html.toElement(html)

    if (element.style.color) {
      return Contrast.rgb2hex(element.style.color)
    }
    else {
      return (metadata.color) ? Contrast.rgb2hex(metadata.color) : this.props.settings.textColor
    }
  }
}