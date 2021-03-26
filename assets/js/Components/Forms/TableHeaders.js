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
      'col',
      'row',
      'both'
    ]

    this.state = {
      selectedValue: 'col',
      replaceHeaders: (this.props.activeIssue.scanRuleId === 'TableDataShouldHaveTableHeader'),
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {

      this.setState({
        selectedValue: 'col',
        replaceHeaders: (this.props.activeIssue.scanRuleId === 'TableDataShouldHaveTableHeader'),
      })
    }
  }

  handleChange(event, value) {
    this.setState({
      selectedValue: value
    }, () => {
      let issue = this.props.activeIssue
      issue.newHtml = (this.state.replaceHeaders) ? this.fixHeaders() : this.addScope(this.props.activeIssue.sourceHtml, this.state.selectedValue)
      this.props.handleActiveIssue(issue)
    })
  }

  handleSubmit() {
    let issue = this.props.activeIssue
    issue.newHtml = (this.state.replaceHeaders) ? this.fixHeaders() : this.addScope(this.props.activeIssue.sourceHtml, this.state.selectedValue)
    this.props.handleIssueSave(issue)
  }

  addScope(html, scope) {
    return Html.setAttribute(html, "scope", scope).outerHTML
  }

  fixHeaders() {
    const table = Html.toElement(this.props.activeIssue.sourceHtml)
    let first = true 

    switch(this.state.selectedValue) {
      case 'col':
        for (var i = 0, row; row = table.rows[i]; i++) {
          if(first) {
            for (var j = 0, col; col = row.cells[j]; j++) {
              if(this.state.replaceHeaders) {
                row.cells[j].outerHTML = Html.renameElement(row.cells[j].outerHTML, 'th').outerHTML
              }

              row.cells[j].outerHTML = this.addScope(row.cells[j], "col")
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

          row.cells[0].outerHTML = this.addScope(row.cells[0], "row")
          
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
                row.cells[j].outerHTML = this.addScope(row.cells[j], "col")
              }
            }  

            first = false
          }

          else {
            if(this.state.replaceHeaders) {
              row.cells[0].outerHTML = Html.renameElement(row.cells[0].outerHTML, 'th').outerHTML
            }
  
            if(row.cells[0].tagName === 'TH') {
              row.cells[0].outerHTML = this.addScope(row.cells[0], "row")
            }
          }
        }
        break
    }

    return table.outerHTML
  }

  render() {
    const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
    const radioOptions = this.state.replaceHeaders ? this.radioOptions : this.radioOptions.slice(0, 2);

    return (
      <View as="div" padding="0 x-small">
        
        <View as="div" margin="small 0">
          <RadioInputGroup onChange={this.handleChange} name="" defaultValue="foo" 
          description={this.state.replaceHeaders ? this.props.t('form.table.selection_description') : this.props.t('form.table.selection_description_scope')}>
            {radioOptions.map(input => <RadioInput key={input} value={input} label={this.props.t(`form.table.${input}`)} />)}
          </RadioInputGroup>
        </View>
        
        <View as="div" margin="small 0">
          <Button color="primary" onClick={this.handleSubmit} interaction={(!pending) ? 'enabled' : 'disabled'}>
              {('1' == pending) && <Spinner size="x-small" renderTitle={this.props.t(buttonLabel)} />}
              {this.props.t(buttonLabel)}
          </Button>
        </View>
      </View>
    );
  }
}