import React from 'react'
import { Checkbox } from '@instructure/ui-checkbox';
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { SimpleSelect } from '@instructure/ui-simple-select'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import Html from '../../Services/Html';


export default class HeadingStyleForm extends React.Component {
    constructor(props) {
        super(props)

        const html = Html.getIssueHtml(this.props.activeIssue)

        let element = Html.toElement(html)
        this.tagName = Html.getTagName(element)
        this.styleTags = ["STRONG", "B", "I", "EM", "MARK", "SMALL", "DEL", "INS", "SUB", "SUP"]

        this.state = {
            selectedValue: (this.tagName.startsWith('H')) ? this.tagName : '',
            removeStyling: !this.hasStyling(),
            textInputErrors: []
        }

        this.formErrors = []

        this.handleSelect = this.handleSelect.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCheckbox = this.handleCheckbox.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.activeIssue !== this.props.activeIssue) {
            let html = (this.props.activeIssue.newHtml) ? this.props.activeIssue.newHtml : this.props.activeIssue.sourceHtml
            
            if (this.props.activeIssue.status === '1') {
                html = this.props.activeIssue.newHtml
            }

            let element = Html.toElement(html)
            this.tagName = Html.getTagName(element)
        
            this.setState({
                selectedValue: (this.tagName.startsWith('H')) ? this.tagName : '',
                removeStyling: !this.hasStyling(),
                textInputErrors: []
            })

            this.formErrors = []
        }
    }

    handleCheckbox() {
        this.setState({
            removeStyling: !this.state.removeStyling
        }, () => {
            let issue = this.props.activeIssue
            issue.newHtml = this.processHtml()
            this.props.handleActiveIssue(issue)
        })
    }
    
    handleSelect = (e, { id, value }) => {
        this.formErrors = []

        this.setState({ selectedValue: value }, () => {
            let issue = this.props.activeIssue
            issue.newHtml = this.processHtml()
            this.props.handleActiveIssue(issue)
        })
    }

    handleSubmit() {
        this.formErrors = []

        if(!this.state.removeStyling) {
            this.checkSelectNotEmpty()
        }
        

        if (this.formErrors.length > 0) {
            this.setState({ textInputErrors: this.formErrors })
        } 
        else {
            this.setState({ textInputErrors: []})
            this.props.handleIssueSave(this.props.activeIssue)
        }
    }

    checkSelectNotEmpty() {
        if (this.state.selectedValue === '' && !this.state.removeStyling) {
          this.formErrors.push({ text: this.props.t('form.heading.msg.select_heading'), type: 'error' })
        }
    }

    processHtml() {
        let newHeader
        const html = Html.getIssueHtml(this.props.activeIssue)
        const element = Html.toElement(html)

        if (this.state.selectedValue) {
            newHeader = document.createElement(this.state.selectedValue)
            newHeader.innerHTML = element.innerHTML

            for (let styleTag of this.styleTags) {
                newHeader = Html.removeTag(newHeader, styleTag)
            }
        }
        else {
            newHeader = Html.toElement(this.props.activeIssue.sourceHtml)

            if (this.state.removeStyling) {
                for (let styleTag of this.styleTags) {
                    newHeader = Html.removeTag(newHeader, styleTag)
                }
            }
        }

        return Html.toString(newHeader)
    }

    hasStyling() {
        const html = Html.getIssueHtml(this.props.activeIssue)
        let element = Html.toElement(html)

        for (const styleTag of this.styleTags) {
            if (Html.hasTag(element, styleTag)) {
                return true
            }
        }

        return false
    }

    render() {
        const options = this.props.t('form.heading.heading_level_options')
        const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
        const buttonLabel = (pending) ? 'form.processing' : 'form.submit'

        return (
            <View as="div" padding="x-small">
                <View as="div" margin="small 0">
                    <SimpleSelect
                    renderLabel={this.props.t('form.heading.heading_level')}
                    assistiveText={this.props.t('form.heading.assistive_text')}
                    value={this.state.selectedValue}
                    onChange={this.handleSelect}
                    messages={this.formErrors}
                    width="100%"
                    >
                        <SimpleSelect.Option
                            key="opt-empty"
                            id="opt-empty"
                            value=""
                        >
                            -- Choose --
                        </SimpleSelect.Option>
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

                <View as="div" margin="small 0">
                    <Checkbox label={this.props.t('form.heading.remove_styling')} 
                        onChange={this.handleCheckbox} 
                        checked={this.state.removeStyling}
                        />
                </View>
                <View as="div" margin="small 0">
                    <Button color="primary" onClick={this.handleSubmit} interaction={(!pending) ? 'enabled' : 'disabled'}>
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