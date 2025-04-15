import React, {useState, useEffect} from 'react'
import * as Html from '../../Services/Html'

export default function AnchorText({
  t,
  settings,
  activeIssue,
  handleIssueSave,
  addMessage,
  handleActiveIssue,
}) {
  const maxLength = 150

  const [textInputValue, setTextInputValue] = useState("")
  const [textInputErrors, setTextInputErrors] = useState([])
  const [deleteLink, setDeleteLink] = useState(false)

  useEffect(() => {
    const html = Html.getIssueHtml(activeIssue)
    const initialText = Html.getInnerText(html)
    setTextInputValue(initialText)
    textHasErrors(initialText)
    setDeleteLink(!activeIssue.newHtml && (activeIssue.status === 1))
  }, [activeIssue])

  useEffect(() => {
    if (deleteLink) {
      setTextInputErrors([])
    }
    else {
      textHasErrors(textInputValue)
    }
  }, [textInputValue, deleteLink])

  const handleSubmit = () => {
    if(!deleteLink && textInputErrors.length > 0) {
      return
    }
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleIssueSave(issue)
  }

  const textHasErrors = (newText) => {
    let textErrors = []
    if(!isTextDescriptive(newText)) {
      textErrors.push({ text: t('form.anchor.msg.text_descriptive'), type: 'error' })
    }
    if(!isTextNotEmpty(newText)) {
      textErrors.push({text: t('form.anchor.msg.text_empty'), type: 'error'})
    }
    setTextInputErrors(textErrors)
    if(textErrors.length > 0) {
      return true
    }
    return false
  }

  const isTextDescriptive = (value) => {
    const text = value.trim().toLowerCase()
    const badOptions = [
      'click',
      'click here',
      'more',
      'here',
    ]
    if (badOptions.includes(text)) {
      return false
    }
    return true
  }

  const isTextNotEmpty = (value) => {
    const text = value.trim().toLowerCase()
    if (text === '') {
      return false
    }
    return true
  }

  const handleInput = (event) => {
    const value = event.target.value
    setTextInputValue(value)

    let issue = activeIssue
    issue.newHtml = processHtml(value)
    handleActiveIssue(issue)
  }

  const handleDeleteCheckbox = (event) => {
    const checked = event.target.checked
    setDeleteLink(checked)
    let issue = activeIssue
    if(checked) {
      issue.newHtml = processHtml('')
    }
    else {
      issue.newHtml = processHtml(textInputValue)
    }
    handleActiveIssue(issue)
  }
  
  const processHtml = (innerText = null) => {
    const html = Html.getIssueHtml(activeIssue)
    if(innerText !== null) {
      return Html.toString(Html.setInnerText(html, innerText))
    }
    if(deleteLink) {
      return ''
    }
    return Html.toString(Html.setInnerText(html, textInputValue))
  }

  return (
    <>
      <label for="linkTextInput" className="mt-0 mb-2">{t('form.anchor.link_text')}</label>
      <input name="linkTextInput" id="linkTextInput" className="w-100 mt-2 mb-2" type="text" value={textInputValue} onChange={handleInput} disabled={deleteLink} />
      { textInputErrors.length > 0 && (
        <div className="error-message flex-column">
          {textInputErrors.map((error, index) => (
            <div key={index} className="error-text mb-2 flex-row justify-content-end">{error.text}</div>
          ))}
        </div>
      )}
      <div className="flex-row gap-1 mt-2 mb-3">
        <input type="checkbox" name="deleteLinkCheckbox" id="deleteLinkCheckbox" checked={deleteLink} onChange={handleDeleteCheckbox} />
        <label for="deleteLinkCheckbox">{t('form.anchor.delete_link')}</label>
      </div>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={!deleteLink && textInputErrors.length > 0}>{t('form.submit')}</button>
    </>
  )
}

// export default class AnchorText extends React.Component {
//   constructor(props) {
//     super(props)
  
//     const html = Html.getIssueHtml(this.props.activeIssue)

//     this.state = {
//       textInputValue: Html.getInnerText(html),
//       textInputErrors: [],
//       deleteLink: (!props.activeIssue.newHtml && (props.activeIssue.status === 1)), // newHtml is empty (deleted) and status is fixed
//     }

//     this.formErrors = []

//     this.handleSubmit = this.handleSubmit.bind(this)
//     this.handleInput = this.handleInput.bind(this)
//     this.handleDeleteCheckbox = this.handleDeleteCheckbox.bind(this)
//   }

//   componentDidUpdate(prevProps, prevState) {
//     if (prevProps.activeIssue !== this.props.activeIssue) {
//       const html = Html.getIssueHtml(this.props.activeIssue)
//       this.setState({
//         textInputValue: Html.getInnerText(html),
//         textInputErrors: [],
//         deleteLink: (!this.props.activeIssue.newHtml && (this.props.activeIssue.status === 1)),
//       })
//     }
//   }

//   handleSubmit() {
//     this.formErrors = []

//     if (!this.state.deleteLink) {
//       this.checkTextNotEmpty()
//       this.checkTextDescriptive()
//     }

//     if (this.formErrors.length > 0) {
//       this.setState({ textInputErrors: this.formErrors })
//     }
//     else {
//       let issue = this.props.activeIssue
//       issue.newHtml = this.processHtml()
//       this.props.handleIssueSave(issue)
//     }
//   }

//   handleInput(event, value) {
//     this.setState({
//       textInputValue: value
//     }, () => {
//       let issue = this.props.activeIssue
//       issue.newHtml = this.processHtml()
//       this.props.handleActiveIssue(issue)
//     })
//   }

//   handleDeleteCheckbox(event, value) {
//     this.setState({
//       deleteLink: event.target.checked
//     }, () => {
//       let issue = this.props.activeIssue
//       issue.newHtml = this.processHtml()
//       this.props.handleActiveIssue(issue)
//     })  
//   }

//   render() {
//     const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
//     const buttonLabel = (pending) ? 'form.processing' : 'form.submit'

//     return (
//       <View as="div" padding="x-small">
//         <View as="div">
//           <TextInput
//             renderLabel={this.props.t('form.anchor.link_text')}
//             display="inline-block"
//             width="100%"
//             onChange={this.handleInput}
//             value={this.state.textInputValue}
//             id="textInputValue"
//             interaction={this.state.deleteLink ? 'disabled' : null}
//             messages={this.state.textInputErrors}
//           />
//           <View as="div" margin="small 0">
//             <Checkbox label={this.props.t('form.anchor.delete_link')} checked={this.state.deleteLink} onChange={this.handleDeleteCheckbox} />
//           </View>
//         </View>
//         <View as="div" margin="small 0">
//           <Button color="primary" onClick={this.handleSubmit} interaction={(!pending && this.props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}>
//             {('1' == pending) && <Spinner size="x-small" renderTitle={this.props.t(buttonLabel)} />}
//             {this.props.t(buttonLabel)}
//           </Button>
//           {this.props.activeIssue.recentlyUpdated &&
//             <View margin="0 small">
//               <IconCheckMarkLine color="success" />
//               <View margin="0 x-small">{this.props.t('label.fixed')}</View>
//             </View>
//           }
//         </View>
//       </View>
//     );
//   }

//   checkTextDescriptive() {
//     const text = this.state.textInputValue.trim().toLowerCase()
//     const badOptions = [
//       'click',
//       'click here',
//       'more',
//       'here',
//     ]
//     if (badOptions.includes(text)) {
//       this.formErrors.push({ text: this.props.t('form.anchor.msg.text_descriptive'), type: 'error' })
//     }
//   }

//   checkTextNotEmpty() {
//     const text = this.state.textInputValue.trim().toLowerCase()
//     if (text === '') {
//       this.formErrors.push({text: this.props.t('form.anchor.msg.text_empty'), type: 'error'})
//     }
//   }

//   processHtml() {
//     const html = Html.getIssueHtml(this.props.activeIssue)
//     const { textInputValue, deleteLink } = this.state
    
//     if (deleteLink) {
//       return '';
//     }

//     return Html.toString(Html.setInnerText(html, textInputValue))
//   }
// }
