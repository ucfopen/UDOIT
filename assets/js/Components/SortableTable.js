import React from 'react';
import { Table } from '@instructure/ui-table'
import { Pagination } from '@instructure/ui-pagination'
import { View } from '@instructure/ui-view'

class SortableTable extends React.Component {
    constructor (props) {
      super(props);
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
      this.rowsPerPage = (this.props.rowsPerPage) ? this.props.rowsPerPage : 10;
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
            hover={true}
          >
            <Table.Head renderSortLabel={this.props.t('table.sort_by')}>
              <Table.Row>
                {(headers || []).map(({ id, text }) => (
                  (text) ? 
                    <Table.ColHeader
                      key={`header${id}`}
                      id={id}
                      onRequestSort={this.handleSort}
                      textAlign="start"
                      sortDirection={id === sortBy ? direction : 'none'}
                    >{text}</Table.ColHeader>
                      :
                    <Table.ColHeader key={`header${id}`} id={id} />
                  ))}
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {pagedRows.map((row) => (
                <Table.Row key={`row${row.id}`}>
                  {headers.map(({ id, renderCell, alignText, format }) => (
                    <Table.Cell key={`row${row.id}cell${id}`} textAlign={alignText ? alignText : 'start'} onClick={(row.onClick) ? row.onClick : null}>
                      {renderCell ? renderCell(row[id]) : (format) ? format(row[id]) : <View as="div" cursor={(row.onClick) ? 'pointer' : 'auto'}>{row[id]}</View>}
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
        key={`page${i}`}
        onClick={() => this.setPage(i)}
        current={i === this.props.tableSettings.pageNum}>
        {i + 1}
      </Pagination.Page>)

      return (pageCount > 1) && (
        <Pagination
          as="nav"
          margin="small"
          variant="compact"
          labelNext={this.props.t('table.next_page')}
          labelPrev={this.props.t('table.prev_page')}
        >
          {pages}
        </Pagination>
      )
    }
  }

  export default SortableTable;