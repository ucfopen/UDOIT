import React, { useState, useEffect } from 'react'
import SortableTable from '../SortableTable'
import Api from '../../Services/Api'
import ProgressIcon from '../Icons/ProgressIcon'

export default function UsersPage({
  t,
  settings,
  accountId,
  searchTerm,
  termId
}) {

  const headers = [
    { id: "lmsUserName", text: t('report.header.name') },
    { id: "lmsUserId", text: t('report.header.lms_id') },
    { id: "created", text: t('report.header.created') },
    { id: "lastLogin", text: t('report.header.last_login') },
    { id: "action", text: "", alignText: "end" }
  ]

  const [users, setUsers] = useState([])
  const [usersLoaded, setUsersLoaded] = useState(false)
  const [filteredUsers, setFilteredUsers] = useState([])
  const [tableSettings, setTableSettings] = useState({
    sortBy: 'lmsUserName',
    ascending: true,
    pageNum: 0,
    rowsPerPage: (localStorage.getItem('rowsPerPage')) ? localStorage.getItem('rowsPerPage') : '10'
  })

  const getUsers = () => {
    const api = new Api(settings)
    api.getAdminUser()
      .then((responseStr) => responseStr.json())
      .then((response) => {
        setUsersLoaded(true)
        setUsers(response.data)
      })
  }

  useEffect(() => {
    if (users.length === 0) {
      getUsers()
    }
  }, [])

  const handleUserDeauthorize = (user) => {
    const api = new Api(settings)

    user.hasApiKey = false

    api.updateUser(user)
      .then((responseStr) => responseStr.json())
      .then((response) => {
        let tempUsers = Object.assign({}, users)
        if (response && response.id) {
          const ind = users.findIndex((el) => { el.id === response.id })
          tempUsers[ind] = response
          setUsers(tempUsers)
        }
      })
  }

  const handleTableSettings = (setting) => {
    setTableSettings(Object.assign({}, tableSettings, setting))
  }

  useEffect(() => {
    const { sortBy, ascending } = tableSettings
    
    let filteredList = []

    for (const user of users) {
      
      //Since usernames won't always be stored, we check for null to avoid crashes
      if(!user.name) {
        user.name = t('report.label.default_name')
      }

      let excludeUser = false
      if (searchTerm !== '') {
        const searchTerms = searchTerm.toLowerCase().split(' ');
        let containsAllTerms = true
        if (Array.isArray(searchTerms)) {
          for (let term of searchTerms) {
            if (!user.name.toLowerCase().includes(term)) {
              containsAllTerms = false
            }
          }
        }
        if (!containsAllTerms) {
          excludeUser = true
        }
      }

      if(!excludeUser) {

        let btnLabel = t('report.label.deauthorized')
        if (user.hasApiKey) {
          btnLabel = t('report.button.force_reauthorize')
        }

        const action = <button key={`userActionButton${user.id}`}
          onClick={() => handleUserDeauthorize(user)}
          disabled={(user.hasApiKey) ? true : false}
          className='btn btn-primary'>
            {btnLabel}
          </button>

        filteredList.push({
          id: user.id,
          user,
          lmsUserId: user.lmsUserId,
          lmsUserName: user.name,
          lastLogin: user.lastLogin,
          created: user.created,
          action: action
        })
      }
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

    setFilteredUsers(filteredList);
  }, [users, searchTerm, tableSettings])

  return (
    <div className="pt-0 pe-0 pb-0 ps-0">
      <div className="flex-row justify-content-center mt-3 mb-3">
        <h1 className="mt-0 mb-0 primary-dark">{t('label.admin.users')}</h1>
      </div>
      {(!usersLoaded) &&
        <div className="mt-3 flex-row justify-content-center">
          <div className="flex-column justify-content-center me-3">
            <ProgressIcon className="icon-lg primary spinner" />
          </div>
          <div className="flex-column justify-content-center">
            <h2 className="mt-0 mb-0">{t('report.label.loading_users')}</h2>
          </div>
        </div>
      }
      {(usersLoaded && filteredUsers.length === 0) &&
        <div className="flex-column mt-3">
          <div className="flex-row justify-content-center">
            <h2 className="mt-0 mb-0">{t('report.label.no_results')}</h2>
          </div>
          <div className="flex-row justify-content-center mt-2">
            <div className="mt-0 mb-0">{t('report.msg.no_results')}</div>
          </div>
        </div>
      }
      {(filteredUsers.length > 0) &&
        <SortableTable
          t={t}
          caption=''
          headers={headers}
          rows={filteredUsers}
          tableSettings={tableSettings}
          handleTableSettings={handleTableSettings}
        />
      }
    </div>
  )
}