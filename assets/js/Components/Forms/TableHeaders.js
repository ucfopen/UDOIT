import React from 'react'
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { RadioInput } from '@instructure/ui-radio-input'
import { RadioInputGroup } from '@instructure/ui-radio-input'
import { IconCheckMarkLine } from '@instructure/ui-icons'
import * as Html from '../../Services/Html';


export default class TableHeaders extends React.Component {
  constructor(props) {
    super(props)

    this.radioOptions = [
      'col',
      'row',
      'both'
    ]

    this.state = {
      selectedValue: this.getTableHeader(),
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeIssue !== this.props.activeIssue) {

      this.setState({
        selectedValue: this.getTableHeader()
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

  getTableHeader() {
    const html = Html.getIssueHtml(this.props.activeIssue)
    const table = Html.toElement(html)
    let isRow = true
    let isCol = true

    for (let rowInd in table.rows) {
      let row = table.rows[rowInd]

      for (let cellInd in row.cells) {
        let cell = row.cells[cellInd]
        if (cell.tagName === 'TD') {
          if (rowInd === '0') {
            isCol = false
          }
          if (cellInd === '0') {
            isRow = false
          }
          break
        }
      }

      if (!isRow && !isCol) {
        return ''
      }
    }

    if (isRow && isCol) {
      return 'both'
    }

    return (isRow) ? 'row' : 'col'
  }

  removeHeaders(table) {
    for (let row of table.rows) {
      for (let cell of row.cells) {
        if (cell.tagName === 'TH') {
          let newCell = Html.renameElement(cell, 'td')
          newCell.removeAttribute('scope')
          row.replaceChild(newCell, cell)
        }
      }
    }

    return table
  }

  fixHeaders() {
    const html = Html.getIssueHtml(this.props.activeIssue)
    let table = Html.toElement(html)
    const selectedValue = this.state.selectedValue

    this.removeHeaders(table)

    if ('col' === selectedValue || 'both' === selectedValue) {
      let row = table.rows[0]
      
      for (let cell of row.cells) {
        let newCell = Html.renameElement(cell, 'th')
        newCell.setAttribute('scope', 'col')
        row.replaceChild(newCell, cell)        
      }
    }

    if ('row' === selectedValue || 'both' === selectedValue) {
      for (let row of table.rows) {
        let firstCell = row.cells[0]
        let newCell = Html.renameElement(firstCell, 'th')
        newCell.setAttribute('scope', 'row')
        row.replaceChild(newCell, firstCell)
      }
    }

    return Html.toString(table)
  }

  render() {
    const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
    const buttonLabel = (pending) ? 'form.processing' : 'form.submit'
    const description = (this.props.activeIssue.scanRuleId == 'TableDataShouldHaveTableHeader') ? 'form.table.selection_description' : 'form.table.selection_description_scope'
  
    return (
      <View as="div" padding="0 x-small">
        
        <View as="div" margin="small 0">
          <RadioInputGroup 
            onChange={this.handleChange}
            name="tableHeaderSelect" 
            value={this.state.selectedValue} 
            description={this.props.t(description)} >
            {this.radioOptions.map(input => <RadioInput key={input} value={input} label={this.props.t(`form.table.${input}`)} />)}
          </RadioInputGroup>
        </View>
        
        <View as="div" margin="small 0">
          <Button color="primary" onClick={this.handleSubmit} interaction={(!pending && this.props.activeIssue.status !== 2) ? 'enabled' : 'disabled'}>
              {('1' == pending) && <Spinner size="x-small" renderTitle={this.props.t(buttonLabel)} />}
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
