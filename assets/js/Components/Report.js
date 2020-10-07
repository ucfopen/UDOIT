import React from 'react';
import { connect } from 'react-redux';
import Issue from './Issue';
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import { setVisibilityFilter, getScanResults } from '../Actions'

const API = '';
// The report which contains all the issues found while scanning the course
class Report extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      checkBoxBool: false
    }

    this.updateVisibilityFilters = this.updateVisibilityFilters.bind(this);
  }

  componentDidMount() {
    // Do something
  }

  handleChange = () => {
    console.log(this.state);
    this.setState({
      checkBoxBool: !this.state.checkBoxBool
    }, console.log(this.state))
  }

  updateVisibilityFilters = () => {
    this.props.setVisibilityFilter({
      sections: "test",
      content: "test",
      issueTypes: "test",
      issueTitles: "test",
      status: "test",
      search_term: "test"
    })
  }


  render() {
    return (
      <div>
        {/* <TextInput
            renderLabel="Search"
            placeholder="Keyword"
            onChange={(event, value) => { console.log(value) }}>
              
            </TextInput> */}
            <Checkbox label="Medium size" value="medium" variant="toggle" checked={this.state.checkBoxBool} onChange={() => this.handleChange()}/>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setVisibilityFilter: (filter) => dispatch(setVisibilityFilter(filter)),
    getScanResults: () => dispatch(getScanResults())
  }
}

const mapStateToProps = state => {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Report);