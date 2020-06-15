import React from 'react';

class Issue extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      issueTitle: null,
      severity: null,
      description: null,
      url: null,
      sectionTitle: null,
      hasUFIXIT: null
    }
  }

  componentDidMount() {
    this.setState({
      issueTitle: this.props.issueTitle,
      severity: this.props.severity,
      description: this.props.description,
      url: this.props.url,
      sectionTitle: this.props.sectionTitle
    })
  }

  render() {
    return (
      <div>
        <p>{this.state.issueTitle}</p>
        <p>{this.state.severity}</p>
        <p>{this.state.description}</p>
      </div>
    )
  }
}

export default Issue;