import React from "react";
import "./ProgressBarCard.css";

export default function ProgressBarCard({ title, percent, caption }) {
  const safePercent = Math.min(100, Math.max(0, Number(percent) || 0));

  return (
    <div className="progress-bar-card">
      <h2>{title}</h2>

      <div
        className="progress-bar-card-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(safePercent)}
      >
        <div
          className="progress-bar-card-fill"
          style={{ width: `${safePercent}%` }}
        />
      </div>

      <p>{caption}</p>
    </div>
  );
}
