import React from 'react';
import classes from '../../css/contentPage.scss';
import { Heading } from '@instructure/ui-elements';
import { Button } from '@instructure/ui-buttons'
import { Table } from '@instructure/ui-table'
import { TextInput } from '@instructure/ui-text-input'

class ContentPage extends React.Component {
  render() {
    return (
      <div>
        <div className={`${classes.summaryContainer}`}>
          <div className={`${classes.summaryContainer}`}>
            <TextInput
            renderLabel="Search"
            placeholder="Keyword">
              
            </TextInput>
          </div>
        </div>
      </div>
    )
  }
}

export default ContentPage;