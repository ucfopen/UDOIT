import React from 'react';
import { connect } from 'react-redux';
import Issue from './Issue';
import { getCountsFromSection } from '../selectors'
import { getIssuesFromSection } from '../selectors'

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
    issueList: getIssuesFromSection(state, "announcements")[0].issues,
    counts: getCountsFromSection(state, "announcements")
  }
}

export default connect(
  mapStateToProps,
)(Report);