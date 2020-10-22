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
  
      console.log('Sort ID', id);

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
      const { sortBy, ascending } = this.props.tableSettings
      const direction = ascending ? 'ascending' : 'descending'
      
      const sortedRows = [...(rows || [])].sort((a, b) => {
        if (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) {
          return -1
        }
        if (a[sortBy].toLowerCase() > b[sortBy].toLowerCase()) {
          return 1
        }
        return 0
      });
  
      if (!ascending) {
        sortedRows.reverse();
      }

      const start = (this.props.tableSettings.pageNum * this.rowsPerPage);
      let pagedRows = sortedRows.slice(start, (start + this.rowsPerPage));
      let pagination = this.renderPagination();

      return (
        <View as="div">
          <Table
            caption={`${caption}: sorted by ${sortBy} in ${direction} order`}
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
                  {headers.map(({ id, renderCell, alignText }) => (
                    <Table.Cell key={id} textAlign={alignText ? alignText : 'start'}>
                      {renderCell ? renderCell(row[id]) : row[id]}
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