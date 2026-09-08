import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AddIcon from "../Icons/AddIcon";
import ArrowIcon from "../Icons/ArrowIcon";
import CloseIcon from "../Icons/CloseIcon";
import InsertAfterIcon from "../Icons/InsertAfterIcon";
import InsertBeforeIcon from "../Icons/InsertBeforeIcon";
import DeleteIcon from "../Icons/DeleteIcon";
import TimeIcon from "../Icons/TimeIcon";

import { vttToMS } from "../../Services/Captions";


export default function MediaCaptionsCueList({
  t,
  activeSettingsIndex,
  cues,
  error,
  deleteCue,
  handleSelectedIndex,
  insertCue,
  isDisabled,
  openSettings,
  selectCue,
  selectedIndex,
  setActiveSettingsIndex,
  setCueEnd,
  setCueStart,
  setCueText,
}) {

  return (
    <ul aria-labelledby="captions-list-label">
      {cues.map((cue, i) => {

        const firstCaption = i === 0;
        const lastCaption = i === cues.length - 1;
        const active = selectedIndex === cue.id;

        return (
          <li
            tabIndex={-1}
            key={cue.id || i}
            id={'list-item-cue-' + i}
            className={`${active ? " active" : ""}`}
            data-id={cue.id}
            onClick={(e) => {
              e.stopPropagation()
            }}
            >
            <div
              id={`cue-row-${i}`}
              className="cue-row"
              onClick={(e) => {
                e.stopPropagation()
                handleSelectedIndex(cue.id);
                selectCue(i, vttToMS(cue.start) / 1000);
              }}
              role="group"
              aria-label={cue.text}
            >
              { (activeSettingsIndex === cue.id) && (
                <div className="flex-row w-100 justify-content-between">
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
                        onChange={e => setCueStart(e.target.value, cue.id)}
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
                        onChange={e => setCueEnd(e.target.value, cue.id)}
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
                <textarea
                  id={`input-${cue.id}`}
                  defaultValue={cue.text}
                  disabled={isDisabled || error !== ""}
                  aria-label={t('form.media.label.caption_text', { captionNumber: i + 1 })}
                  onBlur={(e) => setCueText(cue.id, e.target.value)}
                  onFocus={(e) => {
                    handleSelectedIndex(cue.id)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                />
                { (activeSettingsIndex !== i) && (
                  <>
                    <button
                      id={`insert-after-${i}`}
                      className="btn-small btn-icon-only btn-link font-normal"
                      aria-label={t('form.media.button.insert_after')}
                      title={t('form.media.button.insert_after')}
                      onClick={(e) => {
                        insertCue(i, false);
                        e.stopPropagation();
                      }}
                      disabled={isDisabled || error !== ""}
                    >
                      <InsertAfterIcon aria-hidden="true" className="icon-md" />
                    </button>
                    <button
                      id={`insert-before-${i}`}
                      className="btn-small btn-icon-only btn-link font-normal"
                      aria-label={t('form.media.button.insert_before')}
                      title={t('form.media.button.insert_before')}
                      onClick={(e) => {
                        insertCue(i);
                        e.stopPropagation();
                      }}
                      disabled={isDisabled || error !== ""}
                    >
                      <InsertBeforeIcon aria-hidden="true" className="icon-md" />
                    </button>
                    <button
                      id={`settings-button-${i}`}
                      className="btn-small btn-icon-only btn-link font-normal"
                      aria-label={t('form.media.button.show_details')}
                      title={t('form.media.button.show_details')}
                      onClick={(e) => {
                        openSettings(cue.id);
                        e.stopPropagation();
                      }}
                      disabled={isDisabled || error !== ""}
                    >
                      <TimeIcon aria-hidden="true" className="icon-md" />
                    </button>
                    <button
                      className="btn-small btn-icon-only btn-link font-normal"
                      aria-label={t('form.media.button.delete')}
                      title={t('form.media.button.delete')}
                      onFocus={() => handleSelectedIndex(cue.id)}
                      onClick={(e) => {
                        deleteCue(cue.id);
                        e.stopPropagation();
                      }}
                      disabled={isDisabled || error !== ""}
                    >
                      <DeleteIcon aria-hidden="true" className="icon-md" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}