import React from 'react';
import classes from '../../css/contentPage.scss';
import { connect } from 'react-redux';
import { TextInput } from '@instructure/ui-text-input'
import { Checkbox } from '@instructure/ui-checkbox'
import SortableTable from './SortableTable'
import { getFilteredContent } from '../selectors';

class ContentPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fixedErrorsOnly: false
    }

  }

  toggleFixedErrors = () => {
    this.setState({
      fixedErrorsOnly: !this.state.fixedErrorsOnly
    }), () => {
      // Modify visibility filters
    }
  }

  render() {
    const headers = [{id: "status", text: "Status"},{id: "title", text: "Issue"}, {id: "type", text: "Content Type"}, {id: "contentTitle", text: "Content Title"}];
    return (
      <div>
        <div className={`${classes.summaryContainer}`}>
          <div className={`${classes.row}`}>
            <TextInput
            renderLabel="Search"
            placeholder="Keyword">
              
            </TextInput>

            <Checkbox label="Hide fixed errors" value="small" variant="toggle" size="small" onChange={() => this.toggleFixedErrors()} checked={this.state.fixedErrorsOnly}/>
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