import React from 'react';
import classes from '../../css/summaryPage.scss';
import { Heading } from '@instructure/ui-elements';
import { Button } from '@instructure/ui-buttons'

const API = '';

class SummaryPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      id: null,
      title: null,
      url: null,
      issues: [],
      dateTime: null
    }
  }

  getDateFormat = (event, { index, id }) => {
    this.setState({
      selectedIndex: index
    })
  }

  componentDidMount() {
    // TODO Fetch issues from API then set state
      // fetch('http://API/route')
      // .then( res => res.json())
      // .then((data) => {
      //   this.setState({
      //     issues: data
      //   });
      // })
      // .catch(console.log);

    // The list of issues for the piece of content
    var data = [
        {
            "id": 12345,
            "scanRuleId": "Scan Rule Id",
            "title": "Issue 1 Title",
            "description": "Issue 1 Description",
            "type": "error",
            "uFixIt": true,
            "sourceHtml": "<div>Source HTML</div>"
        },
        {
            "id": 23456,
            "title": "Issue 2 Title",
            "scanRuleId": "Scan Rule Id",
            "description": "Issue 2 Description",
            "type": "suggestion",
            "uFixIt": false,
            "sourceHtml": "<div>Source HTML</div>"
        }
    ]

    var date = new Date().toLocaleString();

    this.setState({
      issues: data,
      dateTime: date,
    });
  }



  render() {
    return (
      <div className={`${classes.summaryContainer}`}>
        <div className={`${classes.row}`}>
          <Heading><b>Summary</b></Heading>
        
          <Button onClick={this.handleClick} color="primary" margin="small" textAlign="center" >Get Started</Button>
        </div>

        <div className={`${classes.row}`}>
          <p>{this.state.dateTime}</p>
        {/* {this.state.issues.map(x => <Issue key={x.id}
            title={x.title}
            description={x.description}s
            severity={x.severity}
            />
        )} */}
        </div>
        {/* <br></br> */}
        <div className={`${classes.row}`}>
          <Heading>31 Errors</Heading>
          <Heading>14 Suggestions</Heading>
          <Heading>2 Unscannable Files</Heading>
        </div>
      </div>
    )
  }
}

export default SummaryPage;