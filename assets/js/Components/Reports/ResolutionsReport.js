import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart, { Interaction } from "chart.js/auto";
import SidebarPanel from "./SidebarPanel";
import './ResolutionsReport.css';

/** ---------- Mock data for testing (optional) ---------- */
const mockReports = {};
for (let i = 1; i <= 100; i++) {
  mockReports[`Course ${i}`] = {
    "2025-09-01": {
      scanCounts: {
        errors: Math.floor(Math.random() * 100),
        potentials: Math.floor(Math.random() * 50),
        suggestions: Math.floor(Math.random() * 30),
      },
    },
    "2025-09-02": {
      scanCounts: {
        errors: Math.floor(Math.random() * 100),
        potentials: Math.floor(Math.random() * 50),
        suggestions: Math.floor(Math.random() * 30),
      },
    },
  };
}

// Colors for multi course line graph
const LINE_STYLES = [
  { color: "rgba(89, 161, 35, 1)", dash: [] },
  { color: "rgba(149, 11, 149, 1)", dash: [5, 5] },
  { color: "rgb(0, 128, 128)", dash: [10, 5, 2, 5] },
  { color: "rgb(139, 69, 19)", dash: [2, 2] },
  { color: "rgba(101, 98, 98, 1)", dash: [15, 5] },  
];

// Display config for errors, potentials, and suggestions on line graphs
const METRIC_CONFIG = {
  errors: {
    label: (t) => t("report.header.issues"),
    color: "rgb(249, 65, 68)",
    dash: [],
  },
  potentials: {
    label: (t) => t("report.header.potential"),
    color: "rgb(247, 150, 30)",
    dash: [5, 5],
  },
  suggestions: {
    label: (t) => t("report.header.suggestions"),
    color: "rgb(48, 176, 228)",
    dash: [2, 2],
  },
};

