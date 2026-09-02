import React from 'react'
import './ProgressBarsCard.css'

export default function ProgressBarsCard({
  title,
  bars = [],
  className = '',
}) {
  const getSafePercent = (value, total) => {
    const safeValue = Math.max(0, Number(value) || 0)
    const safeTotal = Math.max(0, Number(total) || 0)
    return safeTotal > 0 ? Math.min(100, (safeValue / safeTotal) * 100) : 0
  }

  return (
    <div className={`callout-container feedback-container flex-column h-fit p-4 flex-grow-1${className ? ` ${className}` : ''}`}>
      <h2 className="mt-0 text-center">{title}</h2>
      <div className="progress-bars-card-bars">
        {bars.map(({ label, value, total, type }) => {
          const safeValue = Math.max(0, Number(value) || 0)
          const safeTotal = Math.max(0, Number(total) || 0)
          const percent = getSafePercent(safeValue, safeTotal)

          return (
            <div className="progress-bars-card-bar" key={label}>
              <div className="progress-bars-card-label-row">
                <div className="progress-bars-card-label">{label}</div>
                <div className="subtext">{safeValue} of {safeTotal}</div>
              </div>
              <div
                className="progress-bars-card-track"
                role="progressbar"
                aria-label={label}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(percent)}
              >
                <div
                  className={`progress-bars-card-fill${type ? ` type-${type}` : ''}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
