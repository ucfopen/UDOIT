import React from 'react';
import Issue from '../Components/Issue';

const API = '';

// This class represents a piece of content such as a specific page, assignment, etc
class ContentPiece extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: null,
      title: null,
      url: null,
      issues: []
    }
  }

  componentDidMount() {
    // TODO Fetch issues from API then set state

    // The list of issues for the piece of content
    var data = [
        {
            "id": 12345,
            "scanRuleId": "Scan Rule Id",
            "title": "Issue Title",
            "description": "Issue Description",
            "type": "error",
            "uFixIt": true,
            "sourceHtml": "<div>Source HTML</div>"
        },
        {
            "id": 23456,
            "title": "Issue Title",
            "scanRuleId": "Scan Rule Id",
            "description": "Issue Description",
            "type": "suggestion",
            "uFixIt": false,
            "sourceHtml": "<div>Source HTML</div>"
        }
    ]

    this.setState({
      id: this.props.id,
      title: this.props.title,
      url: this.props.url,
      issues: data
    });
  }

  render() {
    return (
      <div>
        {this.state.issues.map(x => <Issue key={x.id}
            title={x.title}
            description={x.description}
            severity={x.severity}
            />
        )}
      </div>
    )
  }
}

export default ContentPiece;