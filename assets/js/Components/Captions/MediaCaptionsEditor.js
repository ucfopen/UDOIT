import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Regions from "wavesurfer.js/dist/plugins/regions.esm.js";

import AddIcon from "../Icons/AddIcon";
import CaptionIcon from "../Icons/CaptionIcon";
import DownloadIcon from "../Icons/DownloadIcon";
import InfoIcon from "../Icons/InfoIcon";
import ExpandIcon from "../Icons/ExpandIcon";
import SeverityIssueIcon from "../Icons/SeverityIssueIcon";
import UploadIcon from "../Icons/UploadIcon";

import Combobox from '../Widgets/Combobox';
import FileInformation from "../Widgets/FileInformation";
import MediaCaptionsCueList from "./MediaCaptionsCueList";
import MediaCaptionsLoadingProgress from "./MediaCaptionsLoadingProgress";
import MediaCaptionsPlaybackControls from "./MediaCaptionsPlaybackControls";
import SliderSelect from "../Widgets/SliderSelect";
import useWaveformKeyboard from "./useWaveformKeyboard";

import Api from '../../Services/Api';
import { parseVTT, buildVttText, vttToMS, vttToS, formatTimeVTT, formatVTTTime, computeVTTDuration, truncateVttTime } from "../../Services/Captions";
import { primaryLanguages } from '../../Services/Lang'
import * as Text from '../../Services/Text';
import './MediaCaptions.css';

/**
 * MediaCaptionsEditor
 *
 * Minimal props you probably want in a larger project:
 * - t: translation fn
 * - initialVideoUrl?: string  (if you already have a media URL)
 * - onSaveVtt?: ({ vttText, cues }) => void
 * - isDisabled?: boolean
 */
