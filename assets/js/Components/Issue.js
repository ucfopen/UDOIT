import React from 'react';

class Issue extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      issueTitle: '',
      severity: '',
      description: '',
      url: '',
      sectionTitle: ''
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