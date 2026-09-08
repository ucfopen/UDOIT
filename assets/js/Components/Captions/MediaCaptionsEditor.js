import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WavesurferPlayer from "@wavesurfer/react";
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js";
import Regions from "wavesurfer.js/dist/plugins/regions.esm.js";

import AddIcon from "../Icons/AddIcon";
import DeleteIcon from "../Icons/DeleteIcon";
import DownloadIcon from "../Icons/DownloadIcon";
import InfoIcon from "../Icons/InfoIcon";
import ExpandIcon from "../Icons/ExpandIcon";
import SeverityIssueIcon from "../Icons/SeverityIssueIcon";
import TimerIcon from "../Icons/TimerIcon";
import UploadIcon from "../Icons/UploadIcon";

import Combobox from '../Widgets/Combobox';
import FileInformation from "../Widgets/FileInformation";
import InfoPopover from "../Widgets/InfoPopover";
import MediaCaptionsCueList from "./MediaCaptionsCueList";
import MediaCaptionsLoadingProgress from "./MediaCaptionsLoadingProgress";
import MediaCaptionsPlaybackControls from "./MediaCaptionsPlaybackControls";
import OptionFeedback from "../Widgets/OptionFeedback";
import SliderSelect from "../Widgets/SliderSelect";
import mediaCaptionsProcessing from "./mediaCaptionsProcessing";
import useWaveformKeyboard from "./useWaveformKeyboard";

