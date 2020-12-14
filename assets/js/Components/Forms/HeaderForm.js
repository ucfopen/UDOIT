import React from 'react'
import { Checkbox } from '@instructure/ui-checkbox';
import { View } from '@instructure/ui-view'
import { TextArea } from '@instructure/ui-text-area'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { SimpleSelect } from '@instructure/ui-simple-select'
import Html from '../../Services/Html';


export default class HeaderForm extends React.Component {
    constructor(props) {
        super(props)

        let element = Html.toElement(this.props.activeIssue.sourceHtml)

        this.tagName = Html.getTagName(element)

        this.state = {
            textInputValue: element.innerHTML,
            selectedValue: (this.tagName === 'P') ? 'H1' : this.tagName,
            removeBold: false
        }

        this.formErrors = []

        this.handleInput = this.handleInput.bind(this)
        this.handleSelect = this.handleSelect.bind(this)
        this.handleButton = this.handleButton.bind(this)
        this.handleCheckbox = this.handleCheckbox.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.activeIssue !== this.props.activeIssue) {
            const html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml
            let element = Html.toElement(html)
            this.tagName = Html.getTagName(element)
        
            this.setState({
                textInputValue: element.innerHTML,
                selectedValue: (this.tagName === 'P') ? 'H1' : this.tagName,
                removeBold: false
            })
        }
    }

    handleCheckbox() {
        this.setState({
            removeBold: !this.state.removeBold
        })
    }

    handleInput(event) {
        console.log(event.target.value)

        this.setState({
            textInputValue: event.target.value
        })
    }

    handleSelect = (e, { id, value }) => {
        this.setState({ selectedValue: value })

        console.log(value)
    }

    handleButton() {
        let newHeader = document.createElement(this.state.selectedValue)
        newHeader.innerHTML = this.state.textInputValue

        this.formErrors = []

        this.checkTextNotEmpty()

        if (this.formErrors.length > 0) {
            this.setState({ textInputErrors: this.formErrors })
          } else {
            if(this.state.removeBold) {
                newHeader = Html.removeTag(newHeader, 'strong')
                newHeader = Html.removeTag(newHeader, 'b')
            }
    
            console.log(newHeader)
            let issue = this.props.activeIssue
            issue.newHtml = Html.toString(newHeader)
    
            this.props.handleIssueSave(issue)
        }
    }

    checkTextNotEmpty() {
        const text = this.state.textInputValue.trim().toLowerCase()
        if (text === '') {
          this.formErrors.push({ text: this.props.t('form.header.msg.text_empty'), type: 'error' })
        }
    }

    render() {
        const options = this.props.t('form.header.heading_level_options')
        const pending = (this.props.activeIssue && this.props.activeIssue.pending)
        const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
        const canSubmit = (!pending && !this.props.activeIssue.status)

        return (
            <View as="div" padding="x-small">
                <View>
                    <TextArea
                    label={this.props.t('form.header.text')}
                    display="inline-block"
                    width="100%"
                    onChange={this.handleInput}
                    value={this.state.textInputValue}
                    id="textInputValue"
                    messages={this.formErrors}
                    />
                </View>
                <View as="div" margin="small 0">
                    <View as="span" display="inline-block" margin="small" padding="small">
                        <SimpleSelect
                        renderLabel={this.props.t('form.header.heading_level')}
                        assistiveText={this.props.t('form.header.assistive_text')}
                        value={this.state.selectedValue}
                        onChange={this.handleSelect}
                        width="100%"
                        >
                            {options.map((opt, index) => (
                                <SimpleSelect.Option
                                key={index}
                                id={`opt-${index}`}
                                value={opt}
                                >
                                { opt }
                                </SimpleSelect.Option>
                            ))}

                        </SimpleSelect>
                    </View>
    
                    <View as="span" display="inline-block" margin="small" padding="small">
                        <Checkbox label={this.props.t('form.header.remove_bold')} onChange={this.handleCheckbox} checked={this.state.removeBold}/>
                    </View>
                </View>
                <View as="div" margin="small 0">
                    <Button color="primary" onClick={this.handleButton} interaction={(canSubmit) ? 'enabled' : 'disabled'}>
                        {pending && <Spinner size="x-small" renderTitle={buttonLabel} />}
                        {this.props.t(buttonLabel)}
                    </Button>
                </View>
            </View>
        );
    }

}