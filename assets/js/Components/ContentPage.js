import React from 'react';
import classes from '../../css/contentPage.scss';
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { Table } from '@instructure/ui-table'
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'

class ContentPage extends React.Component {
  render() {
    return (
      <div>
        <div className={`${classes.summaryContainer}`}>
          <div className={`${classes.row}`}>
            <TextInput
            renderLabel="Search"
            placeholder="Keyword">
              
            </TextInput>

            <Checkbox label="Hide fixed errors" value="small" variant="toggle" size="small"/>
          </div>

          <br></br>

          <div className={`${classes.rowcentered}`}>
          <Table
            caption='Content'
            layout="auto"
            hover={true}
          >
            <Table.Head>
              <Table.Row>
                  <Table.ColHeader id="status">
                    Status
                  </Table.ColHeader>
                  <Table.ColHeader id="issue">
                    Issue
                  </Table.ColHeader>
                  <Table.ColHeader id="type">
                    Content Type
                  </Table.ColHeader>
                  <Table.ColHeader id="type">
                    Content Title
                  </Table.ColHeader>
              </Table.Row>
            </Table.Head>

            <Table.Body>

            </Table.Body>
          </Table>
          </div>
        </div>
      </div>
    )
  }
}

export default ContentPage;