import Api from '../../Services/Api';
import { parseVTT, buildVttText, vttToS, formatTimeVTT, formatVTTTime, truncateVttTime } from "../../Services/Captions";
import { DEFAULT_USER_SETTINGS } from "../../Services/Constants";
import { primaryLanguages } from '../../Services/Lang';
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
  preferences,
  instanceInfo,
  file,
  addMessage,
  setFormInvalid,
  initialVideoUrl = null,
  vttArray,
  setVttArray,
  vttActiveIndex,
  setVttActiveIndex,
  isDisabled = false,
  cachedMediaURLs,
  updateMediaURL,
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

  const captionTypesSingle = {
    'captions': t('form.media.label.type_captions_single'),
    'chapters': t('form.media.label.type_chapters_single'),
    'descriptions': t('form.media.label.type_descriptions_single'),
    'subtitles': t('form.media.label.type_subtitles_single')
  }

  const [fileTotalSize, setFileTotalSize] = useState(0);
  const [fileLoadedSize, setFileLoadedSize] = useState(0);
  const [isFullWidthVideo, setIsFullWidthVideo] = useState(false);  // For the fullscreen toggle classes.
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);  // Only used for properly displaying the play/pause button.
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || null);
  const [videoTracksUrl, setVideoTracksUrl] = useState('');

  const [cues, setCues] = useState([]);
  const [cueDisplay, setCueDisplay] = useState(CUE_STYLE.LIST);
  const [dragListener, setDragListener] = useState(null);
  const [dragEndListener, setDragEndListener] = useState(null);
  const [trackOptions, setTrackOptions] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [trackErrors, setTrackErrors] = useState([]);
  const [inputFocus, setInputFocus] = useState(false);
  const [selectedCueId, setSelectedCueId] = useState(-1);
  const [waveError, setWaveError] = useState("");
  const [noAudioTrack, setNoAudioTrack] = useState(false);
  
  const videoElRef = useRef(null);
  const wavesurferRef = useRef(null);
  const timelineRef = useRef(null);
  const waveformFocusRef = useRef(null);
  const silentWaveformRef = useRef(false);

  // Unique id counter for cues
  const [cueIdCounter, setCueIdCounter] = useState(1);
  const [activeSettingsIndex, setActiveSettingsIndex] = useState(-1);

  // When a new File Object is selected by the user, download the media associated with it.
  useEffect(() => {
    if (!file?.fileData || !file.fileData?.id) return;
    const fileData = file.fileData;

    setVttActiveIndex(-1);
    setVttArray([]);
    setIsLoading(true);
    setWaveError("");
    setNoAudioTrack(false);
    silentWaveformRef.current = false;
    setError("");
    setErrorDetails("");
    setCues([]);

    if (fileData?.metadata?.media_entry_id) {
      console.log("Found media_entry_id in LMS file data metadata:", fileData.metadata.media_entry_id);
    }

    const tracks = document.querySelector("video")?.textTracks;
    if (tracks && tracks.length > 0) {
      for (const track of tracks) {
        track.mode = "disabled";
      }
    }

    getExistingTracks();
    if (cachedMediaURLs[fileData.id]) {
      setFileTotalSize(cachedMediaURLs[fileData.id].blobSize);
      setVideoUrl(cachedMediaURLs[fileData.id].blobURL);
    }
    else {
      downloadVideoFromLMS(fileData.id, fileData?.metadata?.content-type || '', fileData?.metadata?.fileSize || 0);
    }
  }, [file])

  const getExistingTracks = async () => {
    if (!file?.fileData?.metadata?.media_entry_id) {
      addMessage({ message: "File is missing Media ID. Cannot save captions to Canvas.", severity: "error", visible: true });
      setVttArray([{ locale: '', kind: '', content: ''}]);
      setVttActiveIndex(0);
      return;
    }
    const mediaEntryId = file.fileData.metadata.media_entry_id;

    const api = new Api(instanceInfo);
    const responseStr = await api.getMediaTracks(mediaEntryId);
    const response = await responseStr.json();
    if (response.errors && response.errors.length > 0) {
      response.errors.forEach((err) => addMessage({ message: t(err), severity: 'error', visible: true }));
    }
    else if (response?.data?.tracks) {
      const existingTracks = response.data.tracks
      if (existingTracks.length > 0) {
        existingTracks.forEach((track) => {
          // If the track has a fake, hyphenated locale (like "English-subtitles"), revert to "en".
          if (track.locale.includes('-')) {
            let tempLocale = track.locale.substring(0, track.locale.indexOf('-'));
            let localeCode = Object.keys(primaryLanguages).find(key => primaryLanguages[key] === tempLocale);
            if (localeCode) {
              track.locale = localeCode;
            }
          }
        })
        setVttArray(existingTracks);
        setVttActiveIndex(0);
        return;
      }
    }

    setVttArray([{ locale: getDefaultLanguage(), content: '', kind: 'captions'}]);
    setVttActiveIndex(0);
  }

  const updateTrackDropdown = useCallback(() => {
    let tempTrackOptions = [];
    for(let i = 0; i < vttArray.length; i++) {
      // By default, the track name something like 'Track 2'
      let tempDescription = t('form.media.label.track_number', {'trackNumber': (i + 1).toString()})

      let localeString = primaryLanguages[vttArray[i].locale] || '';
      let typeString = captionTypes[vttArray[i].kind] || '';
      // If the track has a known type and/or language, the name is something like 'English Captions' or 'French' or 'Subtitles'
      if (localeString !== '' || typeString !== '') {
        tempDescription = t('form.media.label.track_name', {'trackLocale': localeString, 'trackType': typeString})
      }
      tempTrackOptions.push({
        value: i,
        name: tempDescription,
        selected: vttActiveIndex === i
      })
      setTrackOptions(tempTrackOptions);
    }
  }, [vttArray, vttActiveIndex]);

  const updateTypeLanguageDropdowns = useCallback(() => {
    if (vttActiveIndex === -1) {
      return;
    }

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
  }, [vttArray, vttActiveIndex]);

  const loadCuesFromVttArray = useCallback(() => {
    const vttText = vttArray[vttActiveIndex]?.content || ''
    const parsed = parseVTT(vttText).map((cue, i) => ({
      ...cue,
      id: cue.id || `cue-${Date.now()}-${i}`,
    }));
    setCues(parsed);
    setCueIdCounter(parsed.length + 1);
    setActiveSettingsIndex(-1);
    setSelectedCueId(-1);
    setError("");
  }, [vttArray, vttActiveIndex]);

  const downloadVideoFromLMS = async (lmsFileId, contentType = 'video/mp4', fileSize = 0) => {
    setFileLoadedSize(0);
    // Canvas media are sometimes saved as stubs. Meaning a large, 100+ MB video can have a
    // metadata fileSize of ~12 K. The media is buffered as it loads. Not sure if this is a
    // Kaltura or Canvas issue, but if a media file is less than 50K, we'll set the fileSize
    // to 0 (unknown) and just run the download without it.
    if (fileSize && fileSize < 50000) {
      fileSize = 0;
    }
    setFileTotalSize(fileSize);
    try {
      let api = new Api(instanceInfo);
      const response = await api.downloadFile(lmsFileId, contentType);
      if (response.headers.has('Content-Length')) {
        setFileTotalSize(response.headers.get('Content-Length'));
      }
      
      const reader = response.body.getReader();
      const chunks = [];
      let tempFileLoadedSize = 0;
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        tempFileLoadedSize += value.byteLength;
        setFileLoadedSize(tempFileLoadedSize);
      }

      setFileTotalSize(tempFileLoadedSize);
      const blob = new Blob(chunks);
      let tempURL = URL.createObjectURL(blob);
      setVideoUrl(tempURL);
      updateMediaURL(lmsFileId, tempURL, tempFileLoadedSize);
    }
    catch (error) {
      console.error(error);
    }
  }

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
    const vttLang = vttArray[vttActiveIndex]?.locale || '';
    const vttKind = vttArray[vttActiveIndex]?.kind || '';

    updateVideoTracks(video, vttText, videoTracksUrl, setVideoTracksUrl);

    // Update the big array for when it's time to save things.
    if (vttActiveIndex !== -1) {
      const tempVttArray = structuredClone(vttArray);
      tempVttArray[vttActiveIndex] = { locale: vttLang, content: vttText, kind: vttKind };
      setVttArray(tempVttArray);
    }
  }, [cues, isLoading]);

  const checkFormValid = () => {

    if (!vttArray || vttArray.length === 0 || vttActiveIndex === -1) {
      setFormInvalid(true);
      setTrackErrors([]);
      return;
    }

    let tempFormInvalid = false;
    let tempTrackErrors = [];
    let activeTrackType = '';
    const trackTypes = [];
    for(let i = 0; i < vttArray.length; i++) {
      let tempTrackType = (vttArray[i].locale || 'nolocale') + '-' + (vttArray[i].kind || 'nokind');
      if (trackTypes.includes(tempTrackType)) {
        tempFormInvalid = true;
      }
      trackTypes.push(tempTrackType);
      if (i === vttActiveIndex) {
        activeTrackType = tempTrackType;
        if (!vttArray[i].locale || !vttArray[i].kind) {
          tempTrackErrors.push({ text: t('form.media.msg.missing_type_lang'), type: "error" });
        }
      }
    }

    if (trackTypes.filter(typeName => typeName === activeTrackType).length > 1) {
      tempTrackErrors.push({ text: t('form.media.msg.unique_track_type'), type: "error" });
    }

    if (tempTrackErrors.length > 0) {
      tempFormInvalid = true;
    }

    setFormInvalid(tempFormInvalid);
    setTrackErrors(tempTrackErrors);
  };

  useEffect(() => {
    checkFormValid();
    updateTrackDropdown();
  }, [vttArray, vttActiveIndex]);

  useEffect(() => {
    updateTypeLanguageDropdowns();
    loadCuesFromVttArray();
  }, [vttActiveIndex]);

  const getDefaultLanguage = () => {
    let userDefaultLanguage = preferences.lang || DEFAULT_USER_SETTINGS.LANGUAGE || "";
    
    return userDefaultLanguage;
  }

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
      startS: start,
      endS: end,
      drag: true,
      resize: true,
      content: cue.text,
    });

    region.data = { cueId: cue.id, snapStartOffset: 0, snapStartRegionId: '',  snapEndOffset: 0, snapEndRegionId: '' };

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

  }, [cues, videoElRef, wavesurferRef])

  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws) {
      return;
    }
    
    const regionsPlugin = findRegionsPlugin(ws);
    if (!regionsPlugin) {
      return;
    }

    let allRegions = regionsPlugin.getRegions?.() || [];

    // There may be cues that have not been added to regions, and there may be
    // regions that have not been deleted when a cue was.
    const currentRegionsCueIds = allRegions.map(region => region?.data?.cueId);

    // Add regions that don't already exist.
    cues.forEach(cue => {
      if (cue.id && !currentRegionsCueIds.includes(cue.id)) {
        createNewRegion(cue, regionsPlugin);
      }
    });

    // Now, get a fresh list of all regions and add the drag-and-drop handlers.
    allRegions = regionsPlugin.getRegions?.() || [];

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

      // The drag event handlers need to be reinitialized every time the `cues` object updates.
      if (region.data?.unsubDrag && typeof region.data.unsubDrag === 'function') {
        region.data.unsubDrag();
      }

      if (region.data?.unsubDragEnd && typeof region.data.unsubDragEnd === 'function') {
        region.data.unsubDragEnd();
      }

      let tempDragListener = region.on('update', (updateControl) => {
        evaluateDrag(updateControl, region, cues, videoElRef, wavesurferRef);
      });

      let tempDragEndListener = region.on('update-end', (updateControl) => {
        completeDrag(region, cues, setCueStartEnd);
      });

      region.data.unsubDrag = tempDragListener;
      region.data.unsubDragEnd = tempDragEndListener;
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
        if (!silentWaveformRef.current) ws.play();
      };
      const onTimeUpdate = () => {
        if (silentWaveformRef.current) ws.setTime(video.currentTime);
      };

      video.addEventListener("pause", onPause);
      video.addEventListener("play", onPlay);
      video.addEventListener("timeupdate", onTimeUpdate);

      // cleanup listener if ws re-inits
      ws.once?.("destroy", () => {
        video.removeEventListener("pause", onPause);
        video.removeEventListener("play", onPlay);
        video.removeEventListener("timeupdate", onTimeUpdate);
      });

      setWaveError("");
      setIsLoading(false);
    },
    [cues, handleWaveformClick]
  );

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

    if (cueDisplay === CUE_STYLE.LIST) {
      const listElement = document.querySelector(`li[data-id="${i}"]`);
      if (listElement) {
        listElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [selectedCueId]);

  const addNewTrack = () => {
    const tempVttArray = structuredClone(vttArray);
    tempVttArray.push({
      locale: getDefaultLanguage(),
      content: '',
      kind: 'captions'
    })
    setVttArray(tempVttArray);
    setVttActiveIndex(tempVttArray.length - 1);
  }

  const deleteTrack = () => {
    if (!vttArray[vttActiveIndex]) {
      return;
    }
    const tempVttArray = structuredClone(vttArray);
    tempVttArray.splice(vttActiveIndex, 1);
    setVttArray(tempVttArray);
    if (tempVttArray.length > 0){
      setVttActiveIndex(Math.max(0, vttActiveIndex - 1));
    }
    else {
      setVttActiveIndex(-1);
    }
  }

  const handleTrackSelect = (id, newTrack) => {
    setVttActiveIndex(newTrack);
  }

  const handleTrackTypeSelect = (id, newType) => {
    const tempVttArray = structuredClone(vttArray);
    if (tempVttArray[vttActiveIndex]) {
      tempVttArray[vttActiveIndex].kind = newType;
    }
    setVttArray(tempVttArray);
  }  

  const handleTrackLanguageSelect = (id, newLanguage) => {
    const tempVttArray = structuredClone(vttArray);
    if (tempVttArray[vttActiveIndex]) {
      tempVttArray[vttActiveIndex].locale = newLanguage;
    }
    setVttArray(tempVttArray);
  }

  const handleWaveformError = async (ws, error) => {
    console.error("Error loading waveform: ", error);
    const duration = videoElRef.current?.duration;
    if (!silentWaveformRef.current && Number.isFinite(duration) && duration > 0) {
      silentWaveformRef.current = true;
      try {
        await ws.load("", [new Float32Array(1024)], duration);
        setNoAudioTrack(true);
        return;
      } catch (fallbackError) {
        console.error("Error loading silent waveform: ", fallbackError);
      }
    }
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

  const {
    completeDrag,
    evaluateDrag,
    seekTo,
    updateRegionTimestampText,
    updateVideoTracks
  } = mediaCaptionsProcessing({
    wavesurferRef,
    videoElRef,
  })

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

  const setCueStartEnd = (currentCues, cueId, startSeconds, endSeconds) => {
    const startVTT = formatTimeVTT(startSeconds);
    const endVTT = formatTimeVTT(endSeconds);
    const duration = Math.max(0, endSeconds - startSeconds);
    
    let tempCues = currentCues.map((cue) => {
      if (cue.id !== cueId) return cue;
      return { ...cue, start: startVTT, end: endVTT, startS: startSeconds, endS: endSeconds, duration: duration };
    })
    tempCues = Object.values(tempCues).sort((a, b) => a.startS - b.startS);

    setCues(tempCues);
  };

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
        if (cues[i].startS <= targetTime && cues[i].endS >= targetTime) {
          if (selectedCueId !== cues[i].id) {
            targetTime = cues[i].startS;
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
      if (fromPlayer) {
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
        newEnd = cues[cueIndex].startS - defaultGap;
        newStart = Math.max(0, newEnd - defaultDuration);
        if (cues[cueIndex - 1]) {
          let previousEnd = cues[cueIndex - 1].endS;
          newStart = Math.max(newStart, previousEnd + defaultGap);
        }
      }
      else {
        newStart = cues[cueIndex].endS + defaultGap;
        newEnd = newStart + defaultDuration;
        if (cues[cueIndex + 1]) {
          let nextStart = cues[cueIndex + 1].startS;
          newEnd = Math.min(newEnd, nextStart - defaultGap);
        }
      }
    }

    else {
      console.warn("Cue ID not found:", cueIndex);
      return;
    }

    let duration = newEnd - newStart;
    if (duration <= 0.001) {
      addMessage({ message: "No room to insert caption.", severity: "alert", visible: true });
      return;
    }

    const insertedCueId = `cue-${Date.now()}-${cueIdCounter}`;
    setCueIdCounter((c) => c + 1);

    const newCue = {
      id: insertedCueId,
      start: formatVTTTime(newStart),
      end: formatVTTTime(newEnd),
      startS: newStart,
      endS: newEnd,
      duration: (newEnd - newStart).toFixed(3),
      text: "",
      position: 50,
      align: "center",
    }

    let tempCues = Object.assign({}, cues, { [cues.length]: newCue });
    tempCues = Object.values(tempCues).sort((a, b) => a.startS - b.startS);
    setCues(tempCues);
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

  const setCueStart = useCallback((value, cueId) => {
    const trimmed = String(value ?? "").trim();
    const valueS = vttToS(trimmed);
    if (valueS === -1) {
      return;
    }

    let tempCues = cues.map((cue) => {
      if (cue.id !== cueId) return cue;
      return { ...cue, start: trimmed, startS: valueS };
    })
    tempCues = Object.values(tempCues).sort((a, b) => a.startS - b.startS);
    setCues(tempCues);
    seekTo(valueS, videoElRef, wavesurferRef);
  }, [activeSettingsIndex, cues]);

  const setCueEnd = useCallback((value, cueId) => {
    const trimmed = String(value ?? "").trim();
    const valueS = vttToS(trimmed);
    if (valueS === -1) {
      return;
    }

    let tempCues = cues.map((cue) => {
      if (cue.id !== cueId) return cue;
      return { ...cue, end: trimmed, endS: valueS };
    })
    tempCues = Object.values(tempCues).sort((a, b) => a.startS - b.startS);
    setCues(tempCues);
    seekTo(valueS, videoElRef, wavesurferRef);
  }, [activeSettingsIndex, cues]);

  const openSettings = (index) => {
    if (selectedCueId !== index) {
      setSelectedCueId(index);
    }
    if (activeSettingsIndex !== index) {
      setActiveSettingsIndex(index);
    }
  }

  // After inserting a new cue, focus immediately on its text input for accessibility and ease of use
  useEffect(() => {
    if (selectedCueId === -1) {
      return
    }

    let inputElement = document.querySelector(`#input-${selectedCueId}`)
    if (inputElement) {
      inputElement?.focus()
      setActiveSettingsIndex(-1)
    }
  }, [inputFocus])

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
    seekTo(startTime, videoElRef, wavesurferRef);
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
      <div
        inert={isLoading ? true : undefined}
        id="media-captions-editor"
        className={isLoading ? 'editor-loading' : '' }>

        <div id="captions-editor-info-row">
          <div className="flex-row gap-2 align-items-center">
            <FileInformation
              t={t}
              fileData={ Object.assign({}, file.fileData, { fileSize: fileTotalSize })}
            />
          </div>
          
          {/* TRACK SELECTION */}
          <div className="flex-row gap-2 align-items-center">
            <div className="flex-row gap-1 align-items-center">
              <label id="combo-label-trackSelect">{t('form.media.label.track')}</label>
              <Combobox
                isDisabled={vttArray.length === 0}
                handleChange={handleTrackSelect}
                id='trackSelect'
                label=''
                options={trackOptions}
              />
            </div>
            <button
              className="btn-icon-left btn-secondary btn-small"
              onClick={addNewTrack}
              aria-label={t('form.media.button.add_track')}
              title={t('form.media.button.add_track')}
              disabled={isDisabled || error !== ""}
            >
              <AddIcon aria-hidden="true" className="icon-md" />
              {t('form.media.button.add_track')}
            </button>
          </div>
        </div>
        <div id="captions-editor-main-row" className={isFullWidthVideo ? "full-width-video" : ""}>
          <div id="table-focus-layer">
            { vttArray.length === 0 ? (
              <div className="callout-container filled-container">
                <div className="flex-row gap-2">
                  <InfoIcon className="icon-md udoit-info align-self-top" alt="" aria-hidden="true"/>
                  <div className="flex-column" dangerouslySetInnerHTML={{__html: t('form.media.info.tracks_description')}} />
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
                      />
                      <InfoPopover
                        t={t}
                        title={t('form.media.info.track_type_title')}
                        content={t('form.media.info.track_type_content')}
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
                      />
                    </div>
                    <button
                      className="btn-secondary btn-small btn-icon-only"
                      disabled={isDisabled || !cues || cues?.length === 0}
                      aria-label={t('form.media.button.export_vtt')}
                      title={t('form.media.button.export_vtt')}
                      disabled={cues.length === 0}
                      onClick={handleExport}>
                      <DownloadIcon className="icon-md" />
                    </button>
                  </div>
                </div>
                { trackErrors.length > 0 && (
                  <OptionFeedback
                    t={t}
                    feedbackArray={trackErrors}
                  />
                )}
                <div id="captions-list-inputs">
                  {cues.length === 0 && (
                    <div className="callout-container mt-3">
                      <div className="flex-column gap-4">
                        <div className="flex-row justify-content-around align-items-center flex-wrap gap-1">
                          <button
                            className="btn-icon-left btn-secondary btn-small flex-shrink-0"
                            onClick={() => insertCue(-1, true, true)}
                            aria-label={t('form.media.button.add_cue')}
                            title={t('form.media.button.add_cue')}
                            disabled={isDisabled || error !== ""}
                          >
                            <AddIcon aria-hidden="true" className="icon-md" />
                            {t('form.media.button.enter_with_type', { captionType: captionTypes[vttArray[vttActiveIndex]?.kind] || captionTypes.captions })}
                          </button>
                          <button
                            className="btn-secondary btn-small btn-icon-left flex-shrink-0"
                            onClick={() => handleImport()}>
                            <UploadIcon className="icon-md" />
                            <div>{t('form.media.button.import_vtt')}</div>
                          </button>
                          <button
                            className="btn-danger btn-small btn-icon-left flex-shrink-0"
                            onClick={() => deleteTrack()}>
                            <DeleteIcon className="icon-md" />
                            <div>{t('form.media.button.delete_track')}</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  { cueDisplay === CUE_STYLE.LIST && (
                    <>
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
                        setCueEnd={setCueEnd}
                        setCueStart={setCueStart}
                        setCueText={setCueText}
                      />
                      {cues.length > 0 && (
                        <div className="flex-row flex-end mt-2">
                          <button
                            className="btn-secondary btn-icon-left"
                            disabled={isDisabled}
                            onClick={() => insertCue(-1, true, true)}>
                            <TimerIcon className="icon-md" aria-hidden="true" />
                            {t('form.media.button.insert_caption_now', {'captionType': captionTypesSingle[vttArray[vttActiveIndex]?.kind] || captionTypesSingle['captions']})}
                          </button>
                        </div>
                      )}
                    </>
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
                waveColor={preferences.darkMode ? "#505975" : "#C5C9D3"}
                progressColor={preferences.darkMode ? "#5BA1FF" : "#81acd0"}
                plugins={plugins}
                onReady={onWsReady}
                onError={handleWaveformError}
                onClick={(self, e) => { handleWaveformClick(e) }}
              />
              {noAudioTrack && cues.length === 0 && (
                <div className="waveform-no-audio-note">{t('form.media.label.no_audio_track')}</div>
              )}
              <div ref={timelineRef} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}