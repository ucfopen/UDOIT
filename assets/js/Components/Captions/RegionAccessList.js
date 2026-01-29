import React from "react";
import { vttToMS } from "../../Services/Captions";

export default function RegionAccessList({ cues, onSelect, videoElRef, wavesurferRef }) {
  const srOnlyStyle = {
    position: "absolute",
    left: -9999,
    top: "auto",
    width: 1,
    height: 1,
    overflow: "hidden",
  };

  const focusSeek = (startSec) => {
    const video = videoElRef?.current;
    if (video && video.duration) video.currentTime = startSec;

    const ws = wavesurferRef?.current;
    if (ws?.getDuration?.()) ws.seekTo(startSec / ws.getDuration());
  };

  return (
    <ul style={srOnlyStyle}>
      {cues.map((cue, i) => {
        const startSec = vttToMS(cue.start) / 1000;
        return (
          <li
            key={i}
            tabIndex={0}
            role="button"
            aria-label={`Subtitle region ${i + 1}: ${cue.text}`}
            onFocus={() => focusSeek(startSec)}
            onClick={() => onSelect(i, startSec)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelect(i, startSec);
                e.preventDefault();
              }
            }}
          >
            #{i + 1} {cue.text}
          </li>
        );
      })}
    </ul>
  );
}