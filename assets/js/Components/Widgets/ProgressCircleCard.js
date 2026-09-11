import React from 'react'
import ProgressCircle from './ProgressCircle'
import './ProgressCircleCard.css'

export default function ProgressCircleCard({
  title,
  percent,
  caption,
  radius = 60,
  strokeWidth = 15,
  className = '',
}) {
  const safePercent = Math.min(100, Math.max(0, Number(percent) || 0))
  const roundedPercent = safePercent.toFixed(0)

  return (
    <div className={`callout-container feedback-container flex-column h-fit p-4 flex-grow-1${className ? ` ${className}` : ''}`}>
      <h2 className="mt-0 text-center">{title}</h2>
      <div className="flex-row align-self-center">
        <div className="flex-column progress-circle-card-container">
          <div className="flex-row justify-content-center" aria-label={`${roundedPercent}%`}>
            <div className="progress-circle-card-svg-container mt-3" aria-hidden="true">
              <ProgressCircle
                percent={safePercent}
                radius={radius}
                circlePortion={100}
                strokeWidth={strokeWidth}/>
              <div className="progress-circle-card-text-container flex-column justify-content-center">
                <div className="progress-circle-card-text">{roundedPercent}%</div>
              </div>
            </div>
          </div>
          {caption && (
            <div className="subtext text-center mt-3">
              {caption}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
