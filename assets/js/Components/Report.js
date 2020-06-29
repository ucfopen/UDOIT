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
    // TODO Fetch issues from API then set state
    fetch('http://API/route')
    .then( res => res.json())
    .then((data) => {
      this.setState({
        //Set state for the content sections
      });
    })
    .catch(console.log);
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