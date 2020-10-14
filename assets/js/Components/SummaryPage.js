import React from 'react';
import classes from '../../css/summaryPage.scss';
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { Table } from '@instructure/ui-table'
import { Pill } from '@instructure/ui-pill'
import { Badge } from '@instructure/ui-badge'
import moment from 'moment';
import Clock from './Clock'
import SortableTable from './SortableTable'

// Constants
const sectionNames = [
  "announcement",
  "assignment",
  "file",
  "page",
  "discussion",
  "syllabus",
  "moduleUrl"
]

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

  componentDidMount() {
  
    var date = new Date();

    this.setState({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    });

  }

  getDateFormat = (event, { index, id }) => {
    this.setState({
      selectedIndex: index
    })
  }

  getContentById = (state, contentId) => {
    return Object.assign({}, state.contentList[contentId]);
  }


  getIssueFrequency = (state, type) => {
      let issueTypes = []

      sectionNames.forEach(section => getIssueTypes(state, section, type, issueTypes));

      return issueTypes;
  }

  getReportDetails = (report) => {

    const issueDictionary = {}
    const issueFrequency = {"error": {}, "suggestion": {}}
    const issueList = report.data.issues;
    const contentList = report.data.contentItems;

    sectionNames.forEach(section => {issueDictionary[section] = {"error": 0, "suggestion": 0}})

    Object.keys(issueList).forEach(function(key, index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        let currentIssue = issueList[key];

        //Look up the piece of content that the issue refers to 
        let currentContent = contentList[currentIssue.contentItemId];
        // Add it to the appropriate content type
        issueDictionary[currentContent.contentType][currentIssue.type] += 1;

        
        if(currentIssue.scanRuleId in issueFrequency[currentIssue.type]) {
            issueFrequency[currentIssue.type][currentIssue.scanRuleId]["count"] += 1;
        } else {
            issueFrequency[currentIssue.type][currentIssue.scanRuleId] = {"count": 1}
        }    
    });

    return {
        issueDictionary,
        issueFrequency
    }
  }

  getCountsFromSection = (state, section) => {
    let sectionInfo = getIssuesFromSection(state, section);
    let errorCount = 0, suggestionCount = 0;
    
    for(var i = 0; i < sectionInfo.length; i++) {
        errorCount += sectionInfo[i].issues.filter(issue => issue.type == "error").length;
        suggestionCount += sectionInfo[i].issues.filter(issue => issue.type == "suggestion").length;
    }

    return {errorCount, suggestionCount}
  }

  getIssueTypes = (state, section, type, issueTypes) => {
    let sectionInfo = getIssuesFromSection(state, section);

    for(var i = 0; i < sectionInfo.length; i++) {
        for(var j = 0; j < sectionInfo[i].issues.length; j++) {
            let issue = sectionInfo[i].issues[j];

            if(issue.type === type) {
                var obj = issueTypes.find(element => element.title == issue.title);
            
                if(obj === undefined) {
                    issue.count = 1;
                    issueTypes.push(issue);
                } else {
                    obj.count += 1;
                }
            }
        }
    }
  }

  render() {
    const report = this.props.report;
    const reportDetails = this.getReportDetails(report);
    const errorCountTotal = report.data.errors;
    const suggestionCountTotal = report.data.suggestions;
    const unscannableCountTotal = report.data.unscannable;
    
    return (
      <div className={`${classes.summaryContainer}`}>
        <div className={`${classes.row}`}>
          <Heading><b>Summary</b></Heading>
        
          <Button onClick={this.handleClick} color="primary" margin="small" textAlign="center" >Get Started</Button>
        </div>

        <div className={`${classes.row}`}>
            <Clock></Clock>
        </div>

        {/* Total Counts */}
        <div className={`${classes.rowcentered}`}>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2" children={errorCountTotal}></Heading>
            <br></br>
            <Heading level="h3">Errors</Heading>
          </div>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2" children={suggestionCountTotal}></Heading>
            <br></br>
            <Heading level="h3">Suggestions</Heading>
          </div>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2" children={unscannableCountTotal}></Heading>
            <br></br>
            <Heading level="h3">Unscannable Files</Heading>
          </div>
        </div>

        {/* Summary Tables */}
        <div className={`${classes.row}`}>
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
                  <div className={`${classes.row}`}>
                    <a href="">Announcements</a>
                    <Pill
                    color="alert"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["announcement"].suggestion} Suggestions
                    </Pill>
                    <Pill
                    color="danger"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["announcement"].error} Errors
                    </Pill>
                  </div>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Assignments</a>
                  <Pill
                    color="alert"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["assignment"].suggestion} Suggestions
                    </Pill>
                    <Pill
                    color="danger"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["assignment"].error} Errors
                  </Pill>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Discussions</a>
                  <Pill
                    color="alert"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["discussion"].suggestion} Suggestions
                    </Pill>
                    <Pill
                    color="danger"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["discussion"].error} Errors
                  </Pill>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Pages</a>
                  <Pill
                    color="alert"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["page"].suggestion} Suggestions
                    </Pill>
                    <Pill
                    color="danger"
                    margin="x-small"
                    >
                      {reportDetails["issueDictionary"]["page"].error} Errors
                  </Pill>
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
            caption='Errors'
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
            <Table.Body>
              {Object.keys(reportDetails.issueFrequency.error).map(function (key, id) {
                return (
                  <Table.Row key={key}>
                    <Table.Cell key={id}>
                      <a href="">{key}</a>
                      <Badge standalone variant="danger" count={reportDetails.issueFrequency.error[key].count} countUntil={10} margin="0 small 0 0" />
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
          </div>
          {/* Suggestions */}
          <div className={`${classes.tableContainer}`}>
          <Table
            caption='Suggestions'
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

            <Table.Body>
              {Object.keys(reportDetails.issueFrequency.suggestion).map(function (key, id) {
                return (
                  <Table.Row key={key}>
                    <Table.Cell key={id}>
                      <a href="">{key}</a>
                      <Badge standalone count={reportDetails.issueFrequency.suggestion[key].count} countUntil={10} margin="0 small 0 0" />
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
            
          </Table>
          </div>
        </div>

      </div>
    )
  }
}

export default SummaryPage;