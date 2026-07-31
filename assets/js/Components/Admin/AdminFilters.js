import React, { useState, useEffect } from "react";
import SearchIcon from "../Icons/SearchIcon";

import "../Widgets/FixIssuesFilters.css";
import Combobox from "../Widgets/Combobox";

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
}) {
  const [accountOptions, setAccountOptions] = useState([]);
  const [termOptions, setTermOptions] = useState([]);

  // When the "termInfo" and "accounts" are loaded, create the Account and Term dropdown options
  useEffect(() => {
    if (accounts) {
      let tempAccountOptions = [];
      for (const acct of Object.values(accounts)) {
        tempAccountOptions.push({
          id: acct.id,
          name: acct.accountName,
        });
      }

      setAccountOptions(tempAccountOptions);
    }

    if (termInfo) {
      let tempTermOptions = [];
      for (const [key, val] of Object.entries(termInfo.terms)) {
        tempTermOptions.push({
          id: key,
          name: val,
        });
      }
      setTermOptions(tempTermOptions);
    }
  }, [termInfo, accounts]);

  const handleAccountSelect = (newValue) => {
    handleFilter({ accountId: newValue });
  };

  const handleTermSelect = (newValue) => {
    handleFilter({ termId: newValue });
  };

  return (
    <div className="filter-container mb-2">
      <div className="flex-row flex-wrap gap-1">
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
        <div className="flex-row me-3">
          <div className="flex-column justify-content-center align-items-center">
            <label htmlFor="inputTerm" className="me-2">
              {t("filter.label.term")}
            </label>
          </div>
          <div className="filter-group">
            <Combobox
              id="inputTerm"
              disabled={loadingContent}
              onChange={(e) => handleTermSelect(e.target.value)}
              options={termOptions.map((term, i) => {
                return (
                  <option key={`term-${i}`} value={term.id}>
                    {term.name}
                  </option>
                );
              })}
            />
          </div>
        </div>
      </div>
      <div className="flex-row flex-wrap gap-1">
      </div>       
        
    </div>
  );
}
