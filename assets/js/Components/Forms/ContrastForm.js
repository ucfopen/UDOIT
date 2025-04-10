import React, { useState, useEffect } from 'react'
import PaletteIcon from '../Icons/PaletteIcon'
import DarkIcon from '../Icons/DarkIcon'
import LightIcon from '../Icons/LightIcon'
import ColorSelector from '../ColorSelector'
import SeverityIssueIcon from '../Icons/SeverityIssueIcon'
import FixedIcon from '../Icons/FixedIcon'
import * as Html from '../../Services/Html'
import * as Contrast from '../../Services/Contrast'

export default function ContrastForm({
  t,
  settings,
  activeIssue,
  handleActiveIssue,
  handleIssueSave
}) {

  const getBackgroundColor = () => {
    const issue = activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    if (element.style.backgroundColor) {
      return Contrast.standardizeColor(element.style.backgroundColor)
    }
    else if (metadata.messageArgs) {
      // TODO: check if 4th argument exists
      // (Equal Access) text_contrast_sufficient: The 4th index in messageArgs is the background color
      return metadata.messageArgs[4]
    }
    else {
      return (metadata.backgroundColor) ? Contrast.standardizeColor(metadata.backgroundColor) : settings.backgroundColor
    }
  }

  const getTextColor = () => {
    const issue = activeIssue
    const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
    const html = Html.getIssueHtml(activeIssue)
    const element = Html.toElement(html)

    if (element.style.color) {
      return Contrast.standardizeColor(element.style.color)
    }
    else if (metadata.messageArgs) {
      // (Equal Access) text_contrast_sufficient: The 3rd index in messageArgs is the foreground color
      return metadata.messageArgs[3]
    }
    else {
      return (metadata.color) ? Contrast.standardizeColor(metadata.color) : settings.textColor
    }
  }

  const initialBackgroundColor = getBackgroundColor()
  const initialTextColor = getTextColor()

  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor)
  const [textColor, setTextColor] = useState(initialTextColor)
  const [backgroundColorInput, setBackgroundColorInput] = useState(initialBackgroundColor)
  const [textColorInput, setTextColorInput] = useState(initialTextColor)
  const [contrastRatio, setContrastRatio] = useState(null)
  const [ratioIsValid, setRatioIsValid] = useState(false)
  const [showTextColorSelector, setShowTextColorSelector] = useState(false)
  const [showBackgroundColorSelector, setShowBackgroundColorSelector] = useState(false)
  
  const isValidHexColor = (color) => {
    const hexColorPattern = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/
    return hexColorPattern.test(color)
  }

  const processHtml = (html) => {
    let element = Html.toElement(html)

    element.style.backgroundColor = Contrast.convertShortenedHex(backgroundColor)
    element.style.color = Contrast.convertShortenedHex(textColor)

    return Html.toString(element)
  }

  const updatePreview = () => {
    let issue = activeIssue
    const html = Html.getIssueHtml(activeIssue)
    let contrastRatio = Contrast.contrastRatio(backgroundColor, textColor)
    let tagName = Html.toElement(html).tagName
    let largeTextTags = t('form.contrast.large_text_tags')
    let ratioIsValid = ratioIsValid
    
    if(largeTextTags.includes(tagName)) {
      ratioIsValid = (contrastRatio >= 3)
    } else {
      ratioIsValid = (contrastRatio >= 4.5)
    }

    setContrastRatio(contrastRatio)
    setRatioIsValid(ratioIsValid)

    issue.newHtml = processHtml(html)
    handleActiveIssue(issue)
  }

  const updateText = (value) => {
     setTextColor(value)
  }

  const updateBackground = (value) => {
    setBackgroundColor(value)
  }

  const handleInputText = (event, value) => {
    setTextColorInput(value)
    if(isValidHexColor(value)) {
      setTextColor(value)
    }
  }

  const handleInputBackground = (event, value) => {
    setBackgroundColorInput(value)
    if(isValidHexColor(value)) {
      setBackgroundColor(value)
    }
  }

  const handleToggleTextColorSelector = () => {
    setShowTextColorSelector(!showTextColorSelector)
  }

  const handleToggleBackgroundColorSelector = () => {
    setShowBackgroundColorSelector(!showBackgroundColorSelector)
  }

  const handleLightenText = () => {
    setTextColor(Contrast.changehue(textColor, 'lighten'))
  }

  const handleDarkenText = () => {
    setTextColor(Contrast.changehue(textColor, 'darken'))
  }

  const handleLightenBackground = () => {
    setBackgroundColor(Contrast.changehue(backgroundColor, 'lighten'))
  }

  const handleDarkenBackground = () => {
    setBackgroundColor(Contrast.changehue(backgroundColor, 'darken'))
  }

  const handleSubmit = () => {
    let issue = activeIssue
    if(ratioIsValid) {
      issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
      handleIssueSave(issue)
    }
    // else {
    //   setFormErrors([{ text: `${t('form.contrast.invalid')}: ${contrastRatio}` , type: 'error' }])
    //   setTextInputErrors(formErrors)
    // }
  }

  useEffect(() => {
    updatePreview()
  }, [textColor, backgroundColor])

  useEffect(() => {
    setBackgroundColor(getBackgroundColor())
    setTextColor(getTextColor())
  }, [activeIssue])

  return (
    <>
      {/* <div id="flash-messages" role="alert" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
        {t('form.contrast_ratio')}: {contrastRatio}
      </div> */}
      <label htmlFor="backgroundColorInput">{t('form.contrast.replace_background')}</label>
      <div className="flex-row justify-content-between mt-2">
        <div className="flex-row gap-2">
          <div className="flex-column justify-content-center ps-1">
            <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(backgroundColor), width: '20px', height: '20px', opacity: 1.0, display: 'inline-block' }}></div>
          </div>
          <div className="flex-column justify-content-center">
            <input id="backgroundColorInput" name="backgroundColorInput" className="w-50" type="text" value={backgroundColorInput} onChange={handleInputBackground} />
          </div>
        </div>
        <div className="flex-row gap-1">
          <div className="flex-column justify-content-center">
            <button className={`btn-icon-only btn-transparent ${showBackgroundColorSelector ? 'active' : ''}`} title={t('label.show_color_picker')} onClick={handleToggleBackgroundColorSelector}>
              <PaletteIcon className="icon-md" />
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.darken')} onClick={handleDarkenBackground}>
              <DarkIcon className="icon-md"/>
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.lighten')} onClick={handleLightenBackground}>
              <LightIcon className="icon-md"/>
            </button>
          </div>
        </div>
      </div>
      {showBackgroundColorSelector && (
        <div className="mt-2">
          <ColorSelector
            t={t}
            updateColor={updateBackground}
          />
        </div>
      )}

      <div className="mt-3 mb-0">
        <label htmlFor="textColorInput">{t('form.contrast.replace_text')}</label>
      </div>
      <div className="flex-row justify-content-between mt-2">
        <div className="flex-row gap-2">
          <div className="flex-column justify-content-center ps-1">
            <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(textColor), width: '20px', height: '20px', opacity: 1.0, display: 'inline-block' }}></div>
          </div>
          <div className="flex-column justify-content-center">
            <input id="textColorInput" name="textColorInput" className="w-50" type="text" value={textColorInput} onChange={handleInputText} />
          </div>
        </div>
        <div className="flex-row gap-1">
          <div className="flex-column justify-content-center">
            <button className={`btn-icon-only btn-transparent ${showTextColorSelector ? 'active' : ''}`} title={t('label.show_color_picker')} onClick={handleToggleTextColorSelector}>
              <PaletteIcon className="icon-md" />
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.darken')} onClick={handleDarkenText}>
              <DarkIcon className="icon-md"/>
            </button>
          </div>
          <div className="flex-column justify-content-center">
            <button className="btn-icon-only btn-transparent" title={t('form.contrast.lighten')} onClick={handleLightenText}>
              <LightIcon className="icon-md"/>
            </button>
          </div>
        </div>
      </div>
      {showTextColorSelector && (
        <div className="mt-2">
          <ColorSelector
            t={t}
            updateColor={updateText}
          />
        </div>
      )}
      <div className="flex-row justify-content-between mt-3 mb-3">
        <div className="flex-column justify-content-start">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!ratioIsValid}>{t('form.submit')}</button>
        </div>
        <div className="flex-column justify-content-start">
          <div className={`ratio-container flex-column ${ratioIsValid ? 'ratio-valid' : 'ratio-invalid'}`}>
            <div className="flex-row justify-content-center">
              <div className="ratio-label">{t('form.contrast_ratio')}</div>
            </div>
            <div className="flex-row justify-content-center gap-1">
              <div className="flex-column justify-content-center">
                {ratioIsValid ? (
                  <FixedIcon className="icon-md color-success" />
                ) : (
                  <SeverityIssueIcon className="icon-md color-issue" />
                )}
              </div>
              <div className="flex-column justify-content-center">
                <div className="ratio-value">{contrastRatio}</div>  
              </div>
            </div>
            <div className="flex-row justify-content-center">
              <div className={`ratio-status ${ratioIsValid ? 'valid' : 'invalid'}`}>{ratioIsValid ? t('form.contrast.valid') : t('form.contrast.invalid')}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// export default class ContrastForm extends React.Component {
