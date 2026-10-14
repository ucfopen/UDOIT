import React, { useState, useEffect, useCallback, useRef } from "react";
import AdminHeader from "./AdminHeader";
import AdminDashboard from "./AdminDashboard";
import CoursesPage from "./CoursesPage";
import ReportsPage from "./ReportsPage";
import MessageTray from "../Widgets/MessageTray";
import AdminFilters from "../Admin/AdminFilters";
import ProgressIcon from "../Icons/ProgressIcon";
import SearchIcon from "../Icons/SearchIcon";
import CloseIcon from "../Icons/CloseIcon";
import "../../../css/udoit4-theme.css";
import "./AdminPage.css";
import { api } from "../../Services/Api";

export default function AdminApp(initialData) {
  const PREFERENCES = initialData.preferences ?? {}
  const LABELS = initialData.labels ?? []
  const ACCOUNT_ID = initialData?.accountId;

  let intialAccount = {}
  let filteredAccounts = []
  if (initialData.accounts) {
    intialAccount = initialData.accounts.find(a => a.lmsAccountId == ACCOUNT_ID)
    filteredAccounts = initialData.accounts.filter(a => a.lmsAccountId != ACCOUNT_ID)
  }

  const [nextMessage, setNextMessage] = useState(null);
  const [parentAccounts, setParentAccounts] = useState({[ACCOUNT_ID]: intialAccount})
  const [accounts, setAccounts] = useState({[ACCOUNT_ID]: filteredAccounts});

  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [navigation, setNavigation] = useState("dashboard");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedAccountsByDepth, setSelectedAccountsByDepth] = useState({});

  const [accountStack, setAccountStack] = useState([intialAccount])
  const [accountSearch, setAccountSearch] = useState("")
  const [activeAccountSearch, setActiveAccountSearch] = useState("")
  const [loadingAccountSearch, setLoadingAccountSearch] = useState(false)

  const accountStateBeforeSearch = useRef(null)
  const accountSearchResults = useRef([])
  const [selectedTerm, setSelectedTerm] = useState(-1)
  const [courseTableSettings, setCourseTableSettings] = useState({
    sortBy: "lastUpdated",
    ascending: false,
    pageNum: 0,
    rowsPerPage: localStorage.getItem("rowsPerPage")
      ? localStorage.getItem("rowsPerPage")
      : "10",
  })
  const [coursePagination, setCoursePagination] = useState({
    page: 1,
    perPage: parseInt(courseTableSettings.rowsPerPage),
    total: 0,
    totalPages: 0,
  })

  const [dashboardStats, setDashboardStats] = useState(initialData.stats || {
      loading: false,
      totalCourses: 0,
      scannedCourses: 0,
      totalInstructors: 0,
      uniqueInstructorsUsingUdoit: 0,
      totalErrors: 0,
      totalSuggestions: 0,
      totalFixed: 0,
      totalResolved: 0,
      totalFilesReviewed: 0,
      accountBreakdown: {},
      recentScans: 0,
      oldestScan: null,
      newestScan: null,
  })

  useEffect(() => {
    retriveCoursesAndStats()
  }, [accountStack, selectedTerm, searchTerm, courseTableSettings])

  const t = useCallback(
    (key, values = {}) => {
      let translatedText = LABELS[key] ? LABELS[key] : key;
      if (values && Object.keys(values).length > 0) {
        Object.keys(values).forEach((valKey) => {
          translatedText = translatedText.replace(
            `{${valKey}}`,
            values[valKey],
          );
        });
      }
      return translatedText;
    },
    [LABELS],
  );

  const updateAccountStack = (account, shouldPush = false) => {
    resetCoursePage()
    setAccountStack((prevStack) => {
      const tempStack = [...prevStack]

      while (tempStack.length && tempStack[tempStack.length - 1].depth >= account.depth) {
        tempStack.pop()
      }

      if (tempStack.length && account.lmsAccountId == tempStack[tempStack.length - 1].lmsAccountId) {
        tempStack.pop()
      }

      if (shouldPush) {
        tempStack.push(account)
      }

      return tempStack
    })
  }

  const handleRootAccountSelect = () => {
    resetCoursePage()
    setAccounts({ [ACCOUNT_ID]: filteredAccounts })
    setParentAccounts({ [ACCOUNT_ID]: intialAccount })
    setSelectedAccountsByDepth({})
    setAccountStack([intialAccount])
    setAccountSearch("")
    setActiveAccountSearch("")
    accountSearchResults.current = []
    accountStateBeforeSearch.current = null
  }

  const retriveCoursesAndStats = async () => {
    if (!accountStack){
      addMessage(t("admin.msg.no_accounts_selected"), 'error')
      return
    }
    const data = await fetchCourses(accountStack[accountStack.length - 1].lmsAccountId, selectedTerm)
    if (!data) {
      addMessage(t("admin.msg.failed_retrieve_data"), 'error')
      return
    }
    
    if(data.stats){
      setDashboardStats(data.stats)
    }
    setCourses(data.courses)
    setCoursePagination(data.pagination)
  }

  const fetchCourses = async (accountId, termId) => {
    setLoadingCourses(true)
    try{
      const retrivedCourses = await api.getAdminCourses(accountId, termId, {
        page: courseTableSettings.pageNum + 1,
        perPage: courseTableSettings.rowsPerPage,
        search: searchTerm,
        sortBy: courseTableSettings.sortBy,
        direction: courseTableSettings.ascending ? "asc" : "desc",
      })
      const normalizedCourses = await retrivedCourses.json()
      if (!normalizedCourses){
        addMessage(t("admin.msg.failed_fetch_courses"), 'error')
        return
      }

      return normalizedCourses.data
    }
    catch(e){
      addMessage(t("admin.msg.failed_fetch_courses"), 'error')
    } finally {
      setLoadingCourses(false)
    }

  }

  const fetchReportsIssues = async () => {
    const data = await api.getAdminReportsIssues(accountStack[accountStack.length - 1].lmsAccountId, selectedTerm)
    const reportsIssues = await data.json()
    if (!reportsIssues) {
      addMessage(t("admin.msg.failed_fetch_reports"), 'error')
      return
    }
    return reportsIssues.data
  }

  const handleCourseSearchTerm = (term) => {
    resetCoursePage()
    setSearchTerm(term)
  }

  const handleSelectedTerm = (term) => {
    resetCoursePage()
    setSelectedTerm(term)
  }

  const resetCoursePage = () => {
    setCourseTableSettings((previousSettings) => ({
      ...previousSettings,
      pageNum: 0,
    }))
  }

  const handleCourseTableSettings = (newSettings) => {
    setCourseTableSettings((previousSettings) => {
      const nextSettings = { ...previousSettings, ...newSettings }

      if (
        newSettings.rowsPerPage !== undefined ||
        newSettings.sortBy !== undefined ||
        newSettings.ascending !== undefined
      ) {
        nextSettings.pageNum = 0
      }

      return nextSettings
    })
  }

  const handleNavigation = (navigation) => {
    setSelectedCourse(null);
    setNavigation(navigation);
  };

  const handleReportClick = (course) => {
    setSelectedCourse(course);
    setNavigation("reports");
  };

  const addMessage = (msg, severity = 'success') => {
    setNextMessage({message: msg});
  };

  const removeAccountBranch = (
    accountId,
    tempAccounts,
    tempParentAccounts,
    visitedAccountIds = new Set(),
  ) => {
    if (accountId == null || visitedAccountIds.has(accountId)) {
      return;
    }

    const nextVisitedAccountIds = new Set(visitedAccountIds);
    nextVisitedAccountIds.add(accountId);
    const childAccounts = tempAccounts[accountId] || [];

    childAccounts.forEach((childAccount) => {
      removeAccountBranch(
        childAccount.lmsAccountId,
        tempAccounts,
        tempParentAccounts,
        nextVisitedAccountIds,
      );
    });

    delete tempParentAccounts[accountId];
    delete tempAccounts[accountId];
  };

  const handleAccountSelect = async (account, depth) => {
      if (activeAccountSearch) {
        await selectSearchAccount(account)
        return
      }

     let tempParentAccounts = { ...parentAccounts }
     let tempAccounts = { ...accounts }
     let tempSelectedAccountsByDepth = { ...selectedAccountsByDepth }
     const selectedAccountId = String(account.lmsAccountId);

     if (tempSelectedAccountsByDepth[depth] === selectedAccountId) {
        removeAccountBranch(
          account.lmsAccountId,
          tempAccounts,
          tempParentAccounts,
        )

        Object.keys(tempSelectedAccountsByDepth).forEach((selectedDepth) => {
          if (Number(selectedDepth) >= depth) {
            delete tempSelectedAccountsByDepth[selectedDepth];
          }
        });
        updateAccountStack(account)
     }
     else{
      let newAccs = await fetchSubAccounts(account.lmsAccountId)
      if (!newAccs || newAccs?.length < 1){
          return
      }

      if (tempSelectedAccountsByDepth[depth]) {
        removeAccountBranch(
          tempSelectedAccountsByDepth[depth],
          tempAccounts,
          tempParentAccounts,
        )
      }

      Object.keys(tempSelectedAccountsByDepth).forEach((selectedDepth) => {
        if (Number(selectedDepth) >= depth) {
          delete tempSelectedAccountsByDepth[selectedDepth];
        }
      });

      tempAccounts[account.lmsAccountId] = newAccs
      tempParentAccounts[account.lmsAccountId] = account
      tempSelectedAccountsByDepth[depth] = selectedAccountId
      updateAccountStack(account, true)
     }
     
     setParentAccounts(tempParentAccounts)
     setAccounts(tempAccounts)
     setSelectedAccountsByDepth(tempSelectedAccountsByDepth)
  };

  const renderAccountTree = (
    account,
    depth = 0,
    isRoot = false,
    visitedAccountIds = new Set(),
  ) => {
    if (account?.lmsAccountId == null || visitedAccountIds.has(account.lmsAccountId)) {
      return null;
    }

    const nextVisitedAccountIds = new Set(visitedAccountIds);
    nextVisitedAccountIds.add(account.lmsAccountId);

    const childAccounts = (isRoot
      ? accounts[ACCOUNT_ID] || []
      : accounts[account.lmsAccountId] || []
    ).filter(
      (childAccount) =>
        childAccount?.lmsAccountId != null &&
        !nextVisitedAccountIds.has(childAccount.lmsAccountId),
    );

    const isSelected = !isRoot && selectedAccountsByDepth[depth] === String(account.lmsAccountId);

    return (
      <div className="admin-account-tree-branch" key={account.lmsAccountId}>
        <div
          className={isRoot ? "admin-account-tree-root" : `admin-account-tree-item ${isSelected ? "selected" : ""}`}
          role="button"
          style={{ "--account-depth": depth }}
          tabIndex="0"
          onClick={isRoot ? handleRootAccountSelect : () => handleAccountSelect(account, depth)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              if (isRoot) {
                handleRootAccountSelect()
              } else {
                handleAccountSelect(account, depth)
              }
            }
          }}
        >
          {account.accountName}
        </div>
        {childAccounts.map((childAccount) =>
          renderAccountTree(
            childAccount,
            depth + 1,
            false,
            nextVisitedAccountIds,
          ),
        )}
      </div>
    );
  };

  const fetchSubAccounts = async (accountId) => {
    const res = await api.getAdminSubAccounts(accountId)
    const response = await res.json()
    if (response?.errors && response.errors.length > 0){
      return
    }
    return response.data
  }

  const accountTreeFromResults = (accountResults) => {
    const resultAccounts = {}
    const resultParents = {}
    const rootAccount = accountResults.find((account) => String(account.lmsAccountId) === String(ACCOUNT_ID))

    accountResults.forEach((account) => {
      const parentId = String(account.parentAccountId)
      resultAccounts[parentId] = [...(resultAccounts[parentId] || []), account]
    })

    if (rootAccount) {
      resultParents[ACCOUNT_ID] = rootAccount
    }

    return { accounts: resultAccounts, parentAccounts: resultParents }
  }

  const handleAccountSearch = (e) => {
    setAccountSearch(e.target.value)
  }

  const submitAccountSearch = async (e) => {
    e.preventDefault()
    const search = accountSearch.trim()

    if (!search || loadingAccountSearch) {
      return
    }

    if (!accountStateBeforeSearch.current) {
      accountStateBeforeSearch.current = {
        accounts,
        parentAccounts,
        selectedAccountsByDepth,
        accountStack,
      }
    }

    setLoadingAccountSearch(true)
    try {
      const response = await api.getAdminSubAccounts(ACCOUNT_ID, search)
      const payload = await response.json()

      if (!response.ok || payload?.errors?.length) {
        return
      }

      const tree = accountTreeFromResults(payload.data || [])
      accountSearchResults.current = payload.data || []
      setAccounts(tree.accounts)
      setParentAccounts(tree.parentAccounts)
      setSelectedAccountsByDepth({})
      setActiveAccountSearch(search)
    } catch (error) {
      console.error("Failed to search accounts", error)
    } finally {
      setLoadingAccountSearch(false)
    }
  }

  const clearAccountSearch = () => {
    const previousState = accountStateBeforeSearch.current

    setAccountSearch("")
    setActiveAccountSearch("")
    accountSearchResults.current = []

    if (previousState) {
      setAccounts(previousState.accounts)
      setParentAccounts(previousState.parentAccounts)
      setSelectedAccountsByDepth(previousState.selectedAccountsByDepth)
      setAccountStack(previousState.accountStack)
      accountStateBeforeSearch.current = null
    }
  }

  const selectSearchAccount = async (account) => {
    const previousState = accountStateBeforeSearch.current
    const resultAccounts = new Map(
      accountSearchResults.current.map((resultAccount) => [
        String(resultAccount.lmsAccountId),
        resultAccount,
      ])
    )
    const path = []
    const visitedAccountIds = new Set()
    let currentAccount = account

    while (currentAccount && !visitedAccountIds.has(String(currentAccount.lmsAccountId))) {
      const currentAccountId = String(currentAccount.lmsAccountId)
      path.unshift(currentAccount)
      visitedAccountIds.add(currentAccountId)

      if (currentAccountId === String(ACCOUNT_ID)) {
        break
      }

      currentAccount = resultAccounts.get(String(currentAccount.parentAccountId))
    }

    if (!previousState || path.length === 0 || String(path[0].lmsAccountId) !== String(ACCOUNT_ID)) {
      clearAccountSearch()
      return
    }

    setLoadingAccountSearch(true)
    try {
      const nextAccounts = {
        [ACCOUNT_ID]: previousState.accounts[ACCOUNT_ID] || [],
      }
      const nextParentAccounts = {
        [ACCOUNT_ID]: path[0],
      }
      const nextSelectedAccountsByDepth = {}

      for (let index = 0; index < path.length; index += 1) {
        const pathAccount = path[index]
        const pathAccountId = String(pathAccount.lmsAccountId)
        const childAccounts = await fetchSubAccounts(pathAccount.lmsAccountId)

        nextAccounts[pathAccountId] = childAccounts || []
        nextParentAccounts[pathAccountId] = pathAccount

        if (index > 0) {
          nextSelectedAccountsByDepth[index] = pathAccountId
        }
      }

      setAccounts(nextAccounts)
      setParentAccounts(nextParentAccounts)
      setSelectedAccountsByDepth(nextSelectedAccountsByDepth)
      setAccountStack(path)
      setAccountSearch("")
      setActiveAccountSearch("")
      accountSearchResults.current = []
      accountStateBeforeSearch.current = null
    } finally {
      setLoadingAccountSearch(false)
    }
  }

  return (
    <div
      id="app-container"
      className={`flex-column flex-grow-1 ${PREFERENCES.fontSize || "font-medium"} ${PREFERENCES.fontFamily || "sans-serif"} ${PREFERENCES.darkMode ? "dark-mode" : ""}`}
    >
      <AdminHeader
        t={t}
        navigation={navigation}
        handleNavigation={handleNavigation}
      />

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <form onSubmit={submitAccountSearch} className="admin-account-search">
            <input
              type="text"
              value={accountSearch}
              onChange={handleAccountSearch}
              placeholder={t("admin.search.account_placeholder")}
              aria-label={t("admin.search.account_placeholder")}
              disabled={loadingAccountSearch}
            />
            <button
              type="submit"
              className="btn-secondary admin-account-search-button"
              aria-label={t("admin.search.accounts")}
              title={t("admin.search.accounts")}
              disabled={loadingAccountSearch || !accountSearch.trim()}
            >
              <SearchIcon aria-hidden="true" className="icon-sm" />
            </button>
            {activeAccountSearch && (
              <button
                type="button"
                className="btn-secondary admin-account-search-button"
                aria-label={t("admin.search.clear")}
                title={t("admin.search.clear")}
                onClick={clearAccountSearch}
                disabled={loadingAccountSearch}
              >
                <CloseIcon aria-hidden="true" className="icon-sm" />
              </button>
            )}
          </form>
          <div className="admin-account-tree">
            {parentAccounts[ACCOUNT_ID] && renderAccountTree(parentAccounts[ACCOUNT_ID], 0, true)}
          </div>
        </aside>

        <main role="main" className="admin-main pt-2">
          <AdminFilters 
            t={t}
            termInfo={initialData.termInfo ?? []}
            searchTerm={searchTerm}
            handleSearchTerm={handleCourseSearchTerm}
            navigation={navigation}
            accountStack={accountStack}
            handleAccountSelect={handleAccountSelect}
            setSelectedTerm={handleSelectedTerm}
            />
          {loadingCourses && (
            <div className="mt-3 flex-row justify-content-center">
              <div className="flex-column justify-content-center me-3">
                <ProgressIcon className="icon-lg udoit-progress spinner" />
              </div>
              <div className="flex-column justify-content-center">
                <h2 className="mt-0 mb-0">{t("report.label.loading")}</h2>
              </div>
            </div>
          )}

          {!loadingCourses && (
            <div className="scrollable">
              {"dashboard" === navigation && (
                <AdminDashboard
                  t={t}
                  dashboardStats={dashboardStats}
                  handleReportClick={handleReportClick}
                />
              )}
              {"courses" === navigation && (
                <CoursesPage
                  t={t}
                  courses={courses}
                  tableSettings={courseTableSettings}
                  handleTableSettings={handleCourseTableSettings}
                  pagination={coursePagination}
                  handleReportClick={handleReportClick}
                  fetchReportsIssues={fetchReportsIssues}
                />
              )}
              {"reports" === navigation && (
                <ReportsPage
                  t={t}
                  selectedCourse={selectedCourse}
                />
              )}
            </div>
          )}
        </main>
      </div>
      <MessageTray
        t={t}
        preferences={PREFERENCES}
        initialMessages={initialData.messages || []}
        nextMessage={nextMessage}
      />
    </div>
  );
}
