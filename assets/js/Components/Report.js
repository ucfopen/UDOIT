import React from 'react';

const API = '';
// The report which contains all the issues found while scanning the course
class Report extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: null,
      createdAt: null,
      errors: null,
      suggestions: null,
      sections: {
        announcements: [],
        assignments: [],
        discussions: [],
        files: [],
        pages: [],
        syllabus: [],
        moduleUrls: []
      }
    }
  }

  componentDidMount() {
    // TODO Fetch report using ID from DB

    list = [
      
    ]

    //this.setState({
      // Set state
    //});
  }

  render() {
    return (
      <div>
        <p>Report</p>
      </div>
    )
  }
}

export default Report;