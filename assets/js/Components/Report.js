import React from 'react';
import { connect } from 'react-redux';
import getScanResults from '../Actions'
import Issue from './Issue';

const API = '';
// The report which contains all the issues found while scanning the course
class Report extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Do something
    this.props.getScanResults();
  }

  render() {
    return (
      <div>
          {this.props.issueList.map(x => <Issue key={x.id}
            title={x.title}
            description={x.description}s
            severity={x.severity}
            />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    issueList: state.issueList
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getScanResults: () => dispatch(getScanResults()),
    
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Report);