//   constructor(props) {
//     super(props)

//     this.state = {
//       backgroundColor: this.getBackgroundColor(),
//       textColor: this.getTextColor(),
//       contrastRatio: null,
//       ratioIsValid: false,
//       textInputErrors: [],
//     }

//     this.formErrors = []

//     this.handleInputBackground = this.handleInputBackground.bind(this)
//     this.handleInputText = this.handleInputText.bind(this)
//     this.handleLightenBackground = this.handleLightenBackground.bind(this)
//     this.handleDarkenBackground = this.handleDarkenBackground.bind(this)
//     this.handleLightenText = this.handleLightenText.bind(this)
//     this.handleDarkenText = this.handleDarkenText.bind(this)
//     this.updatePreview = this.updatePreview.bind(this)
//     this.handleSubmit = this.handleSubmit.bind(this)
//     this.updateText = this.updateText.bind(this)
//     this.updateBackground = this.updateBackground.bind(this)
//   }

//   componentDidMount(prevProps, prevState) {
//     this.updatePreview()
//   }

//   componentDidUpdate(prevProps, prevState) {
//     if (prevProps.activeIssue !== this.props.activeIssue) {

//       this.setState({
//         backgroundColor: this.getBackgroundColor(),
//         textColor: this.getTextColor(),
//         textInputErrors: []
//       },() => {
//         this.formErrors = []
//         this.updatePreview()
//       })
//     }
//   }

