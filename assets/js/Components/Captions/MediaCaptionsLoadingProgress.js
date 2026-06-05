import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProgressIcon from "../Icons/ProgressIcon";
import * as Text from '../../Services/Text';

export default function MediaCaptionsLoadingProgress({
  t,
  fileName,
  fileLoadedSize,
  fileTotalSize,
}) {

  return (
    <div className="flex-column align-items-center mb-4 w-100">
      <div className="mb-2 flex-row justify-content-center align-items-center gap-3">
        <ProgressIcon className="icon-lg udoit-progress spinner" />
        <h2>{t('fix.label.loading_content')}</h2>
      </div>
        <div className="callout-container mb-4">
        <div className="flex-row justify-content-center mb-2">
          <h3 className="m-0">{fileName}</h3>
        </div>
        <div className="progress-container">
        { fileTotalSize === 0 ? (
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
              <div className="progress-bar-fill" style={{width: `${(fileLoadedSize / fileTotalSize) * 100}%`}}></div>
            </div>
            <div className="flex-row justify-content-between mt-2">
              <span>{t('form.media.label.loaded')} {Text.getReadableFileSize(fileLoadedSize)}</span>
              <span>{t('form.media.label.total_size')} {Text.getReadableFileSize(fileTotalSize)}</span>
            </div>
          </>
        )}
        </div>
      </div>
    </div> 
  );
}