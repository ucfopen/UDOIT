import React from 'react'
import SortableTable from '../SortableTable'
import { View } from '@instructure/ui-view'
import { Heading } from '@instructure/ui-heading'

class IssuesTable extends React.Component {
    constructor(props) {
        super(props)

        this.headers = [
            { id: "label", text: this.props.t('label.issue') },
            { id: "type", text: this.props.t('label.issue_type')},
            { id: "active", text: this.props.t('label.active') },
            { id: "fixed", text: this.props.t('label.fixed') },
            { id: "resolved", text: this.props.t('label.resolved') },
        ];

        if (this.props.isAdmin) {
            this.headers.push({ id: "courses", text: this.props.t('label.admin.courses') })
        }

        // adding this as the last col of the table
        this.headers.push({ id: "total", text: this.props.t('label.report.total') })

        this.state = {
            tableSettings: {
                sortBy: 'total',
                ascending: false,
                pageNum: 0,
            }
        }
    }
    
    handleTableSettings = (setting) => {
        this.setState({
            tableSettings: Object.assign({}, this.state.tableSettings, setting)
        });
    }

    getContent() {
        let { issues } = this.props
        let rows = (issues) ? Object.values(issues) : []
        const { sortBy, ascending } = this.state.tableSettings
        
        rows = rows.map((row) => {
            row.label = this.props.t(`rule.label.${row.id}`)
            return row
        })

        rows.sort((a, b) => {
            if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
                return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1
            }
            else {
                return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1
            }
        })

        if (!ascending) {
            rows.reverse()
        }

        return rows
    }

    render() {
        const rows = this.getContent();

        return (
            <View as="div">
                <Heading as="h3" level="h4" margin="small 0">{this.props.t(`label.admin.report.by_issue`)}</Heading>
                <SortableTable
                    caption={this.props.t('label.admin.report.by_issue')}
                    headers={this.headers}
                    rows={rows}
                    tableSettings={this.state.tableSettings}
                    handleTableSettings={this.handleTableSettings}
                    t={this.props.t}
                />
            </View>
        )
    }
}

export default IssuesTable