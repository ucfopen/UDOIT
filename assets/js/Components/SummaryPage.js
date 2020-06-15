import React from 'react';

const API = '';

class SummaryPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      issueList: []
    }
  }

  componentDidMount() {
    // TODO Fetch issues from API then set state

    //this.setState({
      // Set state
    //});
  }

  render() {
    return (
      <div>
        <p>Summary Page</p>
      </div>
    )
  }
}

export default SummaryPage;