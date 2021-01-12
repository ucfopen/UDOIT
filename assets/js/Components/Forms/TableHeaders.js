import React from 'react'
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { RadioInput } from '@instructure/ui-radio-input'
import { RadioInputGroup } from '@instructure/ui-radio-input'
import Html from '../../Services/Html';


export default class TableHeaders extends React.Component {
  constructor(props) {
    super(props)

    this.radioOptions = [
      'column',
      'row',
      'both'
    ]
    this.state = {
      selectedValue: 'column',
      replaceHeaders: (this.props.activeIssue.scanRuleId === 'TableDataShouldHaveTableHeader'),
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {

      this.setState({
        selectedValue: 'column',
        replaceHeaders: (this.props.activeIssue.scanRuleId === 'TableDataShouldHaveTableHeader'),
      })
    }
  }

  handleChange(event, value) {
    this.setState({
      selectedValue: value
    }, () => {
      let issue = this.props.activeIssue
      issue.newHtml = this.fixHeaders()
      this.props.handleActiveIssue(issue)
    })
  }

  handleSubmit() {
    let issue = this.props.activeIssue
    issue.newHtml = this.fixHeaders()
    this.props.handleIssueSave(issue)
  }

  fixHeaders() {
    const table = Html.toElement(this.props.activeIssue.sourceHtml)
    let first = true 

    switch(this.state.selectedValue) {
      case 'column':
        for (var i = 0, row; row = table.rows[i]; i++) {
          if(first) {
            for (var j = 0, col; col = row.cells[j]; j++) {
              if(this.state.replaceHeaders) {
                row.cells[j].outerHTML = Html.renameElement(row.cells[j].outerHTML, 'th').outerHTML
              }
    
              row.cells[j].outerHTML = Html.setAttribute(row.cells[j], "scope", "col").outerHTML
            }  

            first = false
          }

          else {
            if(row.cells[0].tagName === 'TH') {
              row.cells[0].outerHTML = Html.renameElement(row.cells[0].outerHTML, 'td').outerHTML
              row.cells[0].outerHTML = Html.removeAttribute(row.cells[0], 'scope').outerHTML
            }
          }
        }
        
        break

      case 'row': 
        for (var i = 0, row; row = table.rows[i]; i++) {
          if(first) {
            for (var j = 0, col; col = row.cells[j]; j++) {
              if(row.cells[j].tagName === 'TH') {
                row.cells[j].outerHTML = Html.renameElement(row.cells[j].outerHTML, 'td').outerHTML
                row.cells[j].outerHTML = Html.removeAttribute(row.cells[j], 'scope').outerHTML
              }
            }  

            first = false
          }

          if(this.state.replaceHeaders) {
            row.cells[0].outerHTML = Html.renameElement(row.cells[0].outerHTML, 'th').outerHTML
          }

          row.cells[0].outerHTML = Html.setAttribute(row.cells[0], "scope", "row").outerHTML
          
        }

        break

      case 'both':
        for (var i = 0, row; row = table.rows[i]; i++) {
          if(first) {
            for (var j = 0, col; col = row.cells[j]; j++) {
              if(this.state.replaceHeaders) {
                row.cells[j].outerHTML = Html.renameElement(row.cells[j].outerHTML, 'th').outerHTML
              }
              
              if(row.cells[j].tagName === 'TH') {
                row.cells[j].outerHTML = Html.setAttribute(row.cells[j], "scope", "col").outerHTML
              }
            }  

            first = false
          }

          else {
            if(this.state.replaceHeaders) {
              row.cells[0].outerHTML = Html.renameElement(row.cells[0].outerHTML, 'th').outerHTML
            }
  
            if(row.cells[0].tagName === 'TH') {
              row.cells[0].outerHTML = Html.setAttribute(row.cells[0], "scope", "row").outerHTML
            }
          }
        }
        break
    }

    return table.outerHTML
  }

  render() {
    const pending = (this.props.activeIssue && this.props.activeIssue.pending)
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
    const canSubmit = (!pending && !this.props.activeIssue.status)

    return (
      <View as="div" padding="0 x-small">
        {this.state.replaceHeaders &&
          <View as="div" margin="small 0">
            <RadioInputGroup onChange={this.handleChange} name="" defaultValue="foo" description={this.props.t('form.table.selection_description')}>
              {this.radioOptions.map(input => <RadioInput key={input} value={input} label={this.props.t(`form.table.${input}`)} />)}
            </RadioInputGroup>
          </View>
        }

        <View as="div" margin="small 0">
          <Button color="primary" onClick={this.handleSubmit} interaction={(canSubmit) ? 'enabled' : 'disabled'}>
              {pending && <Spinner size="x-small" renderTitle="Submit" />}
              {this.props.t(buttonLabel)}
          </Button>
        </View>
      </View>
    );
  }
}