//   handleInputBackground(event, value) {
//     this.setState({
//       backgroundColor: value
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   handleInputText(event, value) {
//     this.setState({
//       textColor: value
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   handleLightenBackground() {
//     this.setState({
//       backgroundColor: Contrast.changehue(this.state.backgroundColor, 'lighten')
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   handleDarkenBackground() {
//     this.setState({
//       backgroundColor: Contrast.changehue(this.state.backgroundColor, 'darken')
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   handleLightenText() {
//     this.setState({
//       textColor: Contrast.changehue(this.state.textColor, 'lighten')
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   handleDarkenText() {
//     this.setState({
//       textColor: Contrast.changehue(this.state.textColor, 'darken')
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   handleSubmit() {
//     let issue = this.props.activeIssue
    
//     if(this.state.ratioIsValid) {
//       let issue = this.props.activeIssue
//       issue.newHtml = Contrast.convertHtmlRgb2Hex(issue.newHtml)
//       this.props.handleIssueSave(issue)
//     } else {
//       //push errors
//       this.formErrors = []
//       this.formErrors.push({ text: `${this.props.t('form.contrast.invalid')}: ${this.state.contrastRatio}` , type: 'error' })

//       this.setState({
//         textInputErrors: this.formErrors
//       })
//     }
//   }

//   updateText(value) {
//     this.setState({
//       textColor: value
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   updateBackground(value) {
//     this.setState({
//       backgroundColor: value
//     }, () => {
//       this.updatePreview()
//     })
//   }

//   render() {
//     const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
//     const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
//     const ratioColor = (this.state.ratioIsValid) ? 'success' : 'danger'

//     return (
//       <View as="div" padding="0 x-small">
//         <div id="flash-messages" role="alert"></div>
//         <Alert 
//           liveRegion={() => document.getElementById('flash-messages')}
//           liveRegionPoliteness="polite"
//           screenReaderOnly
//         >
//           {this.props.t('form.contrast_ratio')}: {this.state.contrastRatio}
//         </Alert>
//         <View as="div" padding="x-small 0">
//           <TextInput
//             renderLabel={this.props.t('form.contrast.replace_background')}
//             placeholder={this.state.backgroundColor}
//             value={this.state.backgroundColor}
//             onChange={this.handleInputBackground}
//             renderBeforeInput={
//               <span style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(this.state.backgroundColor), width: '20px', height: '20px', opacity: 1.0, display: 'inline-block' }}></span>
//             }
//             renderAfterInput={
//               <View>
//                 <IconButton withBackground={false} withBorder={false}
//                   onClick={this.handleDarkenBackground}
//                   screenReaderLabel={this.props.t('form.contrast.darken')}>
//                   <IconArrowOpenDownSolid color="primary" size="x-small" />
//                 </IconButton>
//                 <IconButton withBackground={false} withBorder={false}
//                   onClick={this.handleLightenBackground}
//                   screenReaderLabel={this.props.t('form.contrast.lighten')}>
//                   <IconArrowOpenUpSolid color="primary" size="x-small" />
//                 </IconButton>
//               </View>
//             }
//           />
//           <ColorSelector
//             t={this.props.t}
//             updateColor={this.updateBackground}
//           />
//         </View>
//         <View as="div" padding="x-small 0">
//           <TextInput
//             renderLabel={this.props.t('form.contrast.replace_text')}
//             placeholder={this.state.textColor}
//             value={this.state.textColor}
//             onChange={this.handleInputText}
//             messages={this.state.textInputErrors}
//             renderBeforeInput={
//               <div style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: Contrast.convertShortenedHex(this.state.textColor), width: '20px', height: '20px', opacity: 1.0 }}></div>
//             }
//             renderAfterInput={
//               <View>
//                 <IconButton withBackground={false} withBorder={false}
//                   onClick={this.handleDarkenText}
//                   screenReaderLabel={this.props.t('form.contrast.darken')}>
//                   <IconArrowOpenDownSolid color="primary" size="x-small" />
//                 </IconButton>
//                 <IconButton withBackground={false} withBorder={false}
//                   onClick={this.handleLightenText}
//                   screenReaderLabel={this.props.t('form.contrast.lighten')}>
//                   <IconArrowOpenUpSolid color="primary" size="x-small" />
//                 </IconButton>
//               </View>
//             }
//           />
//           <ColorSelector
//             t={this.props.t}
//             updateColor={this.updateText}
//           />
//         </View>
//         <Flex>
//           <Flex.Item shouldGrow shouldShrink>
//             <View as="div" margin="medium 0">
//               <Button color="primary" onClick={this.handleSubmit} interaction={(!pending && this.props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}>
//                 {('1' == pending) && <Spinner size="x-small" renderTitle={buttonLabel} />}
//                 {this.props.t(buttonLabel)}
//               </Button>
//               {this.props.activeIssue.recentlyUpdated &&
//                 <View margin="0 small">
//                   <IconCheckMarkLine color="success" />
//                   <View margin="0 x-small">{this.props.t('label.fixed')}</View>
//                 </View>
//               }
//             </View>
//           </Flex.Item>
//           <Flex.Item>
//             <View as="div" padding="x-small 0">
//               <Text weight="bold">{this.props.t('form.contrast_ratio')}</Text>
//               <View as="div" width="120px" margin="x-small 0" textAlign="center" padding="small 0" borderColor={ratioColor} borderWidth="small">
//                 <Text color={ratioColor} as="div" size="x-large">{this.state.contrastRatio}</Text>
//                 {(this.state.ratioIsValid) ?
//                   <View as="div" padding="x-small 0">
//                     <Text size="x-small" color={ratioColor}>{this.props.t('form.contrast.valid')}</Text>
//                   </View>
//                   :
//                   <View as="div" padding="x-small 0">
//                     <Text size="x-small" color={ratioColor}>{this.props.t('form.contrast.invalid')}</Text>
//                   </View>
//                 }
//               </View>
//             </View>
//           </Flex.Item>
//         </Flex>        
//       </View>
//     );
//   }

//   processHtml(html) {
//     let element = Html.toElement(html)

//     element.style.backgroundColor = Contrast.convertShortenedHex(this.state.backgroundColor)
//     element.style.color = Contrast.convertShortenedHex(this.state.textColor)

//     return Html.toString(element)
//   }

//   updatePreview() {
//     let issue = this.props.activeIssue
//     const html = Html.getIssueHtml(this.props.activeIssue)
//     let contrastRatio = Contrast.contrastRatio(this.state.backgroundColor, this.state.textColor)
//     let tagName = Html.toElement(html).tagName
//     let largeTextTags = this.props.t('form.contrast.large_text_tags')
//     let ratioIsValid = this.state.ratioIsValid
    
//     if(largeTextTags.includes(tagName)) {
//       ratioIsValid = (contrastRatio >= 3)
//     } else {
//       ratioIsValid = (contrastRatio >= 4.5)
//     }

//     this.setState({ contrastRatio, ratioIsValid })

//     issue.newHtml = this.processHtml(html)
//     this.props.handleActiveIssue(issue)
//   }

//   getBackgroundColor()
//   {
//     const issue = this.props.activeIssue
//     const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
//     const html = Html.getIssueHtml(this.props.activeIssue)
//     const element = Html.toElement(html)

//     if (element.style.backgroundColor) {
//       return Contrast.standardizeColor(element.style.backgroundColor)
//     }
//     else if (metadata.messageArgs) {
//       // TODO: check if 4th argument exists
//       // (Equal Access) text_contrast_sufficient: The 4th index in messageArgs is the background color
//       return metadata.messageArgs[4]
//     }
//     else {
//       return (metadata.backgroundColor) ? Contrast.standardizeColor(metadata.backgroundColor) : this.props.settings.backgroundColor
//     }
//   }

//   getTextColor()
//   {
//     const issue = this.props.activeIssue
//     const metadata = (issue.metadata) ? JSON.parse(issue.metadata) : {}
//     const html = Html.getIssueHtml(this.props.activeIssue)
//     const element = Html.toElement(html)

//     if (element.style.color) {
//       return Contrast.standardizeColor(element.style.color)
//     }
//     else if (metadata.messageArgs) {
//       // (Equal Access) text_contrast_sufficient: The 3rd index in messageArgs is the foreground color
//       return metadata.messageArgs[3]
//     }
//     else {
//       return (metadata.color) ? Contrast.standardizeColor(metadata.color) : this.props.settings.textColor
//     }
//   }
// }

