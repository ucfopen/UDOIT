import { useCallback, useEffect, useState, useRef } from "react";
import { vttToMS, formatVTTTime, truncateVttTime } from "../../Services/Captions";

export default function useWaveformKeyboard({
  cues,
  setCues,
  selectedIndex,
  setSelectedIndex,
  wavesurferRef,
  videoElRef,
  findRegionsPlugin,
  seekTo,
  playPause
}) {
  const [waveKbLayer, setWaveKbLayer] = useState('wave'); // 'wave' | 'regions' | 'mode'
  const [activeMode, setActiveMode] = useState(1);        // 0=start, 1=pan, 2=end

  const removePartAttribute = (el, partAttribute) => {
    if (!el) return;
    let parts = el.getAttribute('part')?.split(' ') || [];
    parts = parts.filter(p => p !== partAttribute);
    el.setAttribute('part', parts.join(' '));
  }

  const addPartAttribute = (el, partAttribute) => {
    if (!el) return;
    let parts = el.getAttribute('part')?.split(' ') || [];
    if (!parts.includes(partAttribute)) {
      parts.push(partAttribute);
      el.setAttribute('part', parts.join(' '));
    }
  }

  const getRegionsPlugin = useCallback(() => {
    const ws = wavesurferRef.current;
    return ws ? findRegionsPlugin(ws) : null;
  }, [findRegionsPlugin, wavesurferRef]);

  const getRegionByCueId = useCallback((cueId) => {
    const plugin = getRegionsPlugin();
    if (!plugin) return null;
    const all = plugin.getRegions?.() || [];
    return all.find(r => r?.data?.cueId === cueId) || null;
  }, [getRegionsPlugin]);

  // Apply visual highlight per mode
  const applyRegionHighlight = useCallback((cueId, mode = 1) => {
    const region = getRegionByCueId(cueId);
    const plugin = getRegionsPlugin();
    const all = plugin?.getRegions?.() || [];

    all.forEach(r => {
      const domElement = r.element;
      if (!domElement) return;
      removePartAttribute(domElement, 'region-focus');
      removePartAttribute(domElement, 'highlight-start');
      removePartAttribute(domElement, 'highlight-pan');
      removePartAttribute(domElement, 'highlight-end');
    });

    const el = region?.element;
    if (!el) return;

    if (mode === 0) {
      // Start edge
      addPartAttribute(el, 'highlight-start');
    } else if (mode === 1) {
      // Whole region
      addPartAttribute(el, 'highlight-pan');
    } else if (mode === 2) {
      // End edge
      addPartAttribute(el, 'highlight-end');
    }
    else {
      // Focused, but not selected.
      addPartAttribute(el, 'region-focus');
    }

  }, [getRegionsPlugin, getRegionByCueId, selectedIndex]);

  useEffect(() => {
    if (waveKbLayer === 'regions' && selectedIndex >= 0) {
      applyRegionHighlight(selectedIndex, 1);
    } else if (waveKbLayer === 'mode' && selectedIndex >= 0) {
      applyRegionHighlight(selectedIndex, activeMode);
    } else {
      const plugin = getRegionsPlugin();
      const all = plugin?.getRegions?.() || [];
      all.forEach(r => {
        const domElement = r.element;
        if (!domElement) return;
        domElement.classList.remove('region-focus', 'highlight-start', 'highlight-pan', 'highlight-end');
      });
    }
  }, [waveKbLayer, selectedIndex, activeMode, applyRegionHighlight, getRegionsPlugin]);

  const nudgeSeconds = 0.1;
  const onWaveformKeyDown = useCallback((e) => {
    // Layer transitions
    if ((e.key === 'Enter' || e.key === ' ') && waveKbLayer === 'wave') {
      setWaveKbLayer('regions');
      setSelectedIndex(prev => {
        const next = prev >= 0 ? prev : Math.max(0, Math.min(cues.length - 1, selectedIndex >= 0 ? selectedIndex : 0));
        return next;
      });
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' && waveKbLayer === 'regions') {
      setWaveKbLayer('mode');
      setActiveMode(0);
      e.preventDefault();
      return;
    }
    if (e.key === ' ' && waveKbLayer === 'regions') {
      const cue = cues[selectedIndex];
      if (cue) {
        seekTo(vttToMS(cue.start) / 1000);
      }
      playPause();
      e.preventDefault();
    }
    if (e.key === 'Escape') {
      if (waveKbLayer === 'mode') setWaveKbLayer('regions');
      else if (waveKbLayer === 'regions') setWaveKbLayer('wave');
      e.preventDefault();
      return;
    }

    // Tab cycles
    if (e.key === 'Tab') {
      if (waveKbLayer === 'regions') {
        const dir = e.shiftKey ? -1 : 1;
        setSelectedIndex(prev => Math.max(0, Math.min(cues.length - 1, prev + dir)));
        e.preventDefault();
        return;
      }
      if (waveKbLayer === 'mode') {
        const dir = e.shiftKey ? -1 : 1;
        setActiveMode(prev => {
          let next = prev + dir;
          if (next < 0) next = 2;
          if (next > 2) next = 0;
          return next;
        });
        e.preventDefault();
        return;
      }
    }

    // Arrow edits in mode layer
    if (waveKbLayer === 'mode' && selectedIndex >= 0) {
      if(e.key === ' ') {
        const cue = cues[selectedIndex];
        if (cue) {
          seekTo(vttToMS(cue.start) / 1000);
        }
        playPause();
        e.preventDefault();
        return;
      }
      const isLeft = e.key === 'ArrowLeft';
      const isRight = e.key === 'ArrowRight';
      if (!isLeft && !isRight) return;

      e.preventDefault();

      const delta = (isRight ? 1 : -1) * nudgeSeconds;
      const cue = cues[selectedIndex];
      if (!cue) return;

      const start = vttToMS(cue.start) / 1000;
      const end = vttToMS(cue.end) / 1000;

      const video = videoElRef.current;
      const duration = video?.duration || Infinity;

      let newStart = start;
      let newEnd = end;

      if (activeMode === 0) {
        // drag start
        newStart = Math.max(0, Math.min(end - 0.05, start + delta));
      } else if (activeMode === 1) {
        // pan
        const span = end - start;
        let s = start + delta;
        let e2 = end + delta;
        if (s < 0) { s = 0; e2 = span; }
        if (e2 > duration) { e2 = duration; s = duration - span; }
        newStart = s;
        newEnd = e2;
      } else if (activeMode === 2) {
        // drag end
        newEnd = Math.min(duration, Math.max(start + 0.05, end + delta));
      }

      setCues(prev => prev.map((c, i) => (
        i !== selectedIndex ? c : {
          ...c,
          start: formatVTTTime(newStart),
          end: formatVTTTime(newEnd),
          duration: (newEnd - newStart).toFixed(3),
        }
      )));

      // Seek preview
      const ws = wavesurferRef.current;
      if (ws && duration && video) {
        const previewTime = activeMode === 2 ? newEnd : newStart;
        seekTo(previewTime);
        ws.seekTo(previewTime / duration);
      }      
    }
  }, [waveKbLayer, cues, selectedIndex, activeMode, nudgeSeconds, setSelectedIndex, setCues, wavesurferRef, videoElRef, playPause, seekTo]);

  const prevRegionRef = useRef(selectedIndex);

  // useEffect(() => {
  //   if (selectedIndex < 0 || !cues[selectedIndex]) return;
  //   const cue = cues[selectedIndex];
  //   const startSec = vttToMS(cue.start) / 1000;
  //   const endSec = vttToMS(cue.end) / 1000;

  //   // Determine direction
  //   const prev = prevRegionRef.current;
  //   let seekTarget = endSec;
  //   if (prev !== undefined && prev !== selectedIndex) {
  //     seekTarget = selectedIndex > prev ? endSec : startSec;
  //   }
  //   prevRegionRef.current = selectedIndex;

  //   const ws = wavesurferRef.current;
  //   const video = videoElRef.current;
  //   const duration = ws?.getDuration?.() || video?.duration || 0;

  //   if (video && duration) video.currentTime = seekTarget;
  //   if (ws && ws.getDuration?.()) ws.seekTo(seekTarget / ws.getDuration());

  //   applyRegionHighlight(selectedIndex, waveKbLayer === 'mode' ? activeMode : -1);
  // }, [selectedIndex, cues, wavesurferRef, videoElRef]);

  return {
    waveKbLayer,
    selectedIndex,
    activeMode,
    setWaveKbLayer,
    setSelectedIndex,
    setActiveMode,
    onWaveformKeyDown,
    applyRegionHighlight // optional export if needed elsewhere
  };
}