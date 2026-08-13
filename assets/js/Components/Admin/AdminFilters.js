import React, { useState, useEffect } from "react";
import SearchIcon from "../Icons/SearchIcon";

import "../Widgets/FixIssuesFilters.css";
import Combobox from "../Widgets/Combobox";
import RightArrowIcon from "../Icons/RightArrowIcon";

export default function AdminFilters({
  t,
  preferences,
  accounts,
  termInfo,
  filters,
  handleFilter,
  loadingContent,
  searchTerm,
  handleSearchTerm,
  navigation,
  parentAccounts,
  accountStack,
  handleAccountSelect,
  selectedTerm,
  setSelectedTerm
}) {

  const [termOptions, setTermOptions] = useState([])

  useEffect(() => {
    if(termInfo){
      const tempOptions = computeSelectOptions(-1)
      setTermOptions(tempOptions)
    }
  }, [termInfo])

  const handleBreadcrumbNav = (index) => {
   if(index >= accountStack.length - 1){
      console.log("Cannot go back!")
      return
   }

   handleAccountSelect(accountStack[index+1], accountStack[index+1].depth)
  }

  const computeSelectOptions = (currentSelection) => {
    const tempOptions = [{ value: -1, name: "All Terms", selected: currentSelection === -1}]
     for (const term of termInfo) {
        tempOptions.push({
          value: term.lmsTermId,
          name: term.termName,
          selected: currentSelection == term.lmsTermId
        })
     }
     return tempOptions
  }

  const handleTermChange = (id, value) => {
    setSelectedTerm(Number(value))

    const tempSelectOptions = computeSelectOptions(value)
    setTermOptions(tempSelectOptions)
  }

  return (
    <div className="filter-container mb-2">    
      <div className="account-navigator flex-row align-items-center">
        {accountStack.map((a, i) => (
          <div key={a.lmsAccountId} className="flex-row align-items-center">
            <div className={`navigation-breadcrumb ${i < accountStack.length - 1 ? "linked" : ""}`} onClick={() => handleBreadcrumbNav(i)} >{a.accountName}</div>
            {i < accountStack.length - 1 ? <RightArrowIcon className='icon-sm gray'/> : ""}
          </div>
        ))}
      </div>
      <div className="terms-filter flex-row gap-2 mt-2">
        {navigation === "courses" && (
          <div className="search-group">
            <input
              value={searchTerm}
              type="text"
              placeholder={t("filter.label.search")}
              onChange={(e) => handleSearchTerm(e.target.value)}
            />
            <SearchIcon className="search-icon icon-sm" />
          </div>
        )}
        <Combobox 
          handleChange={handleTermChange}
          id="term-select"
          isDisabled={false}
          label=""
          options={termOptions}
        />
      </div>
    </div>
  );
}
