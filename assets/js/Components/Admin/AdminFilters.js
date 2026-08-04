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
  accountStack
}) {



  
  return (
    <div className="filter-container mb-2">    
      <div className="account-navigator flex-row align-items-center">
        {accountStack.map((a, i) => (
          <div key={i} className="flex-row align-items-center">
            <div className={`navigation-breadcrumb ${i < accountStack.length - 1 ? "linked" : ""}`} >{a.accountName}</div>
            {i < accountStack.length - 1 ? <RightArrowIcon className='icon-sm gray'/> : ""}
          </div>
        ))}
        
      </div>
    </div>
  );
}
