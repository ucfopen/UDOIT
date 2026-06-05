import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AddIcon from "../Icons/AddIcon";
import AlignCenterIcon from "../Icons/AlignCenterIcon";
import AlignLeftIcon from "../Icons/AlignLeftIcon";
import AlignRightIcon from "../Icons/AlignRightIcon";
import ArrowIcon from "../Icons/ArrowIcon";
import CloseIcon from "../Icons/CloseIcon";
import DeleteIcon from "../Icons/DeleteIcon";
import SettingsIcon from "../Icons/SettingsIcon";
import TimeIcon from "../Icons/TimeIcon";

import { vttToMS } from "../../Services/Captions";
import SliderSelect from "../Widgets/SliderSelect";


export default function MediaCaptionsPlaybackControls({
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
  setCueAlign,
  setCueEnd,
  setCueStart,
  setCueText,
}) {

  return (
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
                handleSelectedIndex(-1)
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
              <div className={"insert-button-container mb-1" + (!firstCaption ? " mt-2" : "")}>
                <button
                  className="btn-icon-left btn-secondary btn-small"
                  onClick={() => insertCue(i)}
                  aria-label={t('form.media.button.add')}
                  title={t('form.media.button.add')}
                  disabled={isDisabled || error !== ""}
                >
                  <AddIcon aria-hidden="true" className="icon-md" />
                  <div>Insert Caption Before</div>
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
                      setActiveOption={setCueAlign}
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
                        onChange={e => setCueStart(e.target.value)}
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
                        onChange={e => setCueEnd(e.target.value)}
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
                  onBlur={(e) => setCueText(i, e.target.value)}
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
                        e.stopPropagation()
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
                        e.stopPropagation()
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
  );
}