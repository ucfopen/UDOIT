import React from 'react';

class Reports extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      reports: []
    }
  }

  componentDidMount() {
    // TODO Fetch issues from API then set state
    fetch('http://API/route')
    .then( res => res.json())
    .then((data) => {
      this.setState({
        reports: data
      });
    })
    .catch(console.log);
  }

  render() {
    return (
      <div>
        <p>Summary Page</p>
      </div>
    )
  }
}

export default Reports;