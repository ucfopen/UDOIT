import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Regions from "wavesurfer.js/dist/plugins/regions.esm.js";
import CaptionEditDialog from "./CaptionEditDialog";
import {
  parseVTT,
  buildVttText,
  vttToMS,
  formatTimeVTT,
  formatVTTTime,
  computeVTTDuration,
} from "../../Services/Captions";
import useWaveformKeyboard from "./useWaveformKeyboard";

/**
 * MediaCaptionsEditor
 *
 * Minimal props you probably want in a larger project:
 * - t: translation fn
 * - initialVideoUrl?: string  (if you already have a media URL)
 * - initialVttText?: string   (if you already have captions content)
 * - onSaveVtt?: ({ vttText, cues }) => void
 * - isDisabled?: boolean
 */
export default function MediaCaptionsEditor({
  t,
  initialVideoUrl,
  initialVttText,
  onSaveVtt,
  isDisabled = false,
}) {
  const [videoFile, setVideoFile] = useState(null);
  const [vttFile, setVttFile] = useState(null);

  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || null);
  const [cues, setCues] = useState(() => (initialVttText ? parseVTT(initialVttText) : []));
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState("");
  const [activeRegion, setActiveRegion] = useState(-1);

  const videoElRef = useRef(null);
  const wavesurferRef = useRef(null);
  const timelineRef = useRef(null);
  const waveformFocusRef = useRef(null);

  // Unique id counter for cues
  const [cueIdCounter, setCueIdCounter] = useState(1);

  // Ensure cues have unique ids on initial load
  useEffect(() => {
    if (initialVttText) {
      const parsed = parseVTT(initialVttText).map((cue, i) => ({
        ...cue,
        id: cue.id || `cue-${Date.now()}-${i}`,
      }));
      setCues(parsed);
      setCueIdCounter(parsed.length + 1);
    }
  }, [initialVttText]);

  // ---- object URL handling for uploaded video file
  useEffect(() => {
    if (!videoFile) return;

    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  // ---- read uploaded VTT file
  useEffect(() => {
    if (!vttFile) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const parsed = parseVTT(text).map((cue, i) => ({
        ...cue,
        id: cue.id || `cue-${Date.now()}-${i}`,
      }));
      setCues(parsed);
      setCueIdCounter(parsed.length + 1);
      setSelectedIndex(-1);
      setError("");
    };
    reader.readAsText(vttFile);
  }, [vttFile]);

  // ---- keep <track> updated as cues change
  useEffect(() => {
    const video = videoElRef.current;
    if (!video) return;

    // clear old tracks
    Array.from(video.querySelectorAll("track")).forEach((tr) => tr.remove());

    const vttText = buildVttText(cues);
    const blob = new Blob([vttText], { type: "text/vtt" });
    const blobUrl = URL.createObjectURL(blob);

    const track = document.createElement("track");
    track.kind = "subtitles";
    track.label = "Captions";
    track.srclang = "en";
    track.default = true;
    track.src = blobUrl;

    video.appendChild(track);

    return () => URL.revokeObjectURL(blobUrl);
  }, [cues]);

  // ---- Wavesurfer plugins (MUST be memoized)
  const plugins = useMemo(() => {
    return [
      Timeline.create({ container: timelineRef.current, timeInterval: 1 }),
      Regions.create(),
    ];
  }, []);

  const findRegionsPlugin = useCallback((ws) => {
    if (!ws?.getActivePlugins) return null;
    const pluginsActive = ws.getActivePlugins();
    return (
      pluginsActive.find(
        (p) => typeof p?.addRegion === "function" && typeof p?.getRegions === "function"
      ) || null
    );
  }, []);

  const onWsReady = useCallback(
    (ws) => {
      wavesurferRef.current = ws;
      ws.setMuted(true);

      // Sync play/pause to video
      const video = videoElRef.current;
      if (!video) return;

      const onPause = () => ws.pause();
      const onPlay = () => {
        if (!video.duration) return;
        ws.seekTo(video.currentTime / video.duration);
        ws.play();
      };

      video.addEventListener("pause", onPause);
      video.addEventListener("play", onPlay);

      // cleanup listener if ws re-inits
      ws.once?.("destroy", () => {
        video.removeEventListener("pause", onPause);
        video.removeEventListener("play", onPlay);
      });
    },
    []
  );

  // ---- render regions whenever cues or selection changes
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const regionsPlugin = findRegionsPlugin(ws);
    if (!regionsPlugin) return;

    // remove existing regions
    const existing = regionsPlugin.getRegions?.() || [];
    existing.forEach((r) => { try { r.remove(); } catch {} });

    cues.forEach((cue, i) => {
      const start = vttToMS(cue.start) / 1000;
      const end = vttToMS(cue.end) / 1000;

      const region = regionsPlugin.addRegion({
        id: "sub_" + i,
        start,
        end,
        drag: true,
        resize: true,
        content: `#${i + 1}\t${cue.text}`,
        color: i === selectedIndex ? "rgba(50,150,255,0.35)" : "rgba(120,120,120,0.18)",
      });

      region.data = { index: i };

      if (region.element) {
        region.element.removeAttribute('tabindex');
        region.element.setAttribute('tabindex', '-1');
        region.element.setAttribute('aria-hidden', 'true');
        region.element.setAttribute('role', 'presentation');
        region.element.style.outline = 'none';
        region.element.setAttribute(
          'aria-label',
          `Region ${i + 1}, from ${cue.start} to ${cue.end}: ${cue.text}`
        );
      }

      // dblclick seeks inside the region
      region.on("dblclick", (e) => {
        let seekTime = region.start;
        try {
          const bbox = ws.getWrapper().getBoundingClientRect();
          const x = e.clientX - bbox.left;
          const duration = ws.getDuration();
          const pxPerSec = bbox.width / duration;
          let clickTime = x / pxPerSec;
          if (clickTime < region.start) clickTime = region.start;
          if (clickTime > region.end) clickTime = region.end;
          seekTime = clickTime;
        } catch {}
        selectCue(i, seekTime);
      });
    });
  }, [cues, selectedIndex, findRegionsPlugin]);

  // Hook: keyboard layers
  const {
  waveKbLayer,
  activeMode,
  setWaveKbLayer,
  setActiveMode,
  onWaveformKeyDown,
  applyRegionHighlight,
  sanitizeRegionsDom,
  } = useWaveformKeyboard({
    cues,
    setCues,
    selectedIndex,
    wavesurferRef,
    videoElRef,
    findRegionsPlugin,
    activeRegion,
    setActiveRegion,
  });

  // Sanitize after regions render (handles late DOM changes)
  useEffect(() => {
    sanitizeRegionsDom();
  }, [sanitizeRegionsDom, cues]);

  // ---- when region is dragged/resized, write back to cues
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const regionsPlugin = findRegionsPlugin(ws);
    if (!regionsPlugin?.on) return;

    const handler = (region) => {
      const idx = region?.data?.index;
      if (typeof idx !== "number") return;
      if (!cues[idx]) return;

      const start = formatTimeVTT(region.start);
      const end = formatTimeVTT(region.end);

      // validate before applying
      if (vttToMS(start) >= vttToMS(end)) return;

      setCues((prev) =>
        prev.map((c, i) =>
          i !== idx ? c : { ...c, start, end, duration: computeVTTDuration(start, end) }
        )
      );
    };

    regionsPlugin.on("region-updated", handler);
    return () => {
      try {
        regionsPlugin.un?.("region-updated", handler);
      } catch {
        // ignore
      }
    };
  }, [cues, findRegionsPlugin]);

  const selectCue = useCallback((idx, seekSeconds) => {
    setSelectedIndex(idx);

    if (typeof seekSeconds === "number") {
      const video = videoElRef.current;
      if (!video) return;

      const wasPlaying = !video.paused;
      video.currentTime = seekSeconds;

      const ws = wavesurferRef.current;
      if (ws && video.duration) ws.seekTo(seekSeconds / video.duration);

      if (wasPlaying) video.play();
      else video.pause();
    }
  }, []);

  const updateCueText = useCallback((idx, value) => {
    setCues((prev) => {
      const cue = prev[idx];
      if (!cue) return prev;

      const trimmed = String(value ?? "").trim();
      if (trimmed === cue.text) return prev;

      return prev.map((c, i) => (i === idx ? { ...c, text: trimmed } : c));
    });
  }, []);

  const seekBy = useCallback((deltaSeconds) => {
    const video = videoElRef.current;
    if (!video?.duration) return;

    let next = video.currentTime + deltaSeconds;
    next = Math.max(0, Math.min(video.duration, next));
    video.currentTime = next;

    const ws = wavesurferRef.current;
    if (ws && video.duration) ws.seekTo(next / video.duration);

    if (video.paused) {
      video.play();
      setTimeout(() => video.pause(), 50);
    }
  }, []);

  const playPause = useCallback(() => {
    const video = videoElRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }, []);

  const playCurrent = useCallback(() => {
    const video = videoElRef.current;
    if (!video) return;
    if (selectedIndex < 0 || !cues[selectedIndex]) return;

    const cue = cues[selectedIndex];
    const start = vttToMS(cue.start) / 1000;
    const end = vttToMS(cue.end) / 1000;

    video.currentTime = start;
    video.play();

    let raf = null;
    const tick = () => {
      if (!video) return;
      if (video.currentTime >= end) {
        video.pause();
        video.currentTime = end;
        raf = null;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => raf && cancelAnimationFrame(raf);
  }, [cues, selectedIndex]);

  const insertCue = useCallback(() => {
    const video = videoElRef.current;
    if (!video) return;
    if (!video.duration) return;

    const currentTime = video.currentTime;
    const defaultDuration = 1.0;

    let insertAt = 0;
    let newStart = 0;

    if (selectedIndex !== -1 && cues[selectedIndex]) {
      const cue = cues[selectedIndex];
      newStart = vttToMS(cue.end) / 1000;
      insertAt = selectedIndex + 1;
    } else {
      const insideIndex = cues.findIndex((cue) => {
        const s = vttToMS(cue.start) / 1000;
        const e = vttToMS(cue.end) / 1000;
        return currentTime >= s && currentTime <= e;
      });

      if (insideIndex !== -1) {
        const cue = cues[insideIndex];
        newStart = vttToMS(cue.end) / 1000;
        insertAt = insideIndex + 1;
      } else {
        newStart = currentTime;
        insertAt = cues.findIndex((cue) => vttToMS(cue.start) / 1000 > currentTime);
        if (insertAt === -1) insertAt = cues.length;
      }
    }

    const newEnd = Math.min(newStart + defaultDuration, video.duration);

    setCues((prev) => {
      const next = prev.slice();
      // Don't mutate nextCue in place!
      const nextCue = next[insertAt];
      if (nextCue) {
        const nextStart = vttToMS(nextCue.start) / 1000;
        const nextEnd = vttToMS(nextCue.end) / 1000;
        if (nextStart < newEnd) {
          const trimmedStart = newEnd;
          if (trimmedStart >= nextEnd) {
            next.splice(insertAt, 1);
          } else {
            next[insertAt] = {
              ...nextCue,
              start: formatVTTTime(trimmedStart),
              duration: (nextEnd - trimmedStart).toFixed(3),
            };
          }
        }
      }
      const newCue = {
        index: insertAt + 1,
        id: `cue-${Date.now()}-${cueIdCounter}`,
        start: formatVTTTime(newStart),
        end: formatVTTTime(newEnd),
        duration: (newEnd - newStart).toFixed(3),
        text: "",
        position: 50,
        align: "center",
      };
      next.splice(insertAt, 0, newCue);
      // Re-index
      return next.map((cue, i) => ({ ...cue, index: i + 1 }));
    });
    setCueIdCounter((c) => c + 1);
    setSelectedIndex(insertAt);
  }, [cues, selectedIndex, cueIdCounter]);

  const deleteCue = useCallback(() => {
    if (selectedIndex < 0 || !cues[selectedIndex]) return;

    setCues((prev) => {
      const next = prev.slice();
      next.splice(selectedIndex, 1);
      return next.map((cue, i) => ({ ...cue, index: i + 1 }));
    });
    setSelectedIndex(-1);
  }, [cues, selectedIndex]);

  const onSave = useCallback(() => {
    const vttText = buildVttText(cues);

    if (typeof onSaveVtt === "function") {
      onSaveVtt({ vttText, cues });
      return;
    }

    // fallback: download
    const blob = new Blob([vttText], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "captions.vtt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [cues, onSaveVtt]);

  const onWaveWheel = useCallback((e) => {
    e.preventDefault();
    const video = videoElRef.current;
    if (!video?.duration) return;

    const delta = e.deltaY < 0 ? 1 : -1;
    let newTime = video.currentTime + delta * 0.2;
    newTime = Math.max(0, Math.min(video.duration, newTime));
    video.currentTime = newTime;

    const ws = wavesurferRef.current;
    if (ws && video.duration) ws.seekTo(newTime / video.duration);
  }, []);

  const [focusLayer, setFocusLayer] = useState("top");
  const [focusedRow, setFocusedRow] = useState(-1);
  const [focusedField, setFocusedField] = useState(-1);

  // Focus management for table and layers
  useEffect(() => {
    if (focusLayer === "table" && focusedRow === -1) {
      document.getElementById("table-focus-layer")?.focus();
    }
    if (focusLayer === "table" && focusedRow >= 0) {
      document.getElementById(`cue-row-${focusedRow}`)?.focus();
    }
    if (focusLayer === "row" && focusedRow >= 0 && focusedField >= 0) {
      document.getElementById(`cue-field-${focusedRow}-${focusedField}`)?.focus();
    }
  }, [focusLayer, focusedRow, focusedField]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogCueIndex, setDialogCueIndex] = useState(-1);

  // Store refs to each Edit button
  const editButtonRefs = useRef([]);

  // Add this function to handle saving dialog changes
  const handleDialogSave = ({ start, end, align, text }) => {
    const rowToFocus = dialogCueIndex;
    setCues(prev =>
      prev.map((cue, i) =>
        i === rowToFocus
          ? {
              ...cue,
              start,
              end,
              align,
              text,
              duration: computeVTTDuration(start, end),
            }
          : cue
      )
    );
    setDialogOpen(false);
    setDialogCueIndex(-1);
    setTimeout(() => {
      editButtonRefs.current[rowToFocus]?.focus();
    }, 0);
  };

  // When dialog is closed without saving, also restore focus
  const handleDialogClose = () => {
    const rowToFocus = dialogCueIndex;
    setDialogOpen(false);
    setTimeout(() => {
      editButtonRefs.current[rowToFocus]?.focus();
    }, 0);
    setDialogCueIndex(-1);
  };

  const [waveformFocused, setWaveformFocused] = useState(false);

  // Wait for the waveform to render
  useEffect(() => {
    const interval = setInterval(() => {
      const wrapper = document.querySelector('.wrapper');
      if (wrapper) {
        wrapper.removeAttribute('tabindex');
        wrapper.setAttribute('tabindex', '-1');
        wrapper.setAttribute('aria-hidden', 'true');
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="media-captions-editor" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label>
          Load Video{" "}
          <input
            type="file"
            accept="video/*"
            disabled={isDisabled}
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </label>
        <label>
          Load Subtitles (VTT){" "}
          <input
            type="file"
            accept=".vtt"
            disabled={isDisabled}
            onChange={(e) => setVttFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="button" className="btn-secondary" disabled={isDisabled || cues.length === 0} onClick={onSave}>
          Save VTT
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: 12, minHeight: 0 }}>
        {/* Left: table with focus layer */}
        <div
          tabIndex={focusLayer === "top" ? 0 : -1}
          id="table-focus-layer"
          aria-label="Captions List"
          style={{
            overflow: "auto",
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 8,
            maxHeight: "59vh",
            display: "flex",
            flexDirection: "column"
          }}
          onKeyDown={(e) => {
            if (focusLayer === "top" && (e.key === "Enter" || e.key === " ")) {
              setFocusLayer("table");
              setFocusedRow(0);
              e.preventDefault();
            }
            if (focusLayer === "table" && focusedRow === -1 && e.key === "Enter") {
              setFocusedRow(0);
              e.preventDefault();
            }
            if (focusLayer === "table" && focusedRow === -1 && e.key === "Escape") {
              setFocusLayer("top");
              e.preventDefault();
            }
          }}
          onFocus={() => {
            if (focusLayer !== "row") setFocusLayer("table");
            setFocusedRow(-1);
          }}
        >
          <ul aria-label="Caption list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {cues.map((cue, i) => {
              const active = i === selectedIndex;
              return (
                <li
                  key={cue.id || i}
                  id={`cue-row-${i}`}
                  tabIndex={focusLayer === "table" && focusedRow === i ? 0 : -1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    background: active ? "#eef6ff" : undefined,
                    borderRadius: 4,
                    padding: 4,
                  }}
                  onClick={() => setSelectedIndex(i)}
                  role="group"
                  aria-label={`Caption ${i + 1}`}
                  onDoubleClick={() => selectCue(i, vttToMS(cue.start) / 1000)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown" && i < cues.length - 1) {
                      setFocusedRow(i + 1);
                      e.preventDefault();
                    }
                    if (e.key === "ArrowUp" && i > 0) {
                      setFocusedRow(i - 1);
                      e.preventDefault();
                    }
                    if (e.key === "Escape") {
                      setFocusedRow(-1);
                      document.getElementById("table-focus-layer")?.focus();
                      e.preventDefault();
                    }
                    if (e.key === "Enter") {
                      setFocusLayer("row");
                      setFocusedField(0);
                      e.preventDefault();
                    }
                  }}
                  onFocus={() => {
                    setFocusLayer("table");
                    setFocusedRow(i);
                  }}
                >
                  <span style={{ minWidth: 24, textAlign: "right" }}>{i + 1}</span>
                  <input
                    id={`cue-field-${i}-0`}
                    type="text"
                    defaultValue={cue.text}
                    disabled={isDisabled}
                    style={{ flex: 2, minWidth: 0 }}
                    aria-label={`Caption ${i + 1} text`}
                    onBlur={(e) => updateCueText(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                        e.preventDefault();
                      }
                    }}
                  />
                  <button
                    type="button"
                    aria-label={`Edit details for caption ${i + 1}`}
                    disabled={isDisabled}
                    style={{ marginLeft: 8 }}
                    ref={el => (editButtonRefs.current[i] = el)}
                    onClick={() => {
                      setDialogOpen(true);
                      setDialogCueIndex(i);
                    }}
                  >
                    Edit
                  </button>
                </li>
              );
            })}
          </ul>
          <div style={{ color: "red", minHeight: 18, marginTop: 6 }}>{error}</div>
        </div>
        {/* Right: video + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          <div style={{ background: "#000", borderRadius: 6, overflow: "hidden", aspectRatio: "16/9", width: "100%", maxWidth: "100%" }}>
            <video
              ref={videoElRef}
              src={videoUrl || undefined}
              style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              controls={false}
            />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" className="btn-secondary" disabled={isDisabled} onClick={() => seekBy(-1)}>
              ◀◀ 1s
            </button>
            <button type="button" className="btn-secondary" disabled={isDisabled} onClick={playPause}>
              Play/Pause
            </button>
            <button type="button" className="btn-secondary" disabled={isDisabled} onClick={() => seekBy(1)}>
              1s ▶▶
            </button>

            <button type="button" className="btn-secondary" disabled={isDisabled} onClick={playCurrent}>
              Play Current
            </button>

            <button type="button" className="btn-secondary" disabled={isDisabled} onClick={insertCue}>
              Insert
            </button>
            <button type="button" className="btn-secondary" disabled={isDisabled} onClick={deleteCue}>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Waveform focus container */}
      <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
        <div
          ref={waveformFocusRef}
          tabIndex={0}
          aria-label="Waveform. Press Enter to navigate regions, Tab to cycle, Escape to go back."
          onKeyDown={onWaveformKeyDown}
          onFocus={() => setWaveformFocused(true)}
          onBlur={() => setWaveformFocused(false)}
          style={{
            outline: waveformFocused && waveKbLayer === 'wave' ? '3px solid #1976d2' : 'none',
            boxShadow: waveformFocused && waveKbLayer === 'wave' ? '0 0 0 4px #90caf9' : 'none'
          }}
        >
          <div onWheel={onWaveWheel}>
            <WavesurferPlayer
              key={videoUrl || "no-url"}
              url={videoUrl || undefined}
              height={120}
              normalize
              hideScrollbar
              minPxPerSec={100}
              interact={false}
              waveColor="#595656ff"
              progressColor="#1976d2"
              plugins={plugins}
              onReady={onWsReady}
            />
          </div>
          <div ref={timelineRef} />
        </div>
      </div>

      <CaptionEditDialog
        open={dialogOpen}
        cue={cues[dialogCueIndex]}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        isDisabled={isDisabled}
      />
    </div>
  );
}