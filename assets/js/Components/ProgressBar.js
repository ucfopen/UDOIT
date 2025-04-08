// jadan

import React from 'react'
import './ProgressBar.css' 

export default function ProgressBar({ progress }) {
  return (
    <progress value={(progress).toFixed()} max="100" />
  )
}