import { useCallback, useEffect, useState, useRef } from "react";
import { vttToMS, formatVTTTime, truncateVttTime } from "../../Services/Captions";

export default function useWaveformKeyboard({
  cues,
  setCues,
  selectedCueId,
  setSelectedCueId,
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
      removePartAttribute(domElement, 'highlight-start');
      removePartAttribute(domElement, 'highlight-pan');
      removePartAttribute(domElement, 'highlight-end');
    });

    const el = region?.element;
    if (!el) return;

    if (mode === 0) {
      // Start edge
      addPartAttribute(el, 'highlight-start');
    } else if (mode === 2) {
      // End edge
      addPartAttribute(el, 'highlight-end');
    }
    else {
      // Whole region
      addPartAttribute(el, 'highlight-pan');
    }

  }, [getRegionsPlugin, getRegionByCueId, selectedCueId]);

  useEffect(() => {
    if (waveKbLayer === 'regions' && selectedCueId !== -1) {
      applyRegionHighlight(selectedCueId, 1);
    } else if (waveKbLayer === 'mode' && selectedCueId !== -1) {
      applyRegionHighlight(selectedCueId, activeMode);
    } else {
      const plugin = getRegionsPlugin();
      const all = plugin?.getRegions?.() || [];
      all.forEach(r => {
        const domElement = r.element;
        if (!domElement) return;
        domElement.classList.remove('highlight-start', 'highlight-pan', 'highlight-end');
      });
    }
  }, [waveKbLayer, selectedCueId, activeMode, applyRegionHighlight, getRegionsPlugin]);

  const nudgeSeconds = 0.1;
  
  const onWaveformKeyDown = useCallback((e) => {
    
    // Space should trigger play/pause no matter the active mode.
    if (e.key === ' ') {
      
      if (waveKbLayer === 'regions') {
        const cue = cues.find((cue) => cue.id === selectedCueId);
        if (cue) {
          seekTo(vttToMS(cue.start) / 1000);
        }
      }

      playPause();
      e.preventDefault();
    }

    // Layer transitions: Enter to enter wave -> regions -> mode, Esc to leave mode -> regions -> wave.
    else if (e.key === 'Enter') {
      if (waveKbLayer === 'wave') {
        setWaveKbLayer('regions');
      }
      else if (waveKbLayer === 'regions') {
        setWaveKbLayer('mode');
        setActiveMode(0);
      }
      e.preventDefault();
      return;
    }
    else if (e.key === 'Escape') {
      if (waveKbLayer === 'mode') {
        setWaveKbLayer('regions');
      }
      else if (waveKbLayer === 'regions') {
        setWaveKbLayer('wave');
      }
      e.preventDefault();
      return;
    }

    // Tab cycles through regions in the region layer and modes in the mode layer.
    else if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      if (waveKbLayer === 'regions') {
        const dir = e.shiftKey ? -1 : 1;
        const prevIndex = cues.length > 0 ? cues.findIndex(cue => cue.id === selectedCueId) : -1;
        const nextIndex = Math.max(0, Math.min(cues.length - 1, prevIndex + dir));
        const nextCueId = cues[nextIndex]?.id
        if (nextCueId) {
          setSelectedCueId(nextCueId);
          const region = getRegionByCueId(nextCueId);
          if(region && region.element) {
            region.element.focus();
          }
        }
        return;
      }
      if (waveKbLayer === 'mode') {
        const dir = e.shiftKey ? -1 : 1;
        let tempMode = activeMode + dir;
        if (tempMode > 2) {
          tempMode = 0;
        }
        else if (tempMode < 0) {
          tempMode = 2;
        }
        setActiveMode(tempMode);
        return;
      }
    }

    // Arrow edits in mode layer
    else if (waveKbLayer === 'mode') {
      if (selectedCueId === -1) {
        return;
      }

      const isLeft = e.key === 'ArrowLeft';
      const isRight = e.key === 'ArrowRight';
      if (!isLeft && !isRight) return;

      e.preventDefault();

      const delta = (isRight ? 1 : -1) * nudgeSeconds;
      const cue = cues.find((cue) => cue.id === selectedCueId);
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

      setCues(prev => prev.map((cue) => (
        cue.id !== selectedCueId ? cue : {
          ...cue,
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
  }, [waveKbLayer, cues, selectedCueId, activeMode, nudgeSeconds, setSelectedCueId, setCues, wavesurferRef, videoElRef, playPause, seekTo]);

  return {
    waveKbLayer,
    activeMode,
    setWaveKbLayer,
    setActiveMode,
    onWaveformKeyDown,
    applyRegionHighlight // optional export if needed elsewhere
  };
}