export default function MediaCaptionsEditor({
  t,
  settings,
  file,
  addMessage,
  setFormInvalid,
  initialVideoUrl,
  vttArray,
  setVttArray,
  vttActiveIndex,
  setVttActiveIndex,
  isDisabled = false,
}) {

  const CUE_STYLE = {
    LIST: 'list',
    TEXT: 'text',
  }

  const captionTypes = {
    'captions': t('form.media.label.type_captions'),
    'chapters': t('form.media.label.type_chapters'),
    'descriptions': t('form.media.label.type_descriptions'),
    'subtitles': t('form.media.label.type_subtitles')
  }
  
  const [isLoading, setIsLoading] = useState(true);
  const [fileTotalSize, setFileTotalSize] = useState(0);
  const [fileLoadedSize, setFileLoadedSize] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);  // Only used for properly displaying the play/pause button.
  const [isFullWidthVideo, setIsFullWidthVideo] = useState(false);  // For the fullscreen toggle classes.
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || null);

  const [cues, setCues] = useState([]);
  const [cueDisplay, setCueDisplay] = useState(CUE_STYLE.LIST);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const [selectedCueId, setSelectedCueId] = useState(-1);
  const [waveError, setWaveError] = useState("");
  
  const videoElRef = useRef(null);
  const wavesurferRef = useRef(null);
  const timelineRef = useRef(null);
  const waveformFocusRef = useRef(null);
  const darkMode = (settings?.user?.roles && ('dark_mode' in settings.user.roles) ? settings.user.roles.dark_mode : settings.DEFAULT_USER_SETTINGS.DARK_MODE)

  // Unique id counter for cues
  const [cueIdCounter, setCueIdCounter] = useState(1);
  const [activeSettingsIndex, setActiveSettingsIndex] = useState(-1);

  useEffect(() => {
    if(!file?.fileData) return;

    setVttActiveIndex(-1);
    setVttArray([]);
    setIsLoading(true);
    setWaveError("");
    setError("");
    setErrorDetails("");
    setCues([])

    const fileData = file.fileData;

    if (fileData?.metadata?.media_entry_id) {
      console.log("Found media_entry_id in LMS file data metadata:", fileData.metadata.media_entry_id);
    }

    if (fileData?.id) {
      downloadVideoFromLMS(fileData.id)
    }
  }, [file])

  const getExistingTracks = async () => {
    if(!file?.fileData?.metadata?.media_entry_id) {
      addMessage({ message: "File is missing Media ID. Cannot save captions to Canvas.", severity: "error", visible: true });
      setVttArray([{ locale: '', kind: '', content: ''}]);
      setVttActiveIndex(0);
      return;
    }
    const mediaEntryId = file.fileData.metadata.media_entry_id;

    const api = new Api(settings)
    const responseStr = await api.getMediaTracks(mediaEntryId)
    const response = await responseStr.json()
    if(response.errors && response.errors.length > 0) {
      response.errors.forEach((err) => addMessage({ message: t(err), severity: 'error', visible: true }))
    }
    else if(response?.data?.tracks) {
      const existingTracks = response.data.tracks

      if(existingTracks.length > 0) {
        setVttArray(existingTracks);
        setVttActiveIndex(0);
        return;
      }
    }

    setVttArray([{ locale: '', content: ''}]);
    setVttActiveIndex(0);
  }

  const downloadVideoFromLMS = async (lmsFileId) => {
    setFileLoadedSize(0);
    setFileTotalSize(0);
    const baseUrl = `https://${window.location.hostname}`;

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${window.location.origin}/udoit3/api/files/${lmsFileId}/download`, true);
    xhr.responseType = "arraybuffer";
    xhr.withCredentials = true;

    xhr.onload = function(event) {

      if (xhr.status >= 200 && xhr.status < 300) {
        var blob = new Blob([event.target.response], {type: "video/*"});
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
          setFileTotalSize(event.total);
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

    getExistingTracks();
  }

  // ---- keep <track> updated as cues change
  useEffect(() => {
    const video = videoElRef.current;
    if (!video) return;

    if (!cues || cues.length === 0 || isLoading) {
      setFormInvalid(true);
    }
    else {
      setFormInvalid(false);
    }

    const vttText = buildVttText(cues, false);
    const vttLang = vttArray[vttActiveIndex]?.locale || settings?.user?.roles?.lang || settings.DEFAULT_USER_SETTINGS.LANGUAGE || "en";
    const vttFormattedText = "WEBVTT\n\n" + vttText;

    // Update the big array for when it's time to save things.
    if(vttActiveIndex !== -1) {
      const tempVttArray = structuredClone(vttArray);
      tempVttArray[vttActiveIndex] = { locale: vttLang, content: vttText };
      setVttArray(tempVttArray);
    }

    // Keep the video's <track> elements updated as the cues change.
    Array.from(video.querySelectorAll("track")).forEach((tr) => tr.remove());
    const blob = new Blob([vttFormattedText], { type: "text/vtt" });
    const blobUrl = URL.createObjectURL(blob);
    const track = document.createElement("track");
    track.kind = "captions";
    track.srclang = vttLang;
    track.src = blobUrl;
    track.default = true;
    track.src = blobUrl;
    video.appendChild(track);

    return () => URL.revokeObjectURL(blobUrl);
  }, [cues, isLoading]);

  const getDefaultLanguage = () => {
    let userDefaultLanguage = settings?.user?.roles?.lang || settings.DEFAULT_USER_SETTINGS.LANGUAGE || "en";
    // Check to see if there is already a VTT track with that language.
    if (vttArray && vttArray.length > 0) {
      for(let i = 0; i < vttArray.length; i++) {
        if (vttArray[i].locale === userDefaultLanguage) {
          return '';
        }
      }
    }
    return userDefaultLanguage;
  }

  useEffect(() => {
    const vttText = vttArray[vttActiveIndex]?.content || ''
    const parsed = parseVTT(vttText).map((cue, i) => ({
      ...cue,
      id: cue.id || `cue-${Date.now()}-${i}`,
    }));
    setCues(parsed);
    const vttContent = buildVttText(parsed, false);
    const tempVttObject = {
      "locale": vttArray[vttActiveIndex]?.locale || getDefaultLanguage(),
      "content": vttContent
    }
    const tempVttArray = structuredClone(vttArray);
    tempVttArray.push(tempVttObject);
    setVttArray(tempVttArray);

    let tempLanguageOptions = [{value: '', name: t('form.media.label.select_track_language'), selected: vttArray[vttActiveIndex]?.locale === ''}]
    Object.keys(primaryLanguages).forEach((key) => {
        tempLanguageOptions.push({
          value: key,
          name: primaryLanguages[key],
          selected: vttArray[vttActiveIndex]?.locale === key
        })
      });
    setLanguageOptions(tempLanguageOptions);

    let tempTypeOptions = [{value: '', name: t('form.media.label.select_track_type'), selected: vttArray[vttActiveIndex]?.kind === ''}]
    Object.keys(captionTypes).forEach((key) => {
        tempTypeOptions.push({
          value: key,
          name: captionTypes[key],
          selected: vttArray[vttActiveIndex]?.kind === key
        })
      });
    setTypeOptions(tempTypeOptions);
    
    setCueIdCounter(parsed.length + 1);
    setActiveSettingsIndex(-1);
    setSelectedCueId(-1);
    setError("");
  }, [vttActiveIndex])

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

  const createNewRegion = useCallback((cue, regionsPlugin) => {
    // Region start and end times are measured in seconds.
    const start = vttToS(cue.start);
    const end = vttToS(cue.end);

    const region = regionsPlugin.addRegion({
      start,
      end,
      drag: true,
      resize: true,
      content: cue.text,
    });

    region.data = { cueId: cue.id };

    if (region.element) {
      region.element.setAttribute('tabindex', '-1');
      region.element.setAttribute('aria-hidden', 'true');
      region.element.setAttribute('role', 'presentation');
      region.element.setAttribute('data-id', cue.id);
      region.element.setAttribute(
        'aria-label',
        `Region from ${cue.start} to ${cue.end}: ${cue.text}`
      );
    }

    region.on("update", (updateControl) => {
      const domElement = region?.element;
      if (!domElement) return;
      const fakeCue = {
        start: region?.start || 0,
        end: region?.end || 0
      };
      updateRegionTimestampText(domElement, fakeCue);
      
      if (!updateControl || updateControl === "start") {
        seekTo(region.start);
      }
      else {
        seekTo(region.end);
      }
    });

    region.on("update-end", (e) => {
      const cueId = region.data?.cueId;
      if (!cueId) return;

      setCueStartEnd(cueId, region.start, region.end);
    });

  }, [cues, videoElRef, wavesurferRef])

  const updateRegionTimestampText = (domElement, cue) => {
    const startTimeText = truncateVttTime(cue.start);
    const endTimeText = truncateVttTime(cue.end);
    const timestampText = `${startTimeText} - ${endTimeText}`;

    let timestampElement = domElement.querySelector('[part="timestamp"]');
    if(!timestampElement) {
      timestampElement = document.createElement("div")
      timestampElement.setAttribute('part', 'timestamp');
      domElement.appendChild(timestampElement)
    }

    timestampElement.textContent = timestampText;
  }

  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) {
      return;
    }
    
    const regionsPlugin = findRegionsPlugin(ws);
    if (!regionsPlugin) {
      return;
    }

    const allRegions = regionsPlugin.getRegions?.() || [];

    // There may be cues that have not been added to regions, and there may be
    // regions that have not been deleted when a cue was.
    const currentRegionsCueIds = allRegions.map(region => region?.data?.cueId);

    // Add regions that don't already exist.
    cues.forEach(cue => {
      if (cue.id && !currentRegionsCueIds.includes(cue.id)) {
        createNewRegion(cue, regionsPlugin);
      }
    });

    // Remove regions where the cue was removed.
    const currentCueIds = cues.map(cue => cue.id);

    allRegions.forEach(region => {
      const domElement = region?.element;
      if (!domElement) {
        return;
      }

      if (region?.data?.cueId && !currentCueIds.includes(region.data.cueId)) {
        region.remove();
        return;
      }

      const relatedCue = cues.find((cue) => cue.id === region.data.cueId);
      if (!relatedCue) {
        return;
      }

      const startTime = vttToS(relatedCue.start);
      const endTime = vttToS(relatedCue.end);
      region.setOptions({
        start: startTime,
        end: endTime,
        content: relatedCue.text
      });

      // Update the timestamp element's text.
      updateRegionTimestampText(domElement, region);
    })

  }, [cues, wavesurferRef, isLoading]);

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
    [cues, handleWaveformClick]
  );

  const sortCues = (tempCues = cues) => {
    tempCues = Object.values(tempCues).sort((a, b) => vttToMS(a.start) - vttToMS(b.start));
    setCues(tempCues);
  }

  const setVideoTime = (seconds) => {
    const video = videoElRef.current;
    if (!video) return;
    video.currentTime = seconds;
  };

  const handleSelectCueId = useCallback((i) => {
    if (activeSettingsIndex !== i) {
      setActiveSettingsIndex(-1);
    }
    setSelectedCueId(i);

    if(cueDisplay === CUE_STYLE.LIST) {
      const listElement = document.querySelector(`li[data-id="${i}"]`);
      if (listElement) {
        listElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [selectedCueId]);

  const handleTrackTypeSelect = (id, newType) => {
    const tempVttArray = structuredClone(vttArray);
    if(tempVttArray[vttActiveIndex]) {
      tempVttArray[vttActiveIndex].kind = newType;
    }
    setVttArray(tempVttArray);
  }  

  const handleTrackLanguageSelect = (id, newLanguage) => {
    const tempVttArray = structuredClone(vttArray);
    if(tempVttArray[vttActiveIndex]) {
      tempVttArray[vttActiveIndex].locale = newLanguage;
    }
    setVttArray(tempVttArray);
  }

  const handleWaveformError = (e) => {
    console.error("Error loading waveform: ", e);
    setWaveError(t('form.media.label.error_waveform'));
    setIsLoading(false);
  }

  const handleWaveformClick = useCallback((relativeX) => {
    if (!wavesurferRef.current) return;

    // relativeX is between 0 and 1, and is the percent of the video completed.
    seekFromWaveform(relativeX);
    setWaveKbLayer('regions');
  }, [cues, wavesurferRef]);

  const handleLoadError = (e) => {
    console.error("Error loading media: ", e);
    setError(t('form.media.label.error_lms_download'));
    setIsLoading(false);
  }

  const seekTo = (seconds) => {
    if (typeof seconds !== 'number' || seconds < 0) {
      return;
    }

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
  } = useWaveformKeyboard({
    cues,
    setCues,
    selectedCueId,
    setSelectedCueId: handleSelectCueId,
    wavesurferRef,
    videoElRef,
    findRegionsPlugin,
    seekTo,
    playPause
  });

  // ---- when region is dragged/resized, write back to cues
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) return;

    const regionsPlugin = findRegionsPlugin(ws);
    if (!regionsPlugin?.on) return;

    const handler = (region) => {
      const activeCueId = region?.data?.cueId;

      const start = formatTimeVTT(region.start);
      const end = formatTimeVTT(region.end);

      let tempCues = cues.map((cue) => {
        if (cue.id !== activeCueId) return cue;
        return { ...cue, start, end, duration: computeVTTDuration(start, end) };
      })
      sortCues(tempCues);
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

  const selectCue = useCallback((cueId, seekSeconds) => {
    handleSelectCueId(cueId);

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

  const setCueText = useCallback((cueId, value) => {
    setCues((prev) => {
      const cue = cues.find((cue) => cue.id === cueId);
      if (!cue) return prev;

      const trimmed = String(value ?? "").trim();
      if (trimmed === cue.text) return prev;

      return prev.map((c) => (c.id === cueId ? { ...c, text: trimmed } : c));
    });
  }, [cues]);

  const setCueStartEnd = useCallback((cueId, startSeconds, endSeconds) => {
    setCues((prev) => {
      const cue = cues.find((cue) => cue.id === cueId);
      if (!cue) return prev;

      const startVTT = formatTimeVTT(startSeconds);
      const endVTT = formatTimeVTT(endSeconds);

      return prev.map((c) => (c.id === cueId ? { ...c, start: startVTT, end: endVTT } : c));
    });
  }, [cues])

  const seekFromWaveform = useCallback((percent) => {
    const video = videoElRef.current;
    if (!video?.duration || percent === undefined || percent < 0 || percent > 1) {
      return;
    }

    let targetTime = video.duration * percent;
    video.currentTime = targetTime;

    let tempSelectedCueId = -1;
    if (cues && cues.length > 0) {
      for (let i = 0; i < cues.length; i++) {
        let cueStart = vttToS(cues[i].start);
        let cueEnd = vttToS(cues[i].end);
        if (cueStart <= targetTime && cueEnd >= targetTime) {
          if(selectedCueId !== cues[i].id) {
            targetTime = cueStart;
          }
          tempSelectedCueId = cues[i].id;
        }
      }
    }

    handleSelectCueId(tempSelectedCueId);
  }, [cues, videoElRef, handleSelectCueId]);

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

  const insertCue = useCallback((cueIndex, before = true, fromPlayer = false) => {
    const video = videoElRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const defaultDuration = 2.0;
    const defaultGap = 0;

    let insertAt = 0;
    let newStart = 0;
    let newEnd = 0;

    // Special case: the first caption added OR inserting from the player without a cueId.
    if (cueIndex === -1) {
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
    else if (cues[cueIndex]) {
      if (before) {
        newEnd = vttToMS(cues[cueIndex].start) / 1000 - defaultGap;
        newStart = Math.max(0, newEnd - defaultDuration);
        if (cues[cueIndex - 1]) {
          let previousEnd = vttToMS(cues[cueIndex - 1].end) / 1000;
          newStart = Math.max(newStart, previousEnd + defaultGap);
        }
      }
      else {
        newStart = vttToMS(cues[cueIndex].end) / 1000 + defaultGap;
        newEnd = newStart + defaultDuration;
        if (cues[cueIndex + 1]) {
          let nextStart = vttToMS(cues[cueIndex + 1].start) / 1000;
          newEnd = Math.min(newEnd, nextStart - defaultGap);
        }
      }
    }

    else {
      console.warn("Cue ID not found:", cueIndex);
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
    sortCues(tempCues);
    handleSelectCueId(insertedCueId);
    setInputFocus(!inputFocus);
    return;
  }, [cues, selectedCueId, cueIdCounter, inputFocus]);

  const deleteCue = useCallback((cueId) => {
    let tempCues = [];

    let previousCueId = -1;
    for (let i = 0; i < cues.length; i++) {
      if (cueId === cues[i].id) {
        previousCueId = cues[i - 1]?.id || -1;
      }
      else {
        tempCues.push(cues[i]);
      }
    }
    handleSelectCueId(previousCueId);
    
    setCues(tempCues);
    setInputFocus(!inputFocus);
  }, [cues]);

  const handleImport = () => {
    let shadowInput = document.createElement('input');
    shadowInput.setAttribute('type', 'file');
    shadowInput.setAttribute('accept', '.vtt');
    shadowInput.onchange = _ => {
      const newFile = shadowInput.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = String(ev.target?.result || "");
        const parsed = parseVTT(text).map((cue, i) => ({
          ...cue,
          id: cue.id || `cue-${Date.now()}-${i}`,
        }));
        setCues(parsed);        
        setCueIdCounter(parsed.length + 1);
        setSelectedCueId(-1);
        setActiveSettingsIndex(-1);
        setError("");
      };
      reader.readAsText(newFile);
    }
    shadowInput.click();
    shadowInput.remove();
  }

  const handleExport = () => {
    const vttText = buildVttText(cues);
    const blob = new Blob([vttText], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    const fileName = Text.removeExtension(file?.fileData?.fileName || file?.fileData?.name || 'captions');
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName + ".vtt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const setCueAlign = (newAlign) => {
    if (activeSettingsIndex < 0) {
      return;
    }

    setCues((prev) => {
      return prev.map((c) => (c.id === activeSettingsIndex ? { ...c, align: newAlign } : c))
    });
  }

  const setCueStart = useCallback((value) => {
    if (vttToS(value) === -1) {
      return;
    }

    const trimmed = String(value ?? "").trim();
    setCues((prev) => {
      return prev.map((c) => (c.id === activeSettingsIndex ? { ...c, start: trimmed } : c));
    });

    seekTo(value);
  }, [activeSettingsIndex, cues]);

  const setCueEnd = useCallback((value) => {
    if (vttToS(value) === -1) {
      return;
    }

    const trimmed = String(value ?? "").trim();
    setCues((prev) => {
      return prev.map((c) => (c.id === activeSettingsIndex ? { ...c, end: trimmed } : c));
    });

    seekTo(value);
  }, [activeSettingsIndex, cues]);

  const openSettings = (index) => {
    if(selectedCueId !== index) {
      setSelectedCueId(index);
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
    if(selectedCueId === -1) {
      return
    }

    let inputElement = document.querySelector(`#input-${selectedCueId}`)
    if (inputElement) {
      inputElement?.focus()
      setActiveSettingsIndex(-1)
    }
  }, [inputFocus])

  useEffect(() => {
    // Hide existing captions so they don't bleed through the "Loading" screen.
    if(isLoading) {
      const tracks = document.querySelector("video")?.textTracks;
      if(tracks && tracks.length > 0) {
        for (const track of tracks) {
          track.mode = "disabled";
        }
      }
    }
  }, [isLoading])

  // Seek to highlighted row's start when selection changes
  useEffect(() => {
    if (selectedCueId < 0) {
      return;
    }
    
    const cue = cues.find((cue) => cue.id === selectedCueId);
    if (!cue) {
      return;
    }

    applyRegionHighlight(selectedCueId);

    const startTime = vttToS(cue.start);
    seekTo(startTime);
  }, [selectedCueId]);

  useEffect(() => {
    // When the settings panel is closed, if there is a selected row, re-focus the settings button for accessibility
    if (activeSettingsIndex === -1) {
      if (selectedCueId >= 0) {
        const button = document.getElementById(`settings-button-${selectedCueId}`)
        button?.focus()
      }
    }
    // If the settings panel is opened, focus the first input in the panel
    else {  
      const firstInput = document.querySelector('li.active .cue-row .slider-select .slider-option-container.active')
      firstInput?.focus()
    }
  }, [activeSettingsIndex])

  return (
    <>
      { isLoading && (
        <div id="captionsLoadingOverlay">
          { error === "" ? (
            <MediaCaptionsLoadingProgress
              t={t}
              fileName={file.fileData?.fileName || ''}
              fileLoadedSize={fileLoadedSize}
              fileTotalSize={fileTotalSize}
            />
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
          <div className="flex-row gap-2 align-items-center">
            <FileInformation t={t} fileData={file.fileData} />
          </div>
          
          {/* IMPORT/EXPORT VTT BUTTONS*/}
          <div className="flex-row gap-2 align-items-center">
            <button
              className="btn-secondary btn-small btn-icon-left"
              onClick={() => handleImport()}>
              <DownloadIcon className="icon-md" />
              <div>Import VTT</div>
            </button>
            <button
              className="btn-secondary btn-small btn-icon-left"
              disabled={isDisabled || !cues || cues?.length === 0}
              onClick={handleExport}>
              <UploadIcon className="icon-md" />
              <div>Export VTT</div>
            </button>
          </div>
        </div>
        <div id="captions-editor-main-row" className={isFullWidthVideo ? "full-width-video" : ""}>
          <div id="table-focus-layer">
            { vttArray.length === 0 ? (
              <div className="callout-container">
                <div className="flex-row gap-2">
                  <InfoIcon className="icon-md udoit-info align-self-center" alt="" aria-hidden="true"/>
                  <div className="flex-column gap-2">
                    <h2 className="m-0">Adding Tracks</h2>
                    <div className="secondary">
                      This media file does not have any associated caption tracks. Add a new track by clicking the "Add Track" button.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div id="track-header">
                  <h3 id="captions-list-label" className="m-0">{t("form.media.label.track_number", {'trackNumber' : vttActiveIndex + 1})}</h3>
                  <div className="flex-row flex-wrap align-items-center gap-1">
                    <div className="flex-row gap-1 align-items-center me-2">
                      <label id="combo-label-typeSelect">{t('form.media.label.track_type')}</label>
                      <Combobox
                        isDisabled={vttArray.length === 0}
                        handleChange={handleTrackTypeSelect}
                        id='typeSelect'
                        label=''
                        options={typeOptions}
                        settings={settings}
                      />
                    </div>
                    <div className="flex-row gap-1 align-items-center me-2">
                      <label id="combo-label-languageSelect">{t('form.media.label.track_language')}</label>
                      <Combobox
                        isDisabled={vttArray.length === 0}
                        handleChange={handleTrackLanguageSelect}
                        id='languageSelect'
                        label=''
                        options={languageOptions}
                        settings={settings}
                      />
                    </div>
                    <button
                      className="btn-secondary btn-small btn-icon-only"
                      disabled={isDisabled || !cues || cues?.length === 0}
                      aria-label={t('form.media.button.export_vtt')}
                      title={t('form.media.button.export_vtt')}
                      disabled={cues.length === 0}
                      onClick={handleExport}>
                      <UploadIcon className="icon-md" />
                    </button>
                  </div>
                </div>
                <div id="captions-list-inputs">
                  {cues.length === 0 && (
                    <div className="callout-container">
                      <div className="flex-column gap-4">
                        <div className="flex-row justify-content-around align-items-center">
                          <button
                            className="btn-icon-left btn-secondary btn-small"
                            onClick={() => insertCue(-1)}
                            aria-label={t('form.media.button.add')}
                            title={t('form.media.button.add')}
                            disabled={isDisabled || error !== ""}
                          >
                            <AddIcon aria-hidden="true" className="icon-md" />
                            {t('form.media.button.enter_with_type', { captionType: captionTypes[vttArray[vttActiveIndex]?.kind] || captionTypes.captions })}
                          </button>
                          <button
                            className="btn-secondary btn-small btn-icon-left"
                            onClick={() => handleImport()}>
                            <DownloadIcon className="icon-md" />
                            <div>{t('form.media.button.import_vtt')}</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {cueDisplay === CUE_STYLE.LIST && (
                    <MediaCaptionsCueList
                      t={t}
                      activeSettingsIndex={activeSettingsIndex}
                      cues={cues}
                      deleteCue={deleteCue}
                      error={error}
                      handleSelectedIndex={handleSelectCueId}
                      insertCue={insertCue}
                      isDisabled={isDisabled}
                      openSettings={openSettings}
                      selectedIndex={selectedCueId}
                      selectCue={selectCue}
                      setActiveSettingsIndex={setActiveSettingsIndex}
                      setCueAlign={setCueAlign}
                      setCueEnd={setCueEnd}
                      setCueStart={setCueStart}
                      setCueText={setCueText}
                    />
                  )}
                </div>
              </>
            )}
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
                <MediaCaptionsPlaybackControls
                  t={t}
                  isDisabled={isDisabled}
                  isPlaying={isPlaying}
                  playPause={playPause}
                  seekBy={seekBy}
                />
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
                interact={true}
                tabIndex={-1}
                minPxPerSec={100}
                waveColor={darkMode ? "#505975" : "#C5C9D3"}
                progressColor={darkMode ? "#5BA1FF" : "#81acd0"}
                plugins={plugins}
                onReady={onWsReady}
                onError={(e) => handleWaveformError(e)}
                onClick={(self, e) => { handleWaveformClick(e) }}
              />
              <div ref={timelineRef} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}