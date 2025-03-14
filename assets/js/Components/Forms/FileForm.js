import React, { useState, useEffect } from 'react'

export default function FileForm ({
  t,
  settings,
  activeFile,
 }) {

  /** activeFile should have the form:
    file: {
      id": 1,
      fileName: "1737738806_398__50087.50089.pdf",
      fileType: "pdf",
      lmsFileId: "12863",
      updated: "2025-01-24T17:13:26+00:00",
      status: true,
      active: true,
      fileSize: "2168225",
      hidden: false,
      reviewed: null,
      downloadUrl: "https://canvas.dev.cdl.ucf.edu/files/12863/download?download_frd=1&verifier=0n2vcqFeSxeqa0UoKq4w8Ip1f9NaL2zh9Q5dI7WP",
      lmsUrl: "https://canvas.dev.cdl.ucf.edu/courses/383/files?preview=12863"
    },
    id: fileId,
    severity: FILTER.POTENTIAL,
    status: issueResolution,
    sectionIds: [],
    keywords: keywords,
    scanRuleId: 'aaaa_verify_file_accessibility',
    scanRuleLabel: scanRuleLabel,
    contentId: fileData.lmsFileId,
    contentType: FILTER.FILE,
    contentTypeLabel: fileTypeLabel,
    contentTitle: fileData.fileName,
    contentUrl: fileData.lmsUrl,
    currentState: currentState,
  **/

  return (
    <div>
      {JSON.stringify(activeFile)}
    </div>
  )
}