import React, { useState, useEffect, useCallback } from "react";
import AdminHeader from "./AdminHeader";
import AdminDashboard from "./AdminDashboard";
import CoursesPage from "./CoursesPage";
import ReportsPage from "./ReportsPage";
import Api from "../../Services/Api";
import MessageTray from "../Widgets/MessageTray";
import AdminFilters from "../Admin/AdminFilters";
import ProgressIcon from "../Icons/ProgressIcon";

import { ISSUE_FILTER } from "../../Services/Settings";
import "../../../css/udoit4-theme.css";

export default function AdminApp(initialData) {
  // If there are multiple accounts available, the first account is the selected accountId
  let accountId = initialData?.accountId;
  let intialAccount = {}
  let filteredAccounts = []
  if (initialData.accounts) {
    intialAccount = initialData.accounts.find(a => a.lmsAccountId == accountId)
    filteredAccounts = initialData.accounts.filter(a => a.lmsAccountId != accountId)
  }

  let initialFilters = {
    accountId: accountId,
    termId: initialData.termInfo.defaultTerm,
    includeSubaccounts: true,
    courseId: null,
  };

  const [messages, setMessages] = useState(initialData.messages || []);
  const [preferences, setPreferences] = useState(initialData.preferences ?? {});
  const [instanceInfo, setInstanceInfo] = useState(
    initialData.instanceInfo ?? {},
  );
  const [termInfo, setTermInfo] = useState(initialData.termInfo || {});
  const [labels, setLabels] = useState(initialData.labels ?? []);
  const [parentAccounts, setParentAccounts] = useState({[accountId]: intialAccount})
  const [accounts, setAccounts] = useState({[accountId]: filteredAccounts});

  const [courses, setCourses] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filters, setFilters] = useState({ ...initialFilters });
  const [searchTerm, setSearchTerm] = useState("");
  const [accountData, setAccountData] = useState([]);
  const [navigation, setNavigation] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [trayOpen, setTrayOpen] = useState(false);
  const [selectedAccountsByDepth, setSelectedAccountsByDepth] = useState({});

  const [accountStack, setAccountStack] = useState([intialAccount])
  const [accountSearch, setAccountSearch] = useState("")
  const [selectedTerm, setSelectedTerm] = useState(-1)

  const stats = {
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
    };

  const [dashboardStats, setDashboardStats] = useState(initialData.stats || stats)

  useEffect(() => {
    if(accountStack){
      setTermsCourses(accountStack[accountStack.length - 1].lmsAccountId)
    }
  }, [accountStack])

  const t = useCallback(
    (key, values = {}) => {
      let translatedText = labels[key] ? labels[key] : key;
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
    [labels],
  );

  const updateAccountStack = (account, shouldPush = false) => {
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

  const loadCourses = () => {
    setLoadingCourses(true)
    if (selectedTerm == -1) {
      const tempCourses = []
      for (const c of Object.values(termInfo[1])){
        tempCourses.push(c)
      }
      setCourses(tempCourses.flat())
    }
    else if(selectedTerm > -1){
     setCourses(termInfo[1][selectedTerm])
    }
    setLoadingCourses(false)
  }

  const setTermsCourses = async (accountId) => {
    const termsCourses = await fetchTermsAndCourses(accountId)
    setTermInfo(termsCourses)
  }

  const handleNavigation = (navigation) => {
    setSelectedCourse(null);
    setNavigation(navigation);
  };

  const handleReportClick = (course) => {
    setSelectedCourse(course);
    setNavigation("reports");
  };

  const addMessage = (msg) => {
    setMessages((prevMessages) => [...prevMessages, msg]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const handleFilter = (newFilter) => {
    const tempFilters = Object.assign({}, filters, newFilter);
    setFilters(tempFilters);
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

  const accountMatchesSearch = (account) => {
    const normalizedSearch = accountSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return account.accountName?.toLowerCase().includes(normalizedSearch);
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
      ? accounts[accountId] || []
      : accounts[account.lmsAccountId] || []
    ).filter(
      (childAccount) =>
        childAccount?.lmsAccountId != null &&
        !nextVisitedAccountIds.has(childAccount.lmsAccountId),
    );

    const renderedChildren = childAccounts
    .map((childAccount) =>
      renderAccountTree(
        childAccount,
        depth + 1,
        false,
        nextVisitedAccountIds,
      ),
    )
    .filter(Boolean);

    
    const matchesSearch = accountMatchesSearch(account);
    if (!isRoot && accountSearch.trim() && !matchesSearch && renderedChildren.length === 0) {
      return null;
    }



    const isSelected = !isRoot && selectedAccountsByDepth[depth] === String(account.lmsAccountId);

    return (
      <div className="admin-account-tree-branch" key={account.lmsAccountId}>
        <div
          className={isRoot ? "admin-account-tree-root" : `admin-account-tree-item ${isSelected ? "selected" : ""}`}
          role={isRoot ? undefined : "button"}
          style={{ "--account-depth": depth }}
          tabIndex={isRoot ? undefined : "0"}
          onClick={isRoot ? undefined : () => handleAccountSelect(account, depth)}
          onKeyDown={
            isRoot
              ? undefined
              : (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleAccountSelect(account, depth);
                  }
                }
          }
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
    const api = new Api(instanceInfo)
    const res = await api.getAdminSubAccounts(accountId)
    const response = await res.json()
    if (response?.errors && response.errors.length > 0){
      console.log("Failed to fetch subacocunts")
      console.log(error)
      return
    }
    setDashboardStats(response.data.stats)
    return response.data.accounts
  }

  const fetchTermsAndCourses = async (accountId) => {
    const api = new Api(instanceInfo)
    const res = await api.getAdminTermsCourses(accountId)
    const response = await res.json()
    if (response?.errors && response.errors.length > 0){
      console.log("Failed to fetch terms and accounts")
      console.log(error)
      return
    }
    return response.data
  }

  const handleAccountSearch = (e) => {
    const term = e.target.value
    setAccountSearch(term)
  }

  const handleCourseUpdate = (courseData) => {
    let tempCourses = { ...courses };

    // If there's an oldId, this is a newly scanned course that needs the old entry removed
    if (courseData.oldId && courseData.oldId !== courseData.id) {
      // Remove the old unscanned course entry
      if (tempCourses[courseData.oldId]) {
        delete tempCourses[courseData.oldId];
      }

      // Add the new scanned course entry
      const updatedCourse = { ...courseData };
      delete updatedCourse.oldId; // Remove the signal flag
      tempCourses[courseData.id] = updatedCourse;
    }
    // If updating an existing course, just update its data
    else if (tempCourses[courseData.id]) {
      tempCourses[courseData.id] = {
        ...tempCourses[courseData.id],
        ...courseData,
      };
    }
    // If it's a new course, add it
    else {
      tempCourses[courseData.id] = courseData;
    }

    setCourses(tempCourses);
  };

  useEffect(() => {
    loadCourses(initialFilters);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [termInfo, selectedTerm]);

  return (
    <div
      id="app-container"
      className={`flex-column flex-grow-1 ${preferences.fontSize || "font-medium"} ${preferences.fontFamily || "sans-serif"} ${preferences.darkMode ? "dark-mode" : ""}`}
    >
      <AdminHeader
        t={t}
        navigation={navigation}
        handleNavigation={handleNavigation}
      />

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <input type="text" value={accountSearch} onChange={(e) => handleAccountSearch(e)} placeholder="Search for an account" className="mb-1 p-1"></input>
          <div className="admin-account-tree">
            {parentAccounts[accountId] && renderAccountTree(parentAccounts[accountId], 0, true)}
          </div>
        </aside>

        <main role="main" className="admin-main pt-2">
          <AdminFilters 
            t={t}
            preferences={preferences}
            accounts={accounts}
            termInfo={termInfo}
            filters={filters}
            handleFilter={handleFilter}
            loadingContent={loadingCourses}
            searchTerm={searchTerm}
            handleSearchTerm={setSearchTerm}
            navigation={navigation}
            parentAccounts={parentAccounts}
            accountStack={accountStack}
            handleAccountSelect={handleAccountSelect}
            selectedTerm={selectedTerm}
            setSelectedTerm={setSelectedTerm}
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
                  preferences={preferences}
                  dashboardStats={dashboardStats}
                  handleNavigation={handleNavigation}
                  addMessage={addMessage}
                />
              )}
              {"courses" === navigation && (
                <CoursesPage
                  t={t}
                  courses={courses}
                  instanceInfo={instanceInfo}
                  searchTerm={searchTerm}
                  addMessage={addMessage}
                  handleCourseUpdate={handleCourseUpdate}
                  handleReportClick={handleReportClick}
                  handleNavigation={handleNavigation}
                />
              )}
              {"reports" === navigation && (
                <ReportsPage
                  t={t}
                  instanceInfo={instanceInfo}
                  filters={filters}
                  selectedCourse={selectedCourse}
                />
              )}
            </div>
          )}
        </main>
      </div>
      <MessageTray
        t={t}
        messages={messages}
        clearMessages={clearMessages}
        hasNewReport={true}
      />
    </div>
  );
}
