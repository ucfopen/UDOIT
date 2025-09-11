import React from "react";

const COURSE_LIMIT = 5;

export default function CourseBrowser({
  filteredCourseNames,
  selectedCourses,
  setSelectedCourses,
  searchTerm,
  setSearchTerm,
  selectedCount,
  t,
}) {
  const handleCheckbox = (name) => {
    // Prevent selecting more than COURSE_LIMIT
    if (!selectedCourses[name] && selectedCount >= COURSE_LIMIT) return;
    setSelectedCourses((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div
      style={{
        padding: 0,
      }}
    >
      {/* Search + actions */}
      <div
        style={{
          backgroundColor: "#fff",
          zIndex: 1,
          padding: 10,
          borderBottom: "1px solid #ccc",
        }}
      >
        <input
          type="text"
          placeholder={t("report.label.search_courses")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "85%", padding: 7 }}
        />
        <small style={{ display: "block", marginTop: 5, color: "#666" }}>
          {t("report.label.course_limit")}
        </small>
        <button
          onClick={() => setSelectedCourses({})}
          style={{
            marginTop: 10,
            padding: "5px 10px",
            backgroundColor: "#f5f5f5",
            border: "1px solid #ccc",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {t("report.button.deselect_all")}
        </button>
      </div>
      {/* Course list */}
      <div style={{ padding: 10 }}>
        {filteredCourseNames.map((name) => {
          const checked = !!selectedCourses[name];
          const disabled =
            !checked && selectedCount >= COURSE_LIMIT;
          return (
            <label
              key={name}
              style={{
                display: "block",
                marginBottom: 10,
                color: disabled ? "#aaa" : undefined,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => handleCheckbox(name)}
              />{" "}
              {name}
            </label>
          );
        })}
      </div>
    </div>
  );
}