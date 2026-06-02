import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Regions from "wavesurfer.js/dist/plugins/regions.esm.js";
import AddIcon from "../Icons/AddIcon";
import AlignCenterIcon from "../Icons/AlignCenterIcon";
import AlignLeftIcon from "../Icons/AlignLeftIcon";
import AlignRightIcon from "../Icons/AlignRightIcon";
import ArrowIcon from "../Icons/ArrowIcon";
import CaptionIcon from "../Icons/CaptionIcon";
import CloseIcon from "../Icons/CloseIcon";
import DeleteIcon from "../Icons/DeleteIcon";
import ExpandIcon from "../Icons/ExpandIcon";
import ForwardDoubleIcon from "../Icons/ForwardDoubleIcon";
import ForwardSingleIcon from "../Icons/ForwardSingleIcon";
import PauseIcon from "../Icons/PauseIcon";
import PlayIcon from "../Icons/PlayIcon";
import ProgressIcon from "../Icons/ProgressIcon";
import RewindDoubleIcon from "../Icons/RewindDoubleIcon";
import RewindSingleIcon from "../Icons/RewindSingleIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import SeverityIssueIcon from "../Icons/SeverityIssueIcon";
import TimeIcon from "../Icons/TimeIcon";
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
import SliderSelect from "../Widgets/SliderSelect";
import * as Text from '../../Services/Text';

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
  settings,
  addMessage,
  lmsFileData,
  initialVideoUrl,
  initialVttText,
  onSaveVtt,
  isDisabled = false,
}) {
  
  const [vttFile, setVttFile] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [fileLoadedSize, setFileLoadedSize] = useState(0);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullWidthVideo, setIsFullWidthVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || null);
  const [cues, setCues] = useState(() => (initialVttText ? parseVTT(initialVttText) : []));
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [waveError, setWaveError] = useState("");
  const [inputFocus, setInputFocus] = useState(false);

  const videoElRef = useRef(null);
  const wavesurferRef = useRef(null);
  const timelineRef = useRef(null);
  const waveformFocusRef = useRef(null);
  const darkMode = (settings?.user?.roles && ('dark_mode' in settings.user.roles) ? settings.user.roles.dark_mode : settings.DEFAULT_USER_SETTINGS.DARK_MODE)

  // Unique id counter for cues
  const [cueIdCounter, setCueIdCounter] = useState(1);
  const [activeSettingsIndex, setActiveSettingsIndex] = useState(-1);

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
    setWaveError("");
    setError("");
    setErrorDetails("");

    if (lmsFileData?.id) {
      downloadVideoFromLMS(lmsFileData.id)
    }

    if (lmsFileData?.metadata?.media_entry_id) {
      console.log("Found media_entry_id in LMS file data metadata:", lmsFileData.metadata.media_entry_id);
    }
  }, [lmsFileData])


  const downloadVideoFromLMS = async (lmsFileId) => {
    setFileLoadedSize(0);
    setTotalFileSize(0);
    const baseUrl = `https://${window.location.hostname}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${window.location.origin}/udoit3/api/files/${lmsFileId}/download`, true);
    xhr.responseType = "arraybuffer";
    xhr.withCredentials = true;

    xhr.onload = function(event) {

      if (xhr.status >= 200 && xhr.status < 300) {
        var blob = new Blob([event.target.response], {type: "video/mp4"});
        let tempURL = URL.createObjectURL(blob);
        setVideoUrl(tempURL);
      }
      // Specific HTTP error handling
      else {
        if (xhr.status === 302) {
          // Almost always a CORS issue, and can be fixed when the File sharing settings are changed.
          setError(t('form.media.label.error_lms_download'));
          setErrorDetails(t('form.media.label.error_lms_cors'));
        }
      }
    };

    xhr.onprogress = function(event) {
        if (event.lengthComputable) {
          setTotalFileSize(event.total);
        }
        setFileLoadedSize(event.loaded);
    }

    xhr.onreadystatechange = () => {
      if (xhr.status === 302) {
        // Almost always a CORS issue, and can be fixed when the File sharing settings are changed.
        setError(t('form.media.label.error_lms_download'));
        setErrorDetails(t('form.media.label.error_lms_cors'));
      }
      else if (xhr.status === 404) {
        setError(t('form.media.label.error_lms_download'));
      }
    }

    xhr.onerror = function(e) {
      console.error(`${xhr.status} Error downloading video from LMS: `, e);
      setError(t('form.media.label.error_lms_download'));
    }

    try {
      xhr.send();
    } catch (e) {
      console.error(`${xhr.status} Error CATCH sending request to LMS: `, e);
      setError(t('form.media.label.error_lms_download'));
    }
  }

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

  const handleSelectedIndex = (i) => {
    if(selectedIndex === i) {
      return
    }

    if (activeSettingsIndex !== i) {
      setActiveSettingsIndex(-1);
    }
    setSelectedIndex(i);
  }

  const handleWaveformError = (e) => {
    console.error("Error loading waveform: ", e);
    setWaveError(t('form.media.label.error_waveform'));
    setIsLoading(false);
  }

  const handleWaveformClick = (e) => {
    if (!wavesurferRef.current) return;
    console.log("Waveform clicked at ", e);
  }

  const handleLoadError = (e) => {
    console.error("Error loading media: ", e);
    setError(t('form.media.label.error_lms_download'));
    setIsLoading(false);
  }

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

  const seekTo = (seconds) => {
    console.log("seekTo: ", seconds);
    const video = videoElRef.current;
    if (!video?.duration) return;

    video.currentTime = seconds;

    const ws = wavesurferRef.current;
    if (ws) {
      ws.seekTo(seconds / video.duration);
    }
  };

  const playPause = () => {
    const video = videoElRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    }
    else {
      video.pause();
      setIsPlaying(false);
    }
  };

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
    setSelectedIndex,
    wavesurferRef,
    videoElRef,
    findRegionsPlugin,
    seekTo,
    playPause
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
      const index = region?.data?.index;
      if (typeof index !== "number") return;
      if (!cues[index]) return;

      const activeCueId = cues[index].id;

      const start = formatTimeVTT(region.start);
      const end = formatTimeVTT(region.end);

      // validate before applying
      if (vttToMS(start) >= vttToMS(end)) return;

      let tempCues = cues.map((c, i) => {
        if (i !== index) return c;
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

  const selectCue = useCallback((index, seekSeconds) => {
    handleSelectedIndex(index);

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

  const updateCueText = useCallback((index, value) => {
    setCues((prev) => {
      const cue = prev[index];
      if (!cue) return prev;

      const trimmed = String(value ?? "").trim();
      if (trimmed === cue.text) return prev;

      return prev.map((c, i) => (i === index ? { ...c, text: trimmed } : c));
    });
  }, []);

  const seekBy = useCallback((deltaSeconds) => {
    const video = videoElRef.current;
    if (!video?.duration) return;

    let next = video.currentTime + deltaSeconds;
    next = Math.max(0, Math.min(video.duration, next));
    video.currentTime = next;

    const ws = wavesurferRef.current;
    if (ws) {
      ws.seekTo(next / video.duration);
    }
  }, [videoElRef, wavesurferRef]);

  // const playCurrent = useCallback(() => {
  //   const video = videoElRef.current;
  //   if (!video) return;
  //   if (selectedIndex < 0 || !cues[selectedIndex]) return;

  //   const cue = cues[selectedIndex];
  //   const start = vttToMS(cue.start) / 1000;
  //   const end = vttToMS(cue.end) / 1000;

  //   video.currentTime = start;
  //   video.play();

  //   let raf = null;
  //   const tick = () => {
  //     if (!video) return;
  //     if (video.currentTime >= end) {
  //       video.pause();
  //       video.currentTime = end;
  //       raf = null;
  //       return;
  //     }
  //     raf = requestAnimationFrame(tick);
  //   };
  //   raf = requestAnimationFrame(tick);

  //   return () => raf && cancelAnimationFrame(raf);
  // }, [cues, selectedIndex]);

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
    setInputFocus(!inputFocus);

    return;
  }, [cues, selectedIndex, cueIdCounter, inputFocus]);

  const deleteCue = useCallback((cueId) => {
    let tempCues = cues.filter((c, i) => i !== cueId);
    
    if(tempCues[cueId - 1]) {
      handleSelectedIndex(cueId - 1);
    }
    else {
      handleSelectedIndex(-1);
    }

    setCues(tempCues);
    setInputFocus(!inputFocus);
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

  const setAlign = (newAlign) => {
    let index = activeSettingsIndex;
    if (index < 0 || !cues[index]) return;

    setCues((prev) =>
      prev.map((c, i) => (i === index ? { ...c, align: newAlign } : c))
    );
  }

  const setStart = (value) => {
    let index = activeSettingsIndex;
    if (index < 0 || !cues[index]) return;

    setCues((prev) => {
      const cue = prev[index];
      if (!cue) return prev;

      const trimmed = String(value ?? "").trim();
      if (trimmed === cue.start) return prev;

      return prev.map((c, i) => (i === index ? { ...c, start: trimmed } : c));
    });

    seekTo(value);
  };

  const setEnd = (value) => {
    let index = activeSettingsIndex;
    if (index < 0 || !cues[index]) return;

    setCues((prev) => {
      const cue = prev[index];
      if (!cue) return prev;

      const trimmed = String(value ?? "").trim();
      if (trimmed === cue.end) return prev;

      return prev.map((c, i) => (i === index ? { ...c, end: trimmed } : c));
    });

    seekTo(value);
  };

  const openSettings = (index) => {
    if(selectedIndex !== index) {
      setSelectedIndex(index);
    }
    if(activeSettingsIndex !== index) {
      setActiveSettingsIndex(index);
    }
  }

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

  // After inserting a new cue, focus immediately on its text input for accessibility and ease of use
  useEffect(() => {
    if(selectedIndex === -1) {
      return
    }

    let inputElement = document.querySelector(`#cue-field-${selectedIndex}`)
    if (inputElement) {
      inputElement?.focus()
      setActiveSettingsIndex(-1)
    }
  }, [inputFocus])

  // Seek to highlighted row's start when selection changes
  useEffect(() => {
    if (selectedIndex < 0 || !cues[selectedIndex]) return;
    const video = videoElRef.current;
    const ws = wavesurferRef.current;
    const startSec = vttToMS(cues[selectedIndex].start) / 1000;
    if (typeof startSec !== "number" || isNaN(startSec)) return;

    if (video?.duration) {
      video.currentTime = startSec;
    }
    const duration = ws?.getDuration?.();
    if (ws && duration) {
      ws.seekTo(startSec / duration);
    }
  }, [selectedIndex, cues, videoElRef, wavesurferRef]);

  useEffect(() => {
    // When the settings panel is closed, if there is a selected row, re-focus the settings button for accessibility
    if (activeSettingsIndex === -1) {
      if (selectedIndex >= 0) {
        const button = document.getElementById(`settings-button-${selectedIndex}`)
        button?.focus()
      }
    }
    // If the settings panel is opened, focus the first input in the panel
    else {  
      const firstInput = document.querySelector('.cue-row.active .slider-select .slider-option-container.active')
      firstInput?.focus()
    }
  }, [activeSettingsIndex])

  return (
    <>
      { isLoading && (
        <div id="captionsLoadingOverlay">
          { error === "" ? (
            <div className="flex-column align-items-center mb-4 w-100">
              <div className="mb-2 flex-row justify-content-center align-items-center gap-3">
                <ProgressIcon className="icon-lg udoit-progress spinner" />
                <h2>{t('fix.label.loading_content')}</h2>
              </div>
              <div className="progress-container">
              { totalFileSize === 0 ? (
                <>
                  <div className='loader' />
                  <div className="flex-row justify-content-center mt-2">
                    {fileLoadedSize === 0 ? (
                      <span>{t('form.media.label.retrieving_info')}</span>
                    ) : (
                      <span>{t('form.media.label.loaded')} {Text.getReadableFileSize(fileLoadedSize)}</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{width: `${(fileLoadedSize / totalFileSize) * 100}%`}}></div>
                  </div>
                  <div className="flex-row justify-content-between mt-2">
                    <span>{t('form.media.label.loaded')} {Text.getReadableFileSize(fileLoadedSize)}</span>
                    <span>{t('form.media.label.total_size')} {Text.getReadableFileSize(totalFileSize)}</span>
                  </div>
                </>
              )}
              </div>
            </div>
          ) : (
            <div className="mt-1 mb-4 flex-column justify-content-center align-items-center gap-2">
              <div className="flex-row justify-content-center align-items-center gap-2">
                <SeverityIssueIcon className="icon-lg udoit-issue" />
                <h2>{t('fix.label.error_media')}</h2>
              </div>
              {errorDetails && (
                <div className="error-details">
                  {errorDetails}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div inert={isLoading ? true : undefined} id="media-captions-editor">

        <div id="captions-editor-info-row">

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
        <div id="captions-editor-main-row" className={isFullWidthVideo ? "full-width-video" : ""}>
          <div id="table-focus-layer">
            <h3 id="captions-list-label" className="m-0">{t("form.media.label.captions")}</h3>
            <div id="captions-list-inputs">
              {cues.length === 0 && (
                <div className="insert-button-container">
                  <button
                    className="btn-icon-left btn-secondary btn-small"
                    onClick={() => insertCue(-1)}
                    aria-label={t('form.media.button.add')}
                    title={t('form.media.button.add')}
                    disabled={isDisabled || error !== ""}
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
                      tabIndex={-1}
                      key={cue.id || i}
                      id={'list-item-cue-' + i}
                      data-id={i}
                      onBlur={(e) => {
                        const i = Number(e.currentTarget.dataset.id)
                        if (selectedIndex === i) {
                          // If we can verify that we're still in the same row, don't deselect
                          const parentListItem = document.getElementById(`list-item-cue-${i}`);
                          if (e.relatedTarget && (e.relatedTarget === parentListItem || parentListItem?.contains(e.relatedTarget))) {
                            return
                          }
                          setSelectedIndex(-1)
                          if(activeSettingsIndex === i) {
                            setActiveSettingsIndex(-1)
                          }
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      >
                      {(active || firstCaption) && (
                        <div className={"insert-button-container mb-2" + (!firstCaption ? " mt-3" : "")}>
                          <button
                            className="btn-icon-only btn-secondary btn-small"
                            onClick={() => insertCue(i)}
                            aria-label={t('form.media.button.add')}
                            title={t('form.media.button.add')}
                            disabled={isDisabled || error !== ""}
                          >
                            <AddIcon aria-hidden="true" className="icon-md" />
                          </button>
                        </div>
                      )}
                      <div
                        id={`cue-row-${i}`}
                        className={`cue-row${active ? " active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectedIndex(i);
                          selectCue(i, vttToMS(cue.start) / 1000);
                        }}
                        role="group"
                        aria-label={cue.text}
                      >
                        { (activeSettingsIndex === i) && (
                          <div className="flex-row w-100 justify-content-between">
                            <div
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              <SliderSelect
                                activeOption = {cue?.align || "center"}
                                setActiveOption={setAlign}
                                options = {[
                                  { name: (<AlignLeftIcon className="icon-md" alt={t('form.media.label.align_left')} title={t('form.media.label.align_left')} />), value: "left" },
                                  { name: (<AlignCenterIcon className="icon-md" alt={t('form.media.label.align_center')} title={t('form.media.label.align_center')} />), value: "center" },
                                  { name: (<AlignRightIcon className="icon-md" alt={t('form.media.label.align_right')} title={t('form.media.label.align_right')} />), value: "right" },
                                ]}
                              />
                            </div>

                            <div className="flex-row gap-2 align-items-center">
                              <div className="flex-row gap-1 align-items-center">
                                <TimeIcon className="icon-sm gray" aria-hidden="true" />
                                <input
                                  type="text"
                                  value={cue.start}
                                  aria-label={t('form.media.label.start_time')}
                                  disabled={isDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                  onChange={e => setStart(e.target.value)}
                                  style={{ width: "8em" }}
                                />
                                <ArrowIcon className="icon-sm gray" aria-hidden="true" />
                                <input
                                  type="text"
                                  value={cue.end}
                                  aria-label={t('form.media.label.end_time')}
                                  disabled={isDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                  onChange={e => setEnd(e.target.value)}
                                  style={{ width: "8em" }}
                                />
                              </div>
                              <button
                                id={`close-settings-button-${i}`}
                                className="btn-icon-only btn-link btn-small"
                                aria-label={t('form.media.button.close_details')}
                                title={t('form.media.button.close_details')}
                                onClick={() => {
                                  setActiveSettingsIndex(-1)
                                }} >
                                <CloseIcon className="icon-md gray" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="flex-row gap-1 w-100 align-items-center">
                          <input
                            id={`cue-field-${i}`}
                            type="text"
                            defaultValue={cue.text}
                            disabled={isDisabled || error !== ""}
                            style={{ flex: 2, minWidth: 0 }}
                            aria-label={t('form.media.label.caption_text', { captionNumber: i + 1 })}
                            onBlur={(e) => updateCueText(i, e.target.value)}
                            onFocus={(e) => {
                              handleSelectedIndex(i)
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          />
                          { (activeSettingsIndex !== i) && (
                            <button
                              id={`settings-button-${i}`}
                              className="btn-small btn-icon-only btn-link"
                              aria-label={t('form.media.button.show_details')}
                              title={t('form.media.button.show_details')}
                              // This button SHOULD just have an onClick handler that by default works on keypresses, HOWEVER...
                              // Because rows with the settings open auto-close when they lose focus, rows underneath them "jump" up.
                              // This means that you could start a click on the settings button, but the button moves before the click is
                              // released, causing the click to "miss" and the settings to not open.
                              //
                              // To solve this, we add the onMouseDown handler to handle clicks before the button can move.
                              onMouseDown={() => {
                                openSettings(i)
                              }}
                              // This is fine, because the openSettings function isn't a toggle; it only changes indices that need it.
                              onClick={(e) => {
                                openSettings(i)
                              }}
                              // Since we've hand-edited the mouse events, the keyboard events don't trigger unless we hand-edit those, too.
                              onKeyDown={(e) => {
                                if(e.key === 'Enter' || e.key === ' ') {
                                  openSettings(i)
                                }
                              }}
                              disabled={isDisabled || error !== ""}
                            >
                              <SettingsIcon aria-hidden="true" className="icon-md" />
                            </button>
                          )}
                          { (activeSettingsIndex !== i) && (
                            <button
                              className="btn-small btn-icon-only btn-link"
                              aria-label={t('form.media.button.delete')}
                              title={t('form.media.button.delete')}
                              onFocus={() => handleSelectedIndex(i)}
                              onMouseDown={() => deleteCue(i)}
                              onKeyDown={(e) => {
                                if(e.key === 'Enter' || e.key === ' ') {
                                  deleteCue(i);
                                }
                              }}
                              disabled={isDisabled || error !== ""}
                            >
                              <DeleteIcon aria-hidden="true" className="icon-md" />
                            </button>
                          )}
                        </div>
                      </div>
                      {(active || lastCaption) && (
                        <div className="insert-button-container mb-3">
                          <button
                            className="btn-icon-only btn-secondary btn-small"
                            onClick={() => insertCue(i, false)}
                            aria-label={t('form.media.button.add')}
                            title={t('form.media.button.add')}
                            disabled={isDisabled || error !== ""}
                          >
                            <AddIcon aria-hidden="true" className="icon-md" />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right: video + controls */}
          <div id="video-focus-layer">
            <div className="flex-row justify-content-between align-items-center">
              <h3 className="m-0">{t("fix.label.live_preview")}</h3>
              <button
                id="resize-button"
                onClick={() => {
                  setIsFullWidthVideo(!isFullWidthVideo)
                }}
                aria-label={t('form.media.button.toggle_video_size')}
                title={t('form.media.button.toggle_video_size')}
                className="btn-icon-only btn-link">
                  <ExpandIcon className="icon-md" aria-hidden="true" />
                </button>
              </div>
            <div id="video-container">
              <video
                preload={"auto"}
                ref={videoElRef}
                src={videoUrl || undefined}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                controls={false}
                onError={(e) => handleLoadError(e)}
              />
            </div>

            {error === "" && videoElRef.current && (
              <div className="flex-row justify-content-center align-items-center gap-4">
                <div id="video-controls-container">
                  <button
                    className="btn-link btn-icon-only"
                    aria-label={t('form.media.button.rewind_5s')}
                    title={t('form.media.button.rewind_5s')}
                    disabled={isDisabled}
                    onClick={() => seekBy(-5)}>
                    <RewindDoubleIcon className="icon-lg" aria-hidden="true" />
                  </button>
                  <button
                    className="btn-link btn-icon-only"
                    aria-label={t('form.media.button.rewind_1s')}
                    title={t('form.media.button.rewind_1s')}
                    disabled={isDisabled}
                    onClick={() => seekBy(-1)}>
                    <RewindSingleIcon className="icon-lg" aria-hidden="true" />
                  </button>

                  <button
                    className="btn-secondary btn-play"
                    aria-label={videoElRef.current.paused ? t('form.media.button.play') : t('form.media.button.pause')}
                    disabled={isDisabled}
                    onClick={playPause}>
                    { isPlaying ? (
                      <PauseIcon className="icon-lg" aria-hidden="true" />
                    ) : (
                      <PlayIcon className="icon-lg" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    className="btn-link btn-icon-only"
                    aria-label={t('form.media.button.forward_1s')}
                    title={t('form.media.button.forward_1s')}
                    disabled={isDisabled}
                    onClick={() => seekBy(1)}>
                    <ForwardSingleIcon className="icon-lg" aria-hidden="true" />
                  </button>

                  <button
                    className="btn-link btn-icon-only"
                    aria-label={t('form.media.button.forward_5s')}
                    title={t('form.media.button.forward_5s')}
                    disabled={isDisabled}
                    onClick={() => seekBy(5)}>
                    <ForwardDoubleIcon className="icon-lg" aria-hidden="true" />
                  </button>
                </div>
                <div className="align-items-center">
                  <button
                    className="btn-link btn-icon-only"
                    aria-label={t('form.media.button.insert_caption_now')}
                    title={t('form.media.button.insert_caption_now')}
                    disabled={isDisabled}
                    onClick={() => insertCue(-1, true, true)}>
                    <CaptionIcon className="icon-lg" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Waveform focus container */}
        { error === "" && (
          <div id="waveform-container" >
            { waveError !== "" && (
              <div className="m-3 flex-row justify-content-center align-items-center flex-grow-1 gap-2">
                <SeverityIssueIcon className="icon-lg udoit-issue" />
                <h2>{t('form.media.label.error_waveform')}</h2>
              </div>
            )}
            <div
              id="waveform"
              className={(isLoading || waveError !== "" ? "hidden" : "") + (waveKbLayer === 'wave' ? " layer-wave" : "")}
              ref={waveformFocusRef}
              tabIndex={0}
              aria-label="Waveform. Press Enter to navigate regions, Tab to cycle, Escape to go back."
              onKeyDown={onWaveformKeyDown}
              onFocus={() => {
                setWaveKbLayer('wave');
                setActiveMode(1);
              }}
              onBlur={() => {
                setWaveKbLayer('wave');
                setActiveMode(1)
              }}
            >
              <WavesurferPlayer
                key={videoUrl || "no-url"}
                url={videoUrl || undefined}
                height={120}
                normalize
                interact={false}
                tabIndex={-1}
                minPxPerSec={100}
                waveColor={darkMode ? "#505975" : "#C5C9D3"}
                progressColor={darkMode ? "#5BA1FF" : "#81acd0"}
                plugins={plugins}
                onReady={onWsReady}
                onError={(e) => handleWaveformError(e)}
                onClick={(e) => {
                  handleWaveformClick(e)
                }}
              />
              <div ref={timelineRef} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}