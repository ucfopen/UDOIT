import React from 'react';
import classes from '../../css/summaryPage.scss';
import { Heading } from '@instructure/ui-elements';
import { Button } from '@instructure/ui-buttons'
import { Table } from '@instructure/ui-table'

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

        {/* Total Counts */}
        <div className={`${classes.rowcentered}`}>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2">31</Heading>
            <br></br>
            <Heading level="h3">Errors</Heading>
          </div>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2">14</Heading>
            <br></br>
            <Heading level="h3">Suggestions</Heading>
          </div>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2">2</Heading>
            <br></br>
            <Heading level="h3">Unscannable Files</Heading>
          </div>
        </div>

        {/* Summary Tables */}
        <div className={`${classes.rowcentered}`}>
          {/* Content */}
          <div className={`${classes.tableContainer}`}>
          <Table
            caption='Content'
            layout="auto"
            hover={true}
          >
            <Table.Head>
                  <Table.Row>
                      <Table.ColHeader id="content">
                        Content
                      </Table.ColHeader>
                  </Table.Row>
            </Table.Head>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <a href="">Announcements</a>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Assignments</a>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Discussions</a>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Pages</a>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Syllabus</a>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Module URLs</a>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Files</a>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table>
          </div>
          {/* Errors */}
          <div className={`${classes.tableContainer}`}>
          <Table
            caption='Content'
            layout="auto"
            hover={true}
          >
            <Table.Head>
              <Table.Row>
                  <Table.ColHeader id="content">
                    Errors
                  </Table.ColHeader>
              </Table.Row>
            </Table.Head>
          </Table>
          </div>
          {/* Suggestions */}
          <div className={`${classes.tableContainer}`}>
          <Table
            caption='Content'
            layout="auto"
            hover={true}
          >
            <Table.Head>
                  <Table.Row>
                      <Table.ColHeader id="content">
                        Suggestions
                      </Table.ColHeader>
                  </Table.Row>
            </Table.Head>
          </Table>
          </div>
        </div>

      </div>
    )
  }
}

export default SummaryPage;