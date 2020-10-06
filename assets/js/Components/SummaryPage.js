import React from 'react';
import classes from '../../css/summaryPage.scss';
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { Table } from '@instructure/ui-table'
import { Pill } from '@instructure/ui-pill'
import { Badge } from '@instructure/ui-badge'
import { connect } from 'react-redux';
import { getIssueFrequency, getFilteredContent, getCountsFromSection, getReportDetails } from '../selectors';
import moment from 'moment';
import Clock from './Clock'
import SortableTable from './SortableTable'

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
  
    var date = new Date();

    this.setState({
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    });

  }



  render() {
    const reportDetails = this.props.reportDetails;
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
            <Heading level="h2" children={this.props.errorCountTotal}></Heading>
            <br></br>
            <Heading level="h3">Errors</Heading>
          </div>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2" children={this.props.suggestionCountTotal}></Heading>
            <br></br>
            <Heading level="h3">Suggestions</Heading>
          </div>
          <div className={`${classes.numberContainer}`}>
            <Heading level="h2" children={this.props.unscannableCountTotal}></Heading>
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
                      {this.props.reportDetails["issueDictionary"]["announcement"].suggestion} Suggestions
                    </Pill>
                    <Pill
                    color="danger"
                    margin="x-small"
                    >
                      {this.props.reportDetails["issueDictionary"]["announcement"].error} Errors
                    </Pill>
                  </div>
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <a href="">Assignments</a>
                  {/* <Pill
                    color="alert"
                    margin="x-small"
                    >
                      2 Suggestions
                    </Pill>
                    <Pill
                    color="danger"
                    margin="x-small"
                    >
                      8 Errors
                    </Pill> */}
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
              {Object.keys(this.props.reportDetails.issueFrequency.error).map(function (key, id) {
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
              {Object.keys(this.props.reportDetails.issueFrequency.suggestion).map(function (key, id) {
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

const mapStateToProps = state => {
  return {
    issueList: state.issueList,
    reportDetails: getReportDetails(state),
    errorCountTotal: state.report.errors,
    suggestionCountTotal: state.report.suggestions,
    unscannableCountTotal: state.report.unscannable,
  }
}

export default connect(
  mapStateToProps,
)
(SummaryPage);