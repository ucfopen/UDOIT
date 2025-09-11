import React, { useState, useEffect } from "react";
import CourseBrowser from "./CourseBrowser";

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
    <div
      style={{
        flex: 1,
        borderLeft: "1px solid #ccc",
        padding: 0,
        overflowY: "auto",
        maxHeight: 400,
        minWidth: minWidth,
      }}
    >
      {/* Filters heading and date filter */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#fff",
          zIndex: 2,
          padding: 10,
          borderBottom: "1px solid #ccc",
        }}
      >
        <h3
          style={{
            margin: "0 0 12px 0",
            fontWeight: 600,
            fontSize: "1.1em",
            letterSpacing: "0.5px",
          }}
        >
          {t("report.label.filters")}
        </h3>
        {showDateFilter && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontWeight: 500, marginRight: 8 }}>
                {t("report.label.date_range")}
              </span>
              <select
                style={{ fontSize: "0.95em", padding: "2px 6px", borderRadius: 4 }}
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 6,
              }}
            >
              <input
                type="date"
                value={dateStart || ""}
                onChange={(e) => {
                  setDateStart(e.target.value);
                  setSelectedPreset("");
                }}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "4px 8px",
                  width: 105,
                }}
              />
              <span style={{ margin: "0 6px" }}>–</span>
              <input
                type="date"
                value={dateEnd || ""}
                onChange={(e) => {
                  setDateEnd(e.target.value);
                  setSelectedPreset("");
                }}
                max={new Date().toISOString().slice(0, 10)}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: "4px 8px",
                  width: 105,
                }}
              />
            </div>
          </div>
        )}
      </div>
      {/* Course browser only for multi-course */}
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