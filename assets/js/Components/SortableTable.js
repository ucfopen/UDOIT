import React, { useState, useEffect } from 'react';
import { Table } from '@instructure/ui-table'
import { Pagination } from '@instructure/ui-pagination'
import { View } from '@instructure/ui-view'

export default function SortableTable({
  t,
  caption,
  headers,
  rows,
  tableSettings,
  handleTableSettings,
}) {

  // The tableSettings object should contain:
  // {
  //   pageNum: 0,
  //   sortBy: 'id',
  //   ascending: true,
  //   rowsPerPage: '10'
  // }

  const [rowsPerPage, setRowsPerPage] = useState((tableSettings.rowsPerPage) ? parseInt(tableSettings.rowsPerPage) : 10)
  const [start, setStart] = useState(tableSettings.pageNum * rowsPerPage)
  const [sortBy, setSortBy] = useState(tableSettings.sortBy)
  const [ascending, setAscending] = useState(tableSettings.ascending)
  const [direction, setDirection] = useState((tableSettings.ascending) ? 'ascending': 'descending')
  const [pagedRows, setPagedRows] = useState([])

  useEffect(() => {
    const rowsPerPage = (tableSettings.rowsPerPage) ? parseInt(tableSettings.rowsPerPage) : 10
    const start = tableSettings.pageNum * rowsPerPage
    setStart(start)
    setSortBy(tableSettings.sortBy)
    setAscending(tableSettings.ascending)
    setDirection((tableSettings.ascending) ? 'ascending': 'descending')
    setPagedRows(rows.slice(start, (start + rowsPerPage)))
  }
  , [tableSettings])

  const handleSort = (id) => {
    if (['status', 'action'].includes(id)) {
      return;
    }

    if (id === sortBy) {
      handleTableSettings({ascending: !ascending})
    } else {
      handleTableSettings({
        ascending: true,
        sortBy: id
      })
    }
  }

  const setPage = (newPageNum) => {
    handleTableSettings({pageNum: newPageNum});
  }

  const renderPagination = () => {
    const pageCount = rowsPerPage && Math.ceil(rows.length / rowsPerPage);
    const pages = Array.from(Array(pageCount)).map((v, i) => <Pagination.Page
      key={`page${i}`}
      onClick={() => setPage(i)}
      current={i === tableSettings.pageNum}>
      {i + 1}
    </Pagination.Page>)

    return (pageCount > 1) && (
      <Pagination
        as="nav"
        margin="small"
        variant="compact"
        labelNext={t('table.next_page')}
        labelPrev={t('table.prev_page')}
      >
        {pages}
      </Pagination>
    )
  }

  return (
    <div>
      <table>
        <caption>{caption}</caption>
        <thead aria-label={t('table.sort_by')}>
          <tr>
            {(headers || []).map(({ id, text }) => (
              (text) ? 
                <th
                  key={`header${id}`}
                  id={id}
                  onClick={() => handleSort(id)}
                  sortDirection={id === sortBy ? direction : 'none'}
                >{text}</th>
                  :
                <th key={`header${id}`} id={id} />
              ))}
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((row) => (
            <tr key={`row${row.id}`}>
              {headers.map(({ id, renderCell, alignText, format }) => (
                <td key={`row${row.id}cell${id}`} textAlign={alignText ? alignText : 'start'} onClick={(row.onClick) ? row.onClick : null}>
                  {renderCell ? renderCell(row[id]) : (format) ? format(row[id]) : <div as="div" cursor={(row.onClick) ? 'pointer' : 'auto'}>{row[id]}</div>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {renderPagination()}
    </div>
  )
}

// class SortableTable extends React.Component {
//     constructor (props) {
//       super(props);
//     }
  
//     handleSort = (event, { id }) => {
//       const { sortBy, ascending } = this.props.tableSettings;

//       if (['status', 'action'].includes(id)) {
//         return;
//       }

//       if (id === sortBy) {
//         this.props.handleTableSettings({ascending: !ascending});
//       } else {
//         this.props.handleTableSettings({
//           ascending: true,
//           sortBy: id
//         });
//       }
//     }
  
//     render() {
//       this.rowsPerPage = (this.props.rowsPerPage) ? parseInt(this.props.rowsPerPage) : 10;
//       const { caption, headers, rows } = this.props
//       const start = (this.props.tableSettings.pageNum * this.rowsPerPage)
//       const { sortBy, ascending } = this.props.tableSettings
//       const direction = (ascending) ? 'ascending': 'descending'
//       let pagedRows = rows.slice(start, (start + this.rowsPerPage))
//       let pagination = this.renderPagination()

//       return (
//         <View as="div">
//           <Table
//             caption={caption}
//             hover={true}
//           >
//             <Table.Head renderSortLabel={this.props.t('table.sort_by')}>
//               <Table.Row>
//                 {(headers || []).map(({ id, text }) => (
//                   (text) ? 
//                     <Table.ColHeader
//                       key={`header${id}`}
//                       id={id}
//                       onRequestSort={this.handleSort}
//                       textAlign="start"
//                       sortDirection={id === sortBy ? direction : 'none'}
//                     >{text}</Table.ColHeader>
//                       :
//                     <Table.ColHeader key={`header${id}`} id={id} />
//                   ))}
//               </Table.Row>
//             </Table.Head>
//             <Table.Body>
//               {pagedRows.map((row) => (
//                 <Table.Row key={`row${row.id}`}>
//                   {headers.map(({ id, renderCell, alignText, format }) => (
//                     <Table.Cell key={`row${row.id}cell${id}`} textAlign={alignText ? alignText : 'start'} onClick={(row.onClick) ? row.onClick : null}>
//                       {renderCell ? renderCell(row[id]) : (format) ? format(row[id]) : <View as="div" cursor={(row.onClick) ? 'pointer' : 'auto'}>{row[id]}</View>}
//                     </Table.Cell>
//                   ))}
//                 </Table.Row>
//               ))}
//             </Table.Body>
//           </Table>
//           {pagination}
//         </View>
//       )
//     }

//     setPage(i) {
//       this.props.handleTableSettings({pageNum: i});
//     }

//     renderPagination() {
//       const pageCount = this.rowsPerPage && Math.ceil(this.props.rows.length / this.rowsPerPage);
//       const pages = Array.from(Array(pageCount)).map((v, i) => <Pagination.Page
//         key={`page${i}`}
//         onClick={() => this.setPage(i)}
//         current={i === this.props.tableSettings.pageNum}>
//         {i + 1}
//       </Pagination.Page>)

//       return (pageCount > 1) && (
//         <Pagination
//           as="nav"
//           margin="small"
//           variant="compact"
//           labelNext={this.props.t('table.next_page')}
//           labelPrev={this.props.t('table.prev_page')}
//         >
//           {pages}
//         </Pagination>
//       )
//     }
//   }

//   export default SortableTable;