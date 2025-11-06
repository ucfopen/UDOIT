import React from "react";
import "./CourseBrowser.css";

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
    <div className="course-browser-container">
      {/* Search + actions */}
      <div className="course-browser-header">
        <input
          type="text"
          placeholder={t("report.label.search_courses")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="course-browser-search"
        />
        <small className="course-browser-limit">
          {t("report.label.course_limit")}
        </small>
        <button
          onClick={() => setSelectedCourses({})}
          className="course-browser-deselect"
        >
          {t("report.button.deselect_all")}
        </button>
      </div>
      {/* Course list */}
      <div className="course-browser-list">
        {filteredCourseNames.map((name) => {
          const checked = !!selectedCourses[name];
          const disabled =
            !checked && selectedCount >= COURSE_LIMIT;
          return (
            <label
              key={name}
              className={`course-browser-label${disabled ? " disabled" : ""}`}
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