import React from 'react';

// The main UDOIT issue class
class Issue extends React.Component {
  
  constructor(props) {
    super(props);

    this.state = {
      id: null,
      issueTitle: null,
      severity: null,
      description: null,
      type: null,
      url: null,
      sectionTitle: null,
      hasUFIXIT: null,
      sourceHtml: null
    }
  }

  componentDidMount() {
    this.setState({
      severity: this.props.severity,
      description: this.props.description,
      title: this.props.title
    })
  }

  render() {
    return (
      <div>
        <p>{this.state.title}</p>
        <p>{this.state.severity}</p>
        <p>{this.state.description}</p>
      </div>
    )
  }
}

export default Issue;