export default function ResolutionsReport({
  t,
  reports = null,
  selectedCourse = null,
  visibility = { issues: true, potentialIssues: true, suggestions: true },
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [chartMode, setChartMode] = useState("bar");
  const [selectedCourses, setSelectedCourses] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [dateStart, setDateStart] = useState(null);
  const [dateEnd, setDateEnd] = useState(null);
  const courseLimit = 5;

  /** ---------- Use memoization to avoid compute on re-render ---------- */
  const dataReports = useMemo(() => reports || mockReports, [reports]);
  const isArrayHistory = useMemo(() => Array.isArray(reports), [reports]);
  const isSingleCourse = useMemo(() => selectedCourse != null, [selectedCourse]);

  useEffect(() => {
    if (!dataReports || Array.isArray(dataReports)) return;
    if (Object.keys(selectedCourses).length > 0) return;

    const initial = Object.keys(dataReports)
      .slice(0, courseLimit)
      .reduce((acc, name) => ((acc[name] = true), acc), {});
    setSelectedCourses(initial);
  }, [dataReports, courseLimit]);

  /** ---------- Derived lists ---------- */
  const allCourseNames = useMemo(
    () => (dataReports && !Array.isArray(dataReports) ? Object.keys(dataReports) : []),
    [dataReports]
  );

  const filteredCourseNames = useMemo(() => {
    if (!allCourseNames.length) return [];
    const q = searchTerm.toLowerCase();
    return allCourseNames.filter((n) => n.toLowerCase().includes(q));
  }, [allCourseNames, searchTerm]);

  const activeCourseNames = useMemo(() => {
    if (isSingleCourse) return [selectedCourse.title];
    return Object.keys(selectedCourses).filter((n) => selectedCourses[n]);
  }, [isSingleCourse, isArrayHistory, selectedCourse, selectedCourses]);

  /** ---------- Labels & datasets ---------- */
  const { labels, datasets, chartType } = useMemo(() => {
    if (!dataReports) return { labels: [], datasets: [], chartType: "bar" };

    // Single course WITH object map (courseName -> date -> counts)
    // This for when clicking on single course report from the admin panel
    if (isSingleCourse && !isArrayHistory) {
      if (chartMode !== "line") setChartMode("line");
      const course = dataReports[selectedCourse.title] || {};
      const inDateRange = (date) => {
        if (dateStart && date < dateStart) return false;
        if (dateEnd && date > dateEnd) return false;
        return true;
      };
      const dates = Object.keys(course)
        .filter(inDateRange)
        .sort((a, b) => new Date(a) - new Date(b));
      const getSeries = (key) =>
        dates.map((d) => course[d]?.scanCounts?.[key] ?? course[d]?.[key]);

      return {
        labels: dates,
        datasets: ["errors", "potentials", "suggestions"].map((key) =>
          makeMetricDataset({ key, data: getSeries(key), t })
        ),
        chartType: "line",
      };
    }

    // Single course history as ARRAY (reports: [{created, scanCounts}...])
    // This for when going to UDOIT reports from a specific course's LTI
    if (isArrayHistory) {
      if (chartMode !== "line") setChartMode("line");

      const inDateRange = (date) => {
        if (dateStart && date < dateStart) return false;
        if (dateEnd && date > dateEnd) return false;
        return true;
      };

      const dates = reports
        .map((r) => r.created)
        .filter(inDateRange)
        .sort((a, b) => new Date(a) - new Date(b));

      const valueAt = (date, key) => {
        const r = reports.find((x) => x.created === date);
        return r?.scanCounts?.[key] ?? r?.[key];
      };
      return {
        labels: dates,
        datasets: ["errors", "potentials", "suggestions"].map((key) =>
          makeMetricDataset({
            key,
            data: dates.map((d) => valueAt(d, key)),
            t,
          })
        ),
        chartType: "line",
      };
    }

    // Multi-course comparison view
    const allDates = new Set();
    allCourseNames.forEach((c) =>
      Object.keys(dataReports[c] || {}).forEach((d) => allDates.add(d))
    );
    const sortedDates = Array.from(allDates)
      .sort((a, b) => new Date(a) - new Date(b));

    if (chartMode === "line") {
      const inDateRange = (date) => {
        if (dateStart && date < dateStart) return false;
        if (dateEnd && date > dateEnd) return false;
        return true;
      };
      const colorMap = assignColors(activeCourseNames, LINE_STYLES);

      const filteredDates = sortedDates.filter(inDateRange);

      const lineSets = activeCourseNames.map((c) => {
        const style = LINE_STYLES[colorMap[c]];
        return {
          label: c,
          data: filteredDates.map((d) => dataReports[c]?.[d]?.scanCounts?.errors),
          backgroundColor: style.color,
          borderColor: style.color,
          borderDash: style.dash,
          borderWidth: 3.5,
          tension: 0.2,
        };
      });
      return {
        labels: filteredDates,
        datasets: lineSets,
        chartType: "line",
      };
    }

    // Grouped bar: latest snapshot per course for each metric
    const latestValue = (courseName, key) => {
      const dates = Object.keys(dataReports[courseName] || {});
      if (!dates.length) return 0;
      const latest = dates.sort((a, b) => new Date(b) - new Date(a))[0];
      return dataReports[courseName]?.[latest]?.scanCounts?.[key] || 0;
    };

    const makeBar = (key, label) => ({
      label,
      data: activeCourseNames.map((c) => latestValue(c, key)),
      backgroundColor: METRIC_CONFIG[key].color,
      borderColor: METRIC_CONFIG[key].color,
      borderWidth: 3,
    });

    const bars = [];
    if (visibility.issues) bars.push(makeBar("errors", t("report.header.issues")));
    if (visibility.potentialIssues)
      bars.push(makeBar("potentials", t("report.header.potential")));
    if (visibility.suggestions)
      bars.push(makeBar("suggestions", t("report.header.suggestions")));

    return {
      labels: activeCourseNames,
      datasets: bars,
      chartType: "bar",
    };
  }, [
    dataReports,
    reports,
    isSingleCourse,
    isArrayHistory,
    selectedCourse,
    chartMode,
    visibility.issues,
    visibility.potentialIssues,
    visibility.suggestions,
    allCourseNames,
    activeCourseNames,
    t,
    dateStart,
    dateEnd,
  ]);

  /** ---------- Chart options ---------- */
  const options = useMemo(
    () => ({
      spanGaps: true,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            font: {
              size: 15,
              weight: "normal",
              lineHeight: 1.5,
              family: "'Open Sans', Arial, Helvetica, sans-serif",
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text:
              chartType === "bar"
                ? t("report.header.courses")
                : t("report.label.dates"),
          },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: t("report.label.errors") },
        },
      },
    }),
    [chartType, t]
  );

  /** ---------- Chart lifecycle ---------- */
  useEffect(() => {
    const ctx = canvasRef.current;
    if (!ctx) return;

    // If type changed, recreate; else update in place
    const current = chartRef.current;
    if (!current || current.config.type !== chartType) {
      current?.destroy();
      chartRef.current = new Chart(ctx, { type: chartType, data: { labels, datasets }, options });
      chartRef.current.resize();
    } else {
      current.data.labels = labels;
      current.data.datasets = datasets;
      current.options = options;
      current.update();
      current.resize();
    }

    return () => {
      // Clean up on unmount
      if (chartRef.current && !document.body.contains(ctx)) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, options, chartType]);

  /** ---------- Render ---------- */
  const showModeToggle = !(isSingleCourse || isArrayHistory);
  const selectedCount = Object.values(selectedCourses).filter(Boolean).length;

  return (
    <div className="resolutions-report-container">
      {/* Main chart area */}
      <div className="resolutions-chart-area">
        <h2 className="resolutions-header">
          {t('report.title.barriers_remaining')}
        </h2>
        {showModeToggle && (
          <div className="resolutions-mode-toggle">
            <button
              onClick={() => setChartMode("bar")}
              disabled={chartMode === "bar"}
              className={`resolutions-mode-btn${chartMode === "bar" ? " selected" : ""}`}
            >
              {t("report.button.grouped_bar")}
            </button>
            <button
              onClick={() => setChartMode("line")}
              disabled={chartMode === "line"}
              className={`resolutions-mode-btn${chartMode === "line" ? " selected" : ""}`}
            >
              {t("report.button.line_graph")}
            </button>
          </div>
        )}
        <div className="resolutions-chart-canvas-container">
          <canvas ref={canvasRef} id="resolutionsChart" />
        </div>
      </div>

      {/* Sidebar: always rendered */}
      <SidebarPanel
        showCourseBrowser={!isSingleCourse && !isArrayHistory}
        showDateFilter={chartMode !== "bar"}
        filteredCourseNames={filteredCourseNames}
        selectedCourses={selectedCourses}
        setSelectedCourses={setSelectedCourses}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCount={selectedCount}
        courseLimit={courseLimit}
        t={t}
        dateStart={dateStart}
        setDateStart={setDateStart}
        dateEnd={dateEnd}
        setDateEnd={setDateEnd}
        minWidth={chartMode === "line" ? 305 : 280}
      />
    </div>
  );
}

