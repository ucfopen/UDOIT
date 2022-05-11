import React from 'react'
import { Checkbox } from '@instructure/ui-checkbox';
import { View } from '@instructure/ui-view'
import { TextInput } from '@instructure/ui-text-input'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import * as Html from '../../Services/Html';


export default class HeadingEmptyForm extends React.Component {
    constructor(props) {
        super(props)
        let html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml

        if (this.props.activeIssue.status === '1') {
            html = this.props.activeIssue.newHtml
        }

        let element = Html.toElement(html)

        this.state = {
            textInputValue: (element) ? element.innerText : '',
            deleteHeader: (!element && (this.props.activeIssue.status === '1')),
            textInputErrors: []
        }

        this.formErrors = []

        this.handleTextInput = this.handleTextInput.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCheckbox = this.handleCheckbox.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.activeIssue !== this.props.activeIssue) {
            let html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml

            if (this.props.activeIssue.status === 1) {
                html = this.props.activeIssue.newHtml
            }

            let element = Html.toElement(html)
        
            this.setState({
                textInputValue: (element) ? element.innerText : '',
                deleteHeader: (!element && (this.props.activeIssue.status === 1)),
            })

            this.formErrors = []
        }
    }


    handleCheckbox() {
        this.setState({
            deleteHeader: !this.state.deleteHeader
        }, () => {
            let issue = this.props.activeIssue
            issue.newHtml = this.processHtml()
            this.props.handleActiveIssue(issue)
        })
    }

    handleTextInput(event) {
        this.setState({
            textInputValue: event.target.value
        }, () => {
            let issue = this.props.activeIssue
            issue.newHtml = this.processHtml()
            this.props.handleActiveIssue(issue)
        })
    }

    handleSubmit() {
        this.formErrors = []

        if(!this.state.deleteHeader) {
            this.checkTextNotEmpty()
        }
        

        if (this.formErrors.length > 0) {
            this.setState({ textInputErrors: this.formErrors })
        } 
        
        else {
            this.setState({ textInputErrors: []})
            let issue = this.props.activeIssue
            issue.newHtml = this.processHtml()
            console.log(issue.newHtml)
            this.props.handleIssueSave(issue)
        }
    }

    checkTextNotEmpty() {
        const text = this.state.textInputValue.trim().toLowerCase()
        if (text === '') {
          this.formErrors.push({ text: this.props.t('form.heading.msg.text_empty'), type: 'error' })
        }
    }

    processHtml() {
        const html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml
        const { textInputValue, deleteHeader } = this.state

        if (deleteHeader) {
            return '';
        }

        return Html.toString(Html.setInnerText(html, textInputValue))
    }

    render() {
        const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
        const buttonLabel = (pending) ? 'form.processing' : 'form.submit'

        return (
            <View as="div" padding="x-small">
                <View>
                    <TextInput
                        renderLabel={this.props.t('form.heading.text')}
                        display="inline-block"
                        width="100%"
                        onChange={this.handleTextInput}
                        value={this.state.textInputValue}
                        id="textInputValue"
                        messages={this.formErrors}
                        interaction={(this.state.deleteHeader) ? 'disabled' : 'enabled'}
                        /> 
                </View>
                <View as="div" margin="x-small 0">
                    <View as="span" display="inline-block">
                        <Checkbox label={this.props.t('form.heading.remove_header')} onChange={this.handleCheckbox} checked={this.state.deleteHeader}/>
                    </View>
                </View>
                <View as="div" margin="small 0">
                    <Button color="primary" onClick={this.handleSubmit} interaction={(!pending && this.props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}>
                        {pending && <Spinner size="x-small" renderTitle={buttonLabel} />}
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

}
