import React from 'react';
import { Responsive } from '@instructure/ui-responsive'
import { Table } from '@instructure/ui-table'


class SortableTable extends React.Component {
    constructor (props) {
      super(props)
      const { headers } = props
  
      this.state = {
        sortBy: headers && headers[0] && headers[0].id,
        ascending: true,
      }
    }
  
    handleSort = (event, { id }) => {
      const { sortBy, ascending } = this.state
  
      if (id === sortBy) {
        this.setState({
          ascending: !ascending,
        })
      } else {
        this.setState({
          sortBy: id,
          ascending: true,
        })
      }
    }
  
    render() {
      const { caption, headers, rows } = this.props
      const { sortBy, ascending } = this.state
      const direction = ascending ? 'ascending' : 'descending'
      const sortedRows = [...(rows || [])].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) {
          return -1
        }
        if (a[sortBy] > b[sortBy]) {
          return 1
        }
        return 0
      })
  
      if (!ascending) {
        sortedRows.reverse()
      }
      return (
        <Responsive
          query={{
            // small: { maxWidth: '40rem' },
            large: { minWidth: '1rem' },
          }}
          props={{
            // small: { layout: 'stacked' },
            large: { layout: 'auto' },
          }}
        >
          {(props) => (
            <div>
              <Table
                caption={`${caption}: sorted by ${sortBy} in ${direction} order`}
                {...props}
              >
                <Table.Head renderSortLabel="Sort by">
                  <Table.Row>
                    {(headers || []).map(({ id, text }) => (
                      <Table.ColHeader
                        key={id}
                        id={id}
                        onRequestSort={this.handleSort}
                        sortDirection={id === sortBy ? direction : 'none'}
                      >
                        {text}
                      </Table.ColHeader>
                     ))}
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {sortedRows.map((row) => (
                    <Table.Row key={row.id}>
                      {headers.map(({ id, renderCell }) => (
                        <Table.Cell key={id}>
                          {renderCell ? renderCell(row[id]) : row[id]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Responsive>
      )
    }
  }

  export default SortableTable;