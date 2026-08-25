import { truncateVttTime } from "../../Services/Captions";

export default function mediaCaptionsProcessing({
  videoElRef,
  wavesurferRef
}) {

  const completeDrag = (region, currentCues, setCueStartEnd) => {
    const cueId = region.data?.cueId;
    region.data.snapStartRegionId = '';
    region.data.snapStartOffset = 0;
    region.data.snapEndRegionId = '';
    region.data.snapEndOffset = 0;
    if (!cueId) return;

    setCueStartEnd(currentCues, cueId, region.start, region.end);
  };

  const evaluateDrag = (updateControl, region, currentCues) => {

    const CUE_SNAP_DISTANCE = 0.25; // Seconds

    // Snapping: If the element is within .25 seconds of another, it should "snap" to share an edge.
    const currentCueId = region?.data?.cueId;
    if (!currentCueId) {
      return
    }

    let dragStartTime = region?.start;
    let dragEndTime = region?.end;

    // Dragging the whole region or the start should compare its time to other cues' endings.
    if (!updateControl || updateControl === "start") {

      // If the "snap effect" is on for the region's start, see if we've pulled enough away to overcome it.
      if (region?.data?.snapStartRegionId) {
        dragStartTime -= (region?.data?.snapStartOffset || 0);
        for (let i = 0; i < currentCues.length; i++) {
          if (currentCues[i].id === region.data.snapStartRegionId) {
            const timeDifference = currentCues[i].endS - dragStartTime;
            if (Math.abs(timeDifference) > CUE_SNAP_DISTANCE) {
              region.data.snapStartOffset = 0;
              region.data.snapStartRegionId = '';
              region.start = dragStartTime;
            }
            else {
              region.start = currentCues[i].endS;
              region.data.snapStartOffset = currentCues[i].endS - dragStartTime;
            }
          }
        }
      }

      else {
        for (let i = 0; i < currentCues.length; i++) {
          if (currentCues[i].id !== currentCueId) {
            const startTimeDifference = currentCues[i].endS - dragStartTime;
            if (Math.abs(startTimeDifference) < CUE_SNAP_DISTANCE) {
              region.data.snapStartOffset = startTimeDifference;
              region.data.snapStartRegionId = currentCues[i].id;
              region.start = currentCues[i].endS;
            }
          }
        }
      }
    }
    
    // Dragging the whole region or the end should compare its time to other cues' beginnings.
    if (!updateControl || updateControl === "end") {

      // If the "snap effect" is on for the regions end, see if we've pulled enough away to overcome it.
      if (region?.data?.snapEndRegionId) {
        dragEndTime -= (region?.data?.snapEndOffset || 0);
        for (let i = 0; i < currentCues.length; i++) {
          if (currentCues[i].id === region.data.snapEndRegionId) {
            const timeDifference = currentCues[i].startS - dragEndTime;
            if (Math.abs(timeDifference) > CUE_SNAP_DISTANCE) {
              region.data.snapEndOffset = 0;
              region.data.snapEndRegionId = '';
              region.end = dragEndTime;
            }
            else {
              region.end = currentCues[i].startS;
              region.data.snapEndOffset = currentCues[i].startS - dragEndTime;
            }
          }
        }
      }

      else {
        for (let i = 0; i < currentCues.length; i++) {
          if (currentCues[i].id !== currentCueId) {
            const endTimeDifference = currentCues[i].startS - dragEndTime;
            if (Math.abs(endTimeDifference) < CUE_SNAP_DISTANCE) {
              region.data.snapEndOffset = endTimeDifference;
              region.data.snapEndRegionId = currentCues[i].id;
              region.end = currentCues[i].startS;
            }
          }
        }
      }
    }

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
  };

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

  const updateRegionTimestampText = (domElement, cue) => {
    const startTimeText = truncateVttTime(cue.start);
    const endTimeText = truncateVttTime(cue.end);
    const timestampText = `${startTimeText} - ${endTimeText}`;

    let timestampElement = domElement.querySelector('[part="timestamp"]');
    if (!timestampElement) {
      timestampElement = document.createElement("div")
      timestampElement.setAttribute('part', 'timestamp');
      domElement.appendChild(timestampElement)
    }

    timestampElement.textContent = timestampText;
  };

  const updateVideoTracks = (video, vttText, videoTracksUrl = '', setVideoTracksUrl) => {

    // If there is an existing tracks URL, release it (allows garbage collection).
    if (videoTracksUrl) {
      URL.revokeObjectURL(videoTracksUrl);
    }

    const vttFormattedText = "WEBVTT\n\n" + vttText;

    // Keep the video's <track> elements updated as the cues change.
    Array.from(video.querySelectorAll("track")).forEach((tr) => tr.remove());
    const blob = new Blob([vttFormattedText], { type: "text/vtt" });
    const blobUrl = URL.createObjectURL(blob);
    const track = document.createElement("track");
    track.kind = "captions";  // This is technically not always correct, but ensures the captions will display on most browsers.
    track.src = blobUrl;
    track.default = true;
    video.appendChild(track);

    // Firefox doesn't always honor 'default' attribute to auto-show a track, so force explicitly
    track.track.mode = "showing";

    setVideoTracksUrl(blobUrl);
  };

  return {
    completeDrag,
    evaluateDrag,
    seekTo,
    updateRegionTimestampText,
    updateVideoTracks
  }
}