import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Regions from "wavesurfer.js/dist/plugins/regions.esm.js";

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

  const videoElRef = useRef(null);
  const wavesurferRef = useRef(null);
  const timelineRef = useRef(null);

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
      setCues(parseVTT(text));
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
    existing.forEach((r) => {
      try {
        r.remove();
      } catch {
        // ignore
      }
    });

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

      // make region focusable for keyboard
      if (region.element) {
        region.element.setAttribute("role", "button");
        region.element.setAttribute("tabindex", "0");
        region.element.setAttribute("aria-label", `Subtitle region ${i + 1}: ${cue.text}`);

        region.element.onkeydown = null;
        region.element.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            selectCue(i, start);
            e.preventDefault();
          }
        });
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
        } catch {
          // ignore
        }

        selectCue(i, seekTime);
      });
    });
  }, [cues, selectedIndex, findRegionsPlugin]);

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

  const updateCueTime = useCallback((idx, field, value) => {
    setCues((prev) => {
      const cue = prev[idx];
      if (!cue) return prev;

      const nextStart = field === "start" ? value : cue.start;
      const nextEnd = field === "end" ? value : cue.end;

      if (vttToMS(nextStart) >= vttToMS(nextEnd)) {
        setError(t("form.media_captions.error_time_order") || "Start time must be less than end time.");
        return prev;
      }

      setError("");

      const next = prev.map((c, i) =>
        i === idx ? { ...c, start: nextStart, end: nextEnd, duration: computeVTTDuration(nextStart, nextEnd) } : c
      );
      return next;
    });
  }, [t]);

  const updateCueText = useCallback((idx, value) => {
    setCues((prev) => {
      const cue = prev[idx];
      if (!cue) return prev;

      const trimmed = String(value ?? "").trim();
      if (trimmed === cue.text) return prev;

      return prev.map((c, i) => (i === idx ? { ...c, text: trimmed } : c));
    });
  }, []);

  const setAlign = useCallback((idx, position, align) => {
    setCues((prev) => prev.map((c, i) => (i === idx ? { ...c, position, align } : c)));
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

    const newCue = {
      index: 0,
      id: null,
      start: formatVTTTime(newStart),
      end: formatVTTTime(newEnd),
      duration: (newEnd - newStart).toFixed(3),
      text: "",
      position: 50,
      align: "center",
    };

    const next = cues.slice();
    const nextCue = next[insertAt];

    if (nextCue) {
      const nextStart = vttToMS(nextCue.start) / 1000;
      const nextEnd = vttToMS(nextCue.end) / 1000;

      if (nextStart < newEnd) {
        const trimmedStart = newEnd;
        if (trimmedStart >= nextEnd) {
          next.splice(insertAt, 1);
        } else {
          nextCue.start = formatVTTTime(trimmedStart);
          nextCue.duration = (nextEnd - trimmedStart).toFixed(3);
        }
      }
    }

    next.splice(insertAt, 0, newCue);
    next.forEach((cue, i) => (cue.index = i + 1));

    setCues(next);
    setSelectedIndex(insertAt);
  }, [cues, selectedIndex]);

  const deleteCue = useCallback(() => {
    if (selectedIndex < 0 || !cues[selectedIndex]) return;

    const next = cues.slice();
    next.splice(selectedIndex, 1);
    next.forEach((cue, i) => (cue.index = i + 1));

    setCues(next);
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

  return (
    <div className="media-captions-editor" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Loaders (optional if you pass initialVideoUrl / initialVttText) */}
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
        {/* Left: table */}
        <div style={{ overflow: "auto", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Text</th>
                <th style={thStyle}>Start</th>
                <th style={thStyle}>End</th>
                <th style={thStyle}>Duration</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Align</th>
              </tr>
            </thead>
            <tbody>
              {cues.map((cue, i) => {
                const active = i === selectedIndex;
                return (
                  <tr
                    key={i}
                    style={active ? { background: "#eef6ff" } : undefined}
                    onClick={() => setSelectedIndex(i)}
                    onDoubleClick={() => selectCue(i, vttToMS(cue.start) / 1000)}
                  >
                    <td style={tdStyle}>{cue.index}</td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        defaultValue={cue.text}
                        disabled={isDisabled}
                        style={{ width: "98%" }}
                        onBlur={(e) => updateCueText(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                            e.preventDefault();
                          }
                        }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={cue.start}
                        disabled={isDisabled}
                        style={{ width: 110 }}
                        onChange={(e) => updateCueTime(i, "start", e.target.value)}
                        onBlur={(e) => {
                          const norm = normalizeVttTime(e.target.value);
                          if (norm !== cue.start) updateCueTime(i, "start", norm);
                        }}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={cue.end}
                        disabled={isDisabled}
                        style={{ width: 110 }}
                        onChange={(e) => updateCueTime(i, "end", e.target.value)}
                        onBlur={(e) => {
                          const norm = normalizeVttTime(e.target.value);
                          if (norm !== cue.end) updateCueTime(i, "end", norm);
                        }}
                      />
                    </td>
                    <td style={tdStyle}>{cue.duration}</td>
                    <td style={{ ...tdStyle, textAlign: "center", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        disabled={isDisabled}
                        style={cue.position === 0 ? strongBtn : btn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlign(i, 0, "start");
                        }}
                      >
                        L
                      </button>
                      <button
                        type="button"
                        disabled={isDisabled}
                        style={cue.position === 50 ? strongBtn : btn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlign(i, 50, "center");
                        }}
                      >
                        C
                      </button>
                      <button
                        type="button"
                        disabled={isDisabled}
                        style={cue.position === 100 ? strongBtn : btn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlign(i, 100, "end");
                        }}
                      >
                        R
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ color: "red", minHeight: 18, marginTop: 6 }}>{error}</div>
        </div>

        {/* Right: video + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
          <div style={{ background: "#000", borderRadius: 6, overflow: "hidden", flex: "1 1 0", minHeight: 220 }}>
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

      {/* Waveform */}
      <div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
        <div onWheel={onWaveWheel}>
          <WavesurferPlayer
            url={videoUrl || undefined}
            height={120}
            normalize
            hideScrollbar
            minPxPerSec={100}
            interact={false}
            waveColor="#231e1eff"
            progressColor="#1976d2"
            plugins={plugins}
            onReady={onWsReady}
          />
        </div>
        <div ref={timelineRef} />
      </div>

      {/* Offscreen list for keyboard access to regions */}
      <RegionAccessList
        cues={cues}
        onSelect={(idx, startSec) => selectCue(idx, startSec)}
        videoElRef={videoElRef}
        wavesurferRef={wavesurferRef}
      />
    </div>
  );
}

/* ---------------------------
   RegionAccessList (in-file)
--------------------------- */

function RegionAccessList({ cues, onSelect, videoElRef, wavesurferRef }) {
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

/* ---------------------------
   Helpers: VTT parsing/building
--------------------------- */

function parseVTT(data) {
  const lines = String(data || "").split(/\r?\n/);
  const out = [];
  let i = 0;

  if (lines[i]?.includes("WEBVTT")) i++;

  while (i < lines.length) {
    let line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    if (line.startsWith("NOTE")) {
      while (lines[++i]?.trim() !== "") {}
      continue;
    }

    let cueId = null;
    if (!line.includes("-->")) {
      cueId = line;
      line = lines[++i]?.trim();
    }

    if (!line?.includes("-->")) {
      i++;
      continue;
    }

    const [start, restRaw] = line.split("-->").map((s) => s.trim());
    let end = restRaw;
    let position = 50;
    let align = "center";

    const settingsMatch = restRaw.match(/([0-9:.]+)\s+(.*)/);
    if (settingsMatch) {
      end = settingsMatch[1];
      const settings = settingsMatch[2].split(/\s+/);
      settings.forEach((s) => {
        if (s.startsWith("position:")) position = parseInt(s.split(":")[1], 10);
        if (s.startsWith("align:")) align = s.split(":")[1];
      });
    }

    i++;

    let text = "";
    while (lines[i]?.trim()) text += lines[i++] + "\n";
    text = text.trim();
    i++;

    out.push({
      index: out.length + 1,
      id: cueId,
      start,
      end,
      duration: computeVTTDuration(start, end),
      text,
      position,
      align,
    });
  }

  return out;
}

function buildVttText(cues) {
  return (
    "WEBVTT\n\n" +
    cues
      .map(
        (cue) =>
          `${cue.start} --> ${cue.end} position:${cue.position}% align:${cue.align}\n${cue.text}\n`
      )
      .join("\n")
  );
}

function vttToMS(t) {
  const parts = String(t || "").split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return Number(h) * 3600000 + Number(m) * 60000 + Number(s) * 1000;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return Number(m) * 60000 + Number(s) * 1000;
  }
  return 0;
}

function computeVTTDuration(start, end) {
  return ((vttToMS(end) - vttToMS(start)) / 1000).toFixed(3);
}

function formatTimeVTT(seconds) {
  const ms = Math.floor((seconds % 1) * 1000);
  const totalSeconds = Math.floor(seconds);
  const s = totalSeconds % 60;
  const m = Math.floor((totalSeconds / 60) % 60);
  const h = Math.floor(totalSeconds / 3600);
  return (
    String(h).padStart(2, "0") +
    ":" +
    String(m).padStart(2, "0") +
    ":" +
    String(s).padStart(2, "0") +
    "." +
    String(ms).padStart(3, "0")
  );
}

function formatVTTTime(sec) {
  return formatTimeVTT(sec);
}

function normalizeVttTime(str) {
  // Accepts "00:00:00.7" or "00:00:00.70" and returns "00:00:00.700"
  const match = String(str).match(/^(\d{2}):(\d{2}):(\d{2})(\.(\d{1,3}))?$/);
  if (!match) return str;
  const ms = (match[5] || "0").padEnd(3, "0").slice(0, 3);
  return `${match[1]}:${match[2]}:${match[3]}.${ms}`;
}

const thStyle = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "6px 4px",
  position: "sticky",
  top: 0,
  background: "#fff",
  zIndex: 1,
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "6px 4px",
  verticalAlign: "top",
};

const btn = {
  marginLeft: 4,
  padding: "2px 8px",
};

const strongBtn = {
  ...btn,
  fontWeight: "bold",
};
