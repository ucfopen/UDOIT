import React from 'react'
import DownloadIcon from '../Icons/DownloadIcon'
import ExternalLinkIcon from '../Icons/ExternalLinkIcon'
import ContentTypeIcon from '../Icons/ContentTypeIcon'
import * as Text from '../../Services/Text'
import './FixIssuesContentPreview.css'
import SeverityIcon from '../Icons/SeverityIcon'


export default function FixIssuesContentPreview({
  t,
  settings,
  activeIssue,
}) {

  const getReadableFileType = (fileType) => {
    switch (fileType) {
      case 'doc':
        return t('label.mime.doc')
      case 'ppt':
        return t('label.mime.ppt')
      case 'xls':
        return t('label.mime.xls')
      case 'pdf':
        return t('label.mime.pdf')
      case 'audio':
        return t('label.mime.audio')
      case 'video':
        return t('label.mime.video')
      default:
        return t('label.mime.unknown')
    }
  }

  return (
    <>

    </>
  )
}