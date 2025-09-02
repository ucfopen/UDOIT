import React from 'react'
import './ProgressCircle.css' 

// This component is adapted from https://dev.to/alwarg/how-to-create-an-responsive-percentage-circle-4gg7

export default function ProgressCircle({
  percent,
  radius = 100,
  strokeWidth = 10,
  circlePortion = 50  // 100 = full circle, 50 = half circle, etc.
}) {

  const circumference = 2 * Math.PI * radius
  const partialCircumference = circumference * (circlePortion / 100)
  const percentCircumference = partialCircumference * (percent / 100)
  const rotation = (90 + (((100 - circlePortion) / 100) * 180)).toFixed(1) // Adjust rotation based on circleComplete
  const rotationString = `rotate(${rotation}deg)`
  
  return (
    <svg
      id="progress-circle"
      width={(radius * 2) + strokeWidth + "px"}
      height={(radius * 2) + strokeWidth + "px"}
      viewBox={`0 0 ${(radius * 2) + strokeWidth} ${(radius * 2) + strokeWidth}`}
      style={{ transform: rotationString }}
      xmlns="http://www.w3.org/2000/svg"
      >
      <circle
        id="total-value"
        r={radius}
        cx="50%"
        cy="50%"
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={partialCircumference + ", " + circumference} />
      <circle
        id="progress-value"
        r={radius}
        cx="50%"
        cy="50%"
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={percentCircumference + ", " + circumference} />
    </svg>
  )
}