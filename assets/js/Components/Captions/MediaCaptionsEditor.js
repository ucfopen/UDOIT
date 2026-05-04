import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Regions from "wavesurfer.js/dist/plugins/regions.esm.js";
import CaptionEditDialog from "./CaptionEditDialog";
import AddIcon from "../Icons/AddIcon";
import CaptionIcon from "../Icons/CaptionIcon";
import DeleteIcon from "../Icons/DeleteIcon";
import ProgressIcon from "../Icons/ProgressIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import './MediaCaptions.css';
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
  addMessage,
  lmsFileData,
  initialVideoUrl,
  initialVttText,
  onSaveVtt,
  isDisabled = false,
}) {
  const [videoFile, setVideoFile] = useState(null);
  const [vttFile, setVttFile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || null);
  const [cues, setCues] = useState(() => (initialVttText ? parseVTT(initialVttText) : []));
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState("");
  const [activeRegion, setActiveRegion] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);

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

  useEffect(() => {
    if(!lmsFileData) return;
    setIsLoading(true);

    if (lmsFileData?.downloadUrl) {
      setVideoUrl(lmsFileData.downloadUrl)
    }

    if (lmsFileData?.metadata?.media_entry_id) {
      console.log("Found media_entry_id in LMS file data metadata:", lmsFileData.metadata.media_entry_id);
    }
  }, [lmsFileData])

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

      setIsLoading(false);
    },
    []
  );

  const sortCues = (tempCues = cues, activeId = cues[selectedIndex]?.id) => {
    tempCues = Object.values(tempCues).sort((a, b) => vttToMS(a.start) - vttToMS(b.start));
    setCues(tempCues);

    let newIndex = tempCues.findIndex(c => c.id === activeId);
    setSelectedIndex(newIndex);
  }

  const setVideoTime = (seconds) => {
    const video = videoElRef.current;
    if (!video) return;
    video.currentTime = seconds;
  };

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
        content: cue.text,
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
          `Region from ${cue.start} to ${cue.end}: ${cue.text}`
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

      const activeCueId = cues[idx].id;

      const start = formatTimeVTT(region.start);
      const end = formatTimeVTT(region.end);

      // validate before applying
      if (vttToMS(start) >= vttToMS(end)) return;

      let tempCues = cues.map((c, i) => {
        if (i !== idx) return c;
        return { ...c, start, end, duration: computeVTTDuration(start, end) };
      })
      sortCues(tempCues, activeCueId);
      setVideoTime(region.start);
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
      setCurrentTime(seekSeconds);
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

    // if (video.paused) {
    //   video.play();
    //   setTimeout(() => video.pause(), 50);
    // }
  }, []);

  const playPause = useCallback(() => {
    const video = videoElRef.current;
    if (!video) return;
    if (video.paused) {
      video.currentTime = currentTime;
      video.play();
    }
    else {
      setCurrentTime(video.currentTime);
      video.pause();
    }
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

  const insertCue = useCallback((cueId, before = true, fromPlayer = false) => {
    const video = videoElRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const defaultDuration = 2.0;
    const defaultGap = 0;

    let insertAt = 0;
    let newStart = 0;
    let newEnd = 0;

    // Special case: the first caption added OR inserting from the player without a cueId.
    if (cueId === -1) {
      if(fromPlayer) {
        newStart = currentTime;
        newEnd = currentTime + defaultDuration;
      }
      else {
        newStart = 0;
        newEnd = defaultDuration;
      }
    }

    // If inserting near an existing cue, use that as a reference for start/end times
    else if (cues[cueId]) {
      if (before) {
        newEnd = vttToMS(cues[cueId].start) / 1000 - defaultGap;
        newStart = Math.max(0, newEnd - defaultDuration);
        if (cues[cueId - 1]) {
          let previousEnd = vttToMS(cues[cueId - 1].end) / 1000;
          newStart = Math.max(newStart, previousEnd + defaultGap);
        }
      }
      else {
        newStart = vttToMS(cues[cueId].end) / 1000 + defaultGap;
        newEnd = newStart + defaultDuration;
        if (cues[cueId + 1]) {
          let nextStart = vttToMS(cues[cueId + 1].start) / 1000;
          newEnd = Math.min(newEnd, nextStart - defaultGap);
        }
      }
    }

    else {
      console.warn("Cue ID not found:", cueId);
      return;
    }

    let duration = newEnd - newStart;
    if (duration <= 0) {
      addMessage({ message: "No room to insert caption.", severity: "alert", visible: true });
      return;
    }

    const insertedCueId = `cue-${Date.now()}-${cueIdCounter}`;
    setCueIdCounter((c) => c + 1);

    const newCue = {
      id: insertedCueId,
      start: formatVTTTime(newStart),
      end: formatVTTTime(newEnd),
      duration: (newEnd - newStart).toFixed(3),
      text: "",
      position: 50,
      align: "center",
    }

    let tempCues = Object.assign({}, cues, { [cues.length]: newCue });
    sortCues(tempCues, insertedCueId);

    return;
  }, [cues, selectedIndex, cueIdCounter]);

  const deleteCue = useCallback((cueId) => {
    let tempCues = cues.filter((c, i) => i !== cueId);
    
    if(tempCues[cueId - 1]) {
      setSelectedIndex(cueId - 1);
    }
    else {
      setSelectedIndex(-1);
    }

    setCues(tempCues);
  }, [cues]);

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
    // e.preventDefault();
    // const video = videoElRef.current;
    // if (!video?.duration) return;

    // const delta = e.deltaY < 0 ? 1 : -1;
    // let newTime = video.currentTime + delta * 0.2;
    // newTime = Math.max(0, Math.min(video.duration, newTime));
    // video.currentTime = newTime;

    // const ws = wavesurferRef.current;
    // if (ws && video.duration) ws.seekTo(newTime / video.duration);
  }, []);

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

  // Seek to highlighted row's start when selection changes
  useEffect(() => {
    if (selectedIndex < 0 || !cues[selectedIndex]) return;
    const video = videoElRef.current;
    const ws = wavesurferRef.current;
    const startSec = vttToMS(cues[selectedIndex].start) / 1000;
    if (video?.duration) {
      video.currentTime = startSec;
    }
    const duration = ws?.getDuration?.();
    if (ws && duration) {
      ws.seekTo(startSec / duration);
    }
  }, [selectedIndex, cues, videoElRef, wavesurferRef]);

  return (
    <>
      { isLoading &&
        <div id="captionsLoadingOverlay">
          <div className="mt-1 mb-4 flex-row justify-content-center align-items-center flex-grow-1 gap-3">
            <ProgressIcon className="icon-lg udoit-progress spinner" />
            <h2>{t('fix.label.loading_content')}</h2>
          </div>
        </div>
      }
      <div inert={isLoading ? true : undefined} id="media-captions-editor">

        <div id="captions-editor-info-row">
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
        <div id="captions-editor-main-row">

          <div
            id="table-focus-layer"
          >
            <h3 id="captions-list-label" className="m-0">{t("form.media.label.captions")}</h3>
            {cues.length === 0 && (
              <div className="insert-button-container">
                <button
                  className="btn-icon-left btn-secondary btn-small"
                  onClick={() => insertCue(-1)}
                  aria-label={t('form.media.button.add')}
                  title={t('form.media.button.add')}
                >
                  <AddIcon aria-hidden="true" className="icon-md" />
                  Insert New Caption    
                </button>
              </div>
            )}
            <ul aria-labelledby="captions-list-label">
              {cues.map((cue, i) => {

                const firstCaption = i === 0;
                const lastCaption = i === cues.length - 1;
                const active = selectedIndex === i;

                return (
                  <li
                    key={cue.id || i}
                    >
                    {(active || firstCaption) && (
                      <div className={"insert-button-container mb-2" + (!firstCaption ? " mt-3" : "")}>
                        <button
                          className="btn-icon-only btn-secondary btn-small"
                          onClick={() => insertCue(i)}
                          aria-label={t('form.media.button.add')}
                          title={t('form.media.button.add')}
                        >
                          <AddIcon aria-hidden="true" className="icon-md" />
                        </button>
                      </div>
                    )}
                    <div
                      id={`cue-row-${i}`}
                      className={`cue-row${active ? " active" : ""}`}
                      onClick={(e) => {
                        setSelectedIndex(i);
                        selectCue(i, vttToMS(cue.start) / 1000);
                      }}
                      role="group"
                      aria-label={`Caption ${i + 1}`}
                    >
                      <input
                        id={`cue-field-${i}-0`}
                        type="text"
                        defaultValue={cue.text}
                        disabled={isDisabled}
                        style={{ flex: 2, minWidth: 0 }}
                        aria-label={`Caption ${i + 1} text`}
                        onBlur={(e) => updateCueText(i, e.target.value)}
                        onFocus={() => setSelectedIndex(i)}
                      />
                      {/* <button
                        type="button"
                        aria-label={`Edit details for caption ${i + 1}`}
                        disabled={isDisabled}
                        style={{ marginLeft: 8 }}
                        ref={el => (editButtonRefs.current[i] = el)}
                        onClick={() => {
                          setDialogOpen(true);
                          setDialogCueIndex(i);
                        }}
                        onFocus={() => setSelectedIndex(i)}
                      >
                        Edit
                      </button> */}
                      <button
                        className="btn-small btn-icon-only btn-link"
                        aria-label={t('form.media.button.edit')}
                        title={t('form.media.button.edit')}
                        onFocus={() => setSelectedIndex(i)}
                      >
                        <SettingsIcon aria-hidden="true" className="icon-md" />
                      </button>
                      <button
                        className="btn-small btn-icon-only btn-link"
                        aria-label={t('form.media.button.delete')}
                        title={t('form.media.button.delete')}
                        onFocus={() => setSelectedIndex(i)}
                        onClick={() => deleteCue(i)}
                      >
                        <DeleteIcon aria-hidden="true" className="icon-md" />
                      </button>
                    </div>
                    {(active || lastCaption) && (
                      <div className="insert-button-container mb-3">
                        <button
                          className="btn-icon-only btn-secondary btn-small"
                          onClick={() => insertCue(i, false)}
                          aria-label={t('form.media.button.add')}
                          title={t('form.media.button.add')}
                        >
                          <AddIcon aria-hidden="true" className="icon-md" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <div style={{ color: "red", minHeight: 18, marginTop: 6 }}>{error}</div>
          </div>

          {/* Right: video + controls */}
          <div id="video-focus-layer">
            <h3 className="m-0">{t("fix.label.live_preview")}</h3>
            <div id="video-container">
              <video
                ref={videoElRef}
                src={videoUrl || undefined}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                controls={false}
              />
            </div>

            <div id="video-controls-container">
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
        <div id="waveform-container">
          <div
            id="waveform"
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
    </>
  );
}