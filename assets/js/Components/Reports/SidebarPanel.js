import React, { useState, useEffect } from "react";
import CourseBrowser from "./CourseBrowser";
import "./SidebarPanel.css";

// Use keys for translation
const PRESETS = [
  { label: "report.time.1_week", days: "7" },
  { label: "report.time.2_weeks", days: "14" },
  { label: "report.time.1_month", days: "30" },
  { label: "report.time.6_months", days: "183" },
];

export default function SidebarPanel({
  showCourseBrowser,
  showDateFilter,
  filteredCourseNames,
  selectedCourses,
  setSelectedCourses,
  searchTerm,
  setSearchTerm,
  selectedCount,
  t,
  dateStart,
  setDateStart,
  dateEnd,
  setDateEnd,
  minWidth = 280,
}) {
  const DEFAULT_PRESET_DAYS = "14";
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_PRESET_DAYS);

  useEffect(() => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - Number(DEFAULT_PRESET_DAYS));
    const startStr = from.toISOString().slice(0, 10);
    const endStr = today.toISOString().slice(0, 10);
    setDateStart(startStr);
    setDateEnd(endStr);
    // eslint-disable-next-line
  }, []);

  const handlePreset = (daysStr) => {
    const days = Number(daysStr);
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - days);
    setDateStart(from.toISOString().slice(0, 10));
    setDateEnd(today.toISOString().slice(0, 10));
    setSelectedPreset(daysStr);
  };

  useEffect(() => {
    if (!selectedPreset) return;
    const today = new Date().toISOString().slice(0, 10);
    const preset = PRESETS.find((p) => p.days === selectedPreset);
    if (preset) {
      const expectedStart = (() => {
        const d = new Date(today);
        d.setDate(d.getDate() - Number(preset.days));
        return d.toISOString().slice(0, 10);
      })();
      if (dateStart !== expectedStart || dateEnd !== today) {
        setSelectedPreset("");
      }
    }
  }, [dateStart, dateEnd, selectedPreset]);

  return (
    <div className="sidebar-panel-container">
      <div className="sidebar-panel-header">
        <h3 className="sidebar-panel-title">
          {t("report.label.filters")}
        </h3>
        {showDateFilter && (
          <div className="sidebar-panel-date-filter">
            <div className="sidebar-panel-date-row">
              <span className="sidebar-panel-date-label">
                {t("report.label.date_range")}
              </span>
              <select
                className="sidebar-panel-select"
                onChange={(e) => {
                  const daysStr = e.target.value;
                  if (daysStr) handlePreset(daysStr);
                }}
                value={selectedPreset}
              >
                <option value="" disabled>
                  {t("report.label.presets")}
                </option>
                {PRESETS.map((preset) => (
                  <option key={preset.label} value={preset.days}>
                    {t(preset.label)}
                  </option>
                ))}
              </select>
            </div>
            <div className="sidebar-panel-date-inputs">
              <input
                type="date"
                value={dateStart || ""}
                onChange={(e) => {
                  setDateStart(e.target.value);
                  setSelectedPreset("");
                }}
                className="sidebar-panel-date-input"
              />
              <span className="sidebar-panel-date-separator">–</span>
              <input
                type="date"
                value={dateEnd || ""}
                onChange={(e) => {
                  setDateEnd(e.target.value);
                  setSelectedPreset("");
                }}
                max={new Date().toISOString().slice(0, 10)}
                className="sidebar-panel-date-input"
              />
            </div>
          </div>
        )}
      </div>
      {showCourseBrowser && (
        <CourseBrowser
          filteredCourseNames={filteredCourseNames}
          selectedCourses={selectedCourses}
          setSelectedCourses={setSelectedCourses}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCount={selectedCount}
          t={t}
        />
      )}
    </div>
  );
}