import React from 'react';
import classes from '../../css/contentPage.scss';
import { connect } from 'react-redux';
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import SortableTable from './SortableTable'
import { getFilteredContent } from '../selectors';
import { setVisibilityFilter, getScanResults } from '../Actions'

class ContentPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notFixedErrorsOnly: false,
      textInputValue: ""
    }

  }

  componentDidUpdate() {
    console.log(this.state.notFixedErrorsOnly)
    console.log(this.props.filteredContent)
  }

  toggleFixedErrors = () => {
    this.setState({
      notFixedErrorsOnly: !this.state.notFixedErrorsOnly
    }), this.toggleFixedErrorsFilter(), console.log(this.props.filteredContent)
  }

  toggleFixedErrorsFilter = () => {
    // Modify visibility filters
    let visibilityFilters = Object.assign({}, this.props.visibilityFilters);
    // let visibilityFilters = this.props.visibilityFilters;
    if(this.state.notFixedErrorsOnly === false) {
      visibilityFilters.status = ["Not Fixed"]
    } else {
      visibilityFilters.status = "SHOW_ALL"
    }

    this.props.setVisibilityFilter(visibilityFilters);
  }

  handleTextChange = (e) => {
    console.log(e.target.value)
    // Modify visibility filters
    let visibilityFilters = Object.assign({}, this.props.visibilityFilters);
    visibilityFilters.search_term = e.target.value;
    
    let previousState = Object.assign({}, this.state)
    previousState.textInputValue = e.target.value;

    this.setState(previousState)
    
    // // Set search term filter
    this.props.setVisibilityFilter(visibilityFilters);
  };

  render() {
    const headers = [{id: "status", text: "Status"},{id: "scanRuleId", text: "Issue"}, {id: "contentType", text: "Content Type"}, {id: "contentTitle", text: "Content Title"}, {id: "type", text: "Severity"}];
    return (
      <div>
        <div className={`${classes.summaryContainer}`}>
          <div className={`${classes.row}`}>
            <TextInput
            renderLabel="Search"
            placeholder="Keyword"
            value={this.state.textInputValue}
            onChange={this.handleTextChange}>
              
            </TextInput>

            <Checkbox label="Hide fixed issues" value="small" variant="toggle" size="small" onChange={() => this.toggleFixedErrors()}/>
          </div>

          <br></br>

          <div className={`${classes.row}`}>
            <SortableTable
            caption="Filtered content"
            headers = {headers}
            rows = {this.props.filteredContent}
            >
            </SortableTable>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    filteredContent: getFilteredContent(state),
    visibilityFilters: state.visibilityFilters,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setVisibilityFilter: (filter) => dispatch(setVisibilityFilter(filter)),
    getScanResults: () => dispatch(getScanResults())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPage);