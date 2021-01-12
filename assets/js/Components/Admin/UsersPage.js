import React from 'react'
import SortableTable from '../SortableTable'
import ContentPageForm from '../ContentPageForm'
import { View } from '@instructure/ui-view'
import Api from '../../Services/Api'
import { Spinner } from '@instructure/ui-spinner'
import { Text } from '@instructure/ui-text'

class UsersPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      searchTerm: '',
      tableSettings: {
        sortBy: 'lmsUserName',
        ascending: true,
        pageNum: 0,
      }
    }

    this.handleSearchTerm = this.handleSearchTerm.bind(this);
    this.handleTableSettings = this.handleTableSettings.bind(this);
  }

  componentDidMount() {
    if (this.state.users.length === 0) {
      this.getUsers()
    }
  }

  getFilteredContent() {
    const { searchTerm, users } = this.state
    const { sortBy, ascending } = this.state.tableSettings
    
    let filteredList = [];

    for (const user of users) {      
      // Filter by search term
      if (searchTerm !== '') {
        if (user.name.toLowerCase().indexOf(searchTerm.toLowerCase()) === -1) {
          continue
        }
      }

      filteredList.push({
        id: user.id,
        user,
        lmsUserId: user.lmsUserId,
        lmsUserName: user.name,
        lastLogin: user.lastLogin,
        created: user.created,
      })
    }

    filteredList.sort((a, b) => {
      if (isNaN(a[sortBy]) || isNaN(b[sortBy])) {
        return (a[sortBy].toLowerCase() < b[sortBy].toLowerCase()) ? -1 : 1
      }
      else {
        return (Number(a[sortBy]) < Number(b[sortBy])) ? -1 : 1
      }
    })

    if (!ascending) {
      filteredList.reverse();
    }

    return filteredList;
  }

  render() {
    const headers = [
      { id: "lmsUserName", text: this.props.t('label.admin.name') },
      { id: "lmsUserId", text: this.props.t('label.admin.id') },
      { id: "created", text: this.props.t('label.admin.created') },
      { id: "lastLogin", text: this.props.t('label.admin.last_login') },
      // { id: "reportCount", text: this.props.t('label.reports') },
      { id: "action", text: "", alignText: "end" }
    ];
    const filteredRows = this.getFilteredContent();

    if (filteredRows.length === 0) {
      return (
        <View as="div" padding="small 0">
          <ContentPageForm
            handleSearchTerm={this.handleSearchTerm}
            searchTerm={this.state.searchTerm}
            t={this.props.t} />
          <View as="div" textAlign="center" padding="medium">
            <Spinner variant="inverse" renderTitle={this.props.t('label.loading_users')} />
            <Text as="p" weight="light" size="large">{this.props.t('label.loading_users')}</Text>
          </View>
        </View>
      )
    } else {
      return (
        <View as="div" key="coursesPageFormWrapper" padding="small 0">
          <ContentPageForm
            handleSearchTerm={this.handleSearchTerm}
            searchTerm={this.state.searchTerm}
            t={this.props.t} />
          <SortableTable
            caption="Users Table"
            headers={headers}
            rows={filteredRows}
            filters={null}
            tableSettings={this.state.tableSettings}
            handleTableSettings={this.handleTableSettings}
            key="UsersTable" />
        </View>
      )
    }
  }

  handleSearchTerm = (e, val) => {
    this.setState({ searchTerm: val });
  }

  handleTableSettings = (setting) => {
    this.setState({
      tableSettings: Object.assign({}, this.state.tableSettings, setting)
    });
  }

  getUsers() {
    const api = new Api(this.props.settings)
    // TODO: add filtering by account/term
    //api.getAdminUser(this.props.accountId, this.props.termId)
    api.getAdminUser()
      .then((responseStr) => responseStr.json())
      .then((response) => {
        console.log('Admin Users', response.data)
        this.setState({ users: response.data })
      })
  }
}

export default UsersPage;