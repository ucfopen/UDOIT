import { useCallback, useEffect, useState, useRef } from "react";
import { vttToMS, formatVTTTime } from "../../Services/Captions";

export default function useWaveformKeyboard({
  cues,
  setCues,
  selectedIndex,
  wavesurferRef,
  videoElRef,
  findRegionsPlugin,
  activeRegion,
  setActiveRegion,
}) {
  const [waveKbLayer, setWaveKbLayer] = useState('wave'); // 'wave' | 'regions' | 'mode'
  const [activeMode, setActiveMode] = useState(0);        // 0=start, 1=pan, 2=end

  const getRegionsPlugin = useCallback(() => {
    const ws = wavesurferRef.current;
    return ws ? findRegionsPlugin(ws) : null;
  }, [findRegionsPlugin, wavesurferRef]);

  const getRegionByIndex = useCallback((idx) => {
    const plugin = getRegionsPlugin();
    if (!plugin) return null;
    const all = plugin.getRegions?.() || [];
    return all.find(r => r?.data?.index === idx) || null;
  }, [getRegionsPlugin]);

  const sanitizeRegionsDom = useCallback(() => {
    const plugin = getRegionsPlugin();
    const all = plugin?.getRegions?.() || [];
    all.forEach(r => {
      const el = r?.element;
      if (!el) return;
      el.removeAttribute('tabindex');
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-hidden', 'true');
      el.setAttribute('role', 'presentation');
      el.style.outline = 'none';
    });
  }, [getRegionsPlugin]);

  // Apply visual highlight per mode
  const applyRegionHighlight = useCallback((idx, mode) => {
    const region = getRegionByIndex(idx);
    const plugin = getRegionsPlugin();
    const all = plugin?.getRegions?.() || [];

    all.forEach(r => {
      const el = r.element;
      if (!el) return;
      el.style.outline = '';
      el.style.boxShadow = '';
      el.style.filter = '';
      el.style.borderLeft = '';
      el.style.borderRight = '';
      el.style.opacity = r.data?.index === selectedIndex ? '1' : '0.9';
    });

    const el = region?.element;
    if (!el) return;

    // Base focus ring
    el.style.outline = '2px solid #1976d2';
    el.style.opacity = '1';

    if (mode === 0) {
      // Start edge
      el.style.borderLeft = '4px solid #ff9800';
      el.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25)';
    } else if (mode === 1) {
      // Whole region
      el.style.boxShadow = '0 0 0 3px rgba(255,152,0,0.85), inset 0 0 0 2px rgba(255,152,0,0.95)';
      el.style.filter = 'brightness(1.05)';
    } else if (mode === 2) {
      // End edge
      el.style.borderRight = '4px solid #ff9800';
      el.style.boxShadow = '0 0 0 3px rgba(25,118,210,0.25)';
    }
  }, [getRegionsPlugin, getRegionByIndex, selectedIndex]);

  useEffect(() => {
    sanitizeRegionsDom();
    if (waveKbLayer === 'regions' && activeRegion >= 0) {
      applyRegionHighlight(activeRegion, 1);
    } else if (waveKbLayer === 'mode' && activeRegion >= 0) {
      applyRegionHighlight(activeRegion, activeMode);
    } else {
      const plugin = getRegionsPlugin();
      const all = plugin?.getRegions?.() || [];
      all.forEach(r => {
        const el = r.element;
        if (!el) return;
        el.style.outline = '';
        el.style.boxShadow = '';
        el.style.filter = '';
        el.style.borderLeft = '';
        el.style.borderRight = '';
      });
    }
  }, [sanitizeRegionsDom, waveKbLayer, activeRegion, activeMode, applyRegionHighlight, getRegionsPlugin]);

  const nudgeSeconds = 0.1;
  const onWaveformKeyDown = useCallback((e) => {
    // Layer transitions
    if ((e.key === 'Enter' || e.key === ' ') && waveKbLayer === 'wave') {
      setWaveKbLayer('regions');
      setActiveRegion(prev => {
        const next = prev >= 0 ? prev : Math.max(0, Math.min(cues.length - 1, selectedIndex >= 0 ? selectedIndex : 0));
        return next;
      });
      e.preventDefault();
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && waveKbLayer === 'regions') {
      setWaveKbLayer('mode');
      setActiveMode(0);
      e.preventDefault();
      return;
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
        setActiveRegion(prev => Math.max(0, Math.min(cues.length - 1, prev + dir)));
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
    if (waveKbLayer === 'mode' && activeRegion >= 0) {
      const isLeft = e.key === 'ArrowLeft';
      const isRight = e.key === 'ArrowRight';
      if (!isLeft && !isRight) return;

      const delta = (isRight ? 1 : -1) * nudgeSeconds;
      const cue = cues[activeRegion];
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
        i !== activeRegion ? c : {
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
        video.currentTime = previewTime;
        ws.seekTo(previewTime / duration);
      }

      e.preventDefault();
    }
  }, [waveKbLayer, cues, activeRegion, activeMode, nudgeSeconds, selectedIndex, setCues, wavesurferRef, videoElRef]);

  const prevRegionRef = useRef(activeRegion);

  useEffect(() => {
    if (activeRegion < 0 || !cues[activeRegion]) return;
    const cue = cues[activeRegion];
    const startSec = vttToMS(cue.start) / 1000;
    const endSec = vttToMS(cue.end) / 1000;

    // Determine direction
    const prev = prevRegionRef.current;
    let seekTarget = endSec;
    if (prev !== undefined && prev !== activeRegion) {
      seekTarget = activeRegion > prev ? endSec : startSec;
    }
    prevRegionRef.current = activeRegion;

    const ws = wavesurferRef.current;
    const video = videoElRef.current;
    const duration = ws?.getDuration?.() || video?.duration || 0;

    if (video && duration) video.currentTime = seekTarget;
    if (ws && ws.getDuration?.()) ws.seekTo(seekTarget / ws.getDuration());
  }, [activeRegion, cues, wavesurferRef, videoElRef]);

  return {
    waveKbLayer,
    activeRegion,
    activeMode,
    setWaveKbLayer,
    setActiveRegion,
    setActiveMode,
    onWaveformKeyDown,
    applyRegionHighlight, // optional export if needed elsewhere
    sanitizeRegionsDom,
  };
}