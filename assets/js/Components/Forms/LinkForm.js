import React, { useState, useEffect } from 'react'
import * as Html from '../../Services/Html'

export default function LinkForm({
  t,
  activeIssue,
  handleIssueSave,
  handleActiveIssue,
}) {

  const [textInputValue, setTextInputValue] = useState("")
  const [textInputErrors, setTextInputErrors] = useState([])
  const [deleteLink, setDeleteLink] = useState(false)

  useEffect(() => {
    let redirectLink = activeIssue.metadata
    if (redirectLink) {
      redirectLink = JSON.parse(redirectLink)
      redirectLink = redirectLink["redirect_url"]
    }
    const html = Html.getIssueHtml(activeIssue)
    setTextInputValue(redirectLink ? redirectLink : "")
    setTextInputErrors([])
    setDeleteLink(!activeIssue.newHtml && (activeIssue.status === 1))
  }, [activeIssue])

  const handleSubmit = () => {
    if (!deleteLink) {
      checkLinkNotEmpty()
    }

    if (textInputErrors.length > 0) {
      setTextInputErrors(textInputErrors)
    } else {
      let issue = activeIssue
      issue.newHtml = processHtml()
      handleIssueSave(issue)
    }
  }

  const handleInput = (event, value) => {
    setTextInputValue(value)
    checkLinkNotEmpty(value)
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }

  const handleDeleteCheckbox = (event, value) => {
    setDeleteLink(event.target.checked)
    let issue = activeIssue
    issue.newHtml = processHtml()
    handleActiveIssue(issue)
  }

  const checkLinkNotEmpty = (newTextValue) => {
    const text = newTextValue.trim().toLowerCase()
    if (text === '') {
      setTextInputErrors([{text: t('form.link.msg.link_empty'), type: 'error'}])
    }
  }

  const processHtml = () => {
    const html = Html.getIssueHtml(activeIssue)
    if (deleteLink) {
      return ''
    }
    return Html.toString(Html.prepareLink(Html.setAttribute(html, "href", textInputValue)))
  }

  return (
    <>
      <h3 className="mt-0 mb-2">{t('form.link.new_link')}</h3>
      <input className="w-100 mt-0 mb-1" type="text" value={textInputValue} onChange={handleInput} disabled={deleteLink} />
      { textInputErrors.length > 0 && (
        <div className="error-message flex-column gap-1">
          {textInputErrors.map((error, index) => (
            <div key={index} className="error-text">{error.text}</div>
          ))}
        </div>
      )}
      <div className="flex-row gap-2 mb-3">
        <input type="checkbox" name="deleteLinkCheckbox" id="deleteLinkCheckbox" checked={deleteLink} onChange={handleDeleteCheckbox} />
        <label for="deleteLinkCheckbox">{t('form.anchor.delete_link')}</label>
      </div>
      <button className="btn btn-primary" onClick={handleSubmit} disabled={textInputErrors.length > 0} >{t('form.submit')}</button>
    </>
  )
  
}


// export default class LinkForm extends React.Component {
//   constructor(props) {
//     super(props)

//     let redirectLink = this.props.activeIssue.metadata
//     if (redirectLink) {
//       redirectLink = JSON.parse(redirectLink)
//       redirectLink = redirectLink["redirect_url"]
//     }
//     const html = Html.getIssueHtml(this.props.activeIssue)

//     this.state = {
//       textInputValue: redirectLink ? redirectLink : "",
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
//       this.checkLinkNotEmpty()
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
//             renderLabel={this.props.t('form.link.new_link')}
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

//   checkLinkNotEmpty() {
//     const text = this.state.textInputValue.trim().toLowerCase()
//     if (text === '') {
//       this.formErrors.push({text: this.props.t('form.link.msg.link_empty'), type: 'error'})
//     }
//   }

//   processHtml() {
//     const html = Html.getIssueHtml(this.props.activeIssue)
//     const { textInputValue, deleteLink } = this.state

//     if (deleteLink) {
//       return '';
//     }

//     return Html.toString(Html.prepareLink(Html.setAttribute(html, "href", textInputValue)))
//   }
// }
