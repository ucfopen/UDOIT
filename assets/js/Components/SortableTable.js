import React from 'react';
import { Table } from '@instructure/ui-table'
import { Pagination } from '@instructure/ui-pagination'
import { View } from '@instructure/ui-view'

class SortableTable extends React.Component {
    constructor (props) {
      super(props);
      this.rowsPerPage = 10;
    }
  
    handleSort = (event, { id }) => {
      const { sortBy, ascending } = this.props.tableSettings;

      if (['status', 'action'].includes(id)) {
        return;
      }

      if (id === sortBy) {
        this.props.handleTableSettings({ascending: !ascending});
      } else {
        this.props.handleTableSettings({
          ascending: true,
          sortBy: id
        });
      }
    }
  
    render() {
      const { caption, headers, rows } = this.props
      const start = (this.props.tableSettings.pageNum * this.rowsPerPage)
      const { sortBy, ascending } = this.props.tableSettings
      const direction = (ascending) ? 'ascending': 'descending'
      let pagedRows = rows.slice(start, (start + this.rowsPerPage))
      let pagination = this.renderPagination()

      return (
        <View as="div">
          <Table
            caption={caption}
            // {...this.props}
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
              {pagedRows.map((row) => (
                <Table.Row key={row.id}>
                  {headers.map(({ id, renderCell, alignText, format }) => (
                    <Table.Cell key={id} textAlign={alignText ? alignText : 'start'}>
                      {renderCell ? renderCell(row[id]) : (format) ? format(row[id]) : row[id]}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {pagination}
        </View>
      )
    }

    setPage(i) {
      this.props.handleTableSettings({pageNum: i});
    }

    renderPagination() {
      const pageCount = this.rowsPerPage && Math.ceil(this.props.rows.length / this.rowsPerPage);
      const pages = Array.from(Array(pageCount)).map((v, i) => <Pagination.Page
        key={i}
        onClick={() => this.setPage(i)}
        current={i === this.props.tableSettings.pageNum}>
        {i + 1}
      </Pagination.Page>)

      return (pageCount > 1) && (
        <Pagination
          as="nav"
          margin="small"
          variant="compact"
          labelNext="Next Page"
          labelPrev="Previous Page"
        >
          {pages}
        </Pagination>
      )
    }
  }

  export default SortableTable;