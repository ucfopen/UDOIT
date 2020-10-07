import React from 'react';
import { connect } from 'react-redux';
import Issue from './Issue';
import { TextInput } from '@instructure/ui-text-input'

const API = '';
// The report which contains all the issues found while scanning the course
class Report extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Do something
  }

  render() {
    return (
      <div>
        <TextInput
            renderLabel="Search"
            placeholder="Keyword"
            onChange={(event, value) => { console.log(value) }}>
              
            </TextInput>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
  }
}

export default connect(
  mapStateToProps,
)(Report);