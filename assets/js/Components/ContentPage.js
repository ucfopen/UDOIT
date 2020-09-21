import React from 'react';
import classes from '../../css/contentPage.scss';
import { connect } from 'react-redux';
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import SortableTable from './SortableTable'
import { getFilteredContent } from '../selectors';
import { setVisibilityFilter } from '../Actions'

class ContentPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notFixedErrorsOnly: false
    }

  }

  componentDidUpdate() {
    console.log(this.state.notFixedErrorsOnly)
  }

  toggleFixedErrors = () => {
    this.setState({
      notFixedErrorsOnly: !this.state.notFixedErrorsOnly
    }), this.toggleFixedErrorsFilter(), console.log(this.props.filteredContent)
  }

  toggleFixedErrorsFilter = () => {
    // Modify visibility filters
    let visibilityFilters = Object.assign({}, this.props.visibilityFilters);
    if(this.state.notFixedErrorsOnly === false) {
      visibilityFilters.status = ["not fixed"]
    } else {
      visibilityFilters.status = "SHOW_ALL"
    }

    this.props.setVisibilityFilter(visibilityFilters);
  }

  render() {
    const headers = [{id: "status", text: "Status"},{id: "title", text: "Issue"}, {id: "type", text: "Content Type"}, {id: "contentTitle", text: "Content Title"}, {id: "section", text: "Section"}];
    return (
      <div>
        <div className={`${classes.summaryContainer}`}>
          <div className={`${classes.row}`}>
            <TextInput
            renderLabel="Search"
            placeholder="Keyword">
              
            </TextInput>

            <Checkbox label="Hide fixed errors" value="small" variant="toggle" size="small" onChange={() => this.toggleFixedErrors()} checked={this.state.notFixedErrorsOnly}/>
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
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentPage);