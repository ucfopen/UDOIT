import React, { useEffect, useRef, useState } from "react";

export default function CaptionEditDialog({ open, cue, onClose, onSave, isDisabled }) {
  const [start, setStart] = useState(cue?.start || "");
  const [end, setEnd] = useState(cue?.end || "");
  const [align, setAlign] = useState(cue?.align || "center");
  const [text, setText] = useState(cue?.text || "");
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open) {
      setStart(cue?.start || "");
      setEnd(cue?.end || "");
      setAlign(cue?.align || "center");
      setText(cue?.text || "");
      setTimeout(() => {
        dialogRef.current?.focus();
      }, 0);
    }
  }, [open, cue]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Caption"
      tabIndex={-1}
      ref={dialogRef}
      style={{
        position: "fixed",
        zIndex: 1000,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
          boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2>Edit Caption</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label>
            Start Time
            <input
              type="text"
              value={start}
              disabled={isDisabled}
              onChange={e => setStart(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            End Time
            <input
              type="text"
              value={end}
              disabled={isDisabled}
              onChange={e => setEnd(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
          <label>
            Position
            <select
              value={align}
              disabled={isDisabled}
              onChange={e => setAlign(e.target.value)}
              style={{ width: "100%" }}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label>
            Caption Text
            <textarea
              value={text}
              disabled={isDisabled}
              onChange={e => setText(e.target.value)}
              style={{ width: "100%", minHeight: 60 }}
            />
          </label>
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} disabled={isDisabled}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ start, end, align, text })}
            disabled={isDisabled}
            style={{ fontWeight: "bold" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}