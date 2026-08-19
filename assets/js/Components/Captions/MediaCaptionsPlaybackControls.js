import React from "react";
import ForwardDoubleIcon from "../Icons/ForwardDoubleIcon";
import ForwardSingleIcon from "../Icons/ForwardSingleIcon";
import PauseIcon from "../Icons/PauseIcon";
import PlayIcon from "../Icons/PlayIcon";
import RewindDoubleIcon from "../Icons/RewindDoubleIcon";
import RewindSingleIcon from "../Icons/RewindSingleIcon";

export default function MediaCaptionsPlaybackControls({
  t,
  isDisabled,
  isPlaying,
  playPause,
  seekBy,
}) {

  return (
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
        aria-label={ isPlaying ? t('form.media.button.pause') : t('form.media.button.play')}
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
  );
}