/** ---------- Helper Functions ---------- */

/*
  The following logic tries to give each course a preferred color based on its name hash,
  then fills in any gaps with unused colors to minimize color reuse.
  It serves to prevent confusion by maintaining consistent color assignments
  when unselecting and selecting courses,
  making it easier to track courses visually in the report.
*/ 

function assignColors(courseNames, palette) {
  const assigned = {};
  const used = new Set();

  // First pass: try to assign preferred color
  courseNames.forEach((name) => {
    const idx = hashString(name) % palette.length;
    if (!used.has(idx)) {
      assigned[name] = idx;
      used.add(idx);
    }
  });

  // Second pass: assign unused colors to remaining courses
  let paletteIdx = 0;
  courseNames.forEach((name) => {
    if (assigned[name] === undefined) {
      // Find next unused color
      while (used.has(paletteIdx) && paletteIdx < palette.length) paletteIdx++;
      if (paletteIdx < palette.length) {
        assigned[name] = paletteIdx;
        used.add(paletteIdx);
      } else {
        // Fallback: reuse colors if more courses than palette
        assigned[name] = hashString(name) % palette.length;
      }
    }
  });

  return assigned;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function makeMetricDataset({ key, data, t }) {
  const config = METRIC_CONFIG[key];
  return {
    label: config.label(t),
    data,
    borderColor: config.color,
    backgroundColor: config.color,
    borderWidth: 3.5,
    borderDash: config.dash,
    tension: 0.4,
  };
}
