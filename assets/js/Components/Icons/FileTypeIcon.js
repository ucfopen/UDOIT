import React from 'react';
import FileTypePDFIcon from './FileTypePDFIcon'
import FileTypeWordIcon from './FileTypeWordIcon'
import FileTypePowerPointIcon from './FileTypePowerPointIcon'
import FileTypeExcelIcon from './FileTypeExcelIcon'
import FileTypeAudioIcon from './FileTypeAudioIcon'
import FileTypeVideoIcon from './FileTypeVideoIcon'

export default function FileTypeIcon(props) {
  if(!props.type) {
    return null
  }

  switch(props.type.toUpperCase()) {
    case('PDF'):
      return <FileTypePDFIcon {...props} />
    case('WORD'):
    case('DOC'):
    case('DOCX'):
      return <FileTypeWordIcon {...props} />
    case('POWERPOINT'):
    case('PPT'):
    case('PPTX'):
      return <FileTypePowerPointIcon {...props} />
    case('EXCEL'):
    case('XLS'):
    case('XLSX'):
      return <FileTypeExcelIcon {...props} />
    case('VIDEO'):
      return <FileTypeVideoIcon {...props} />
    case('AUDIO'):
      return <FileTypeAudioIcon {...props} />
    default:
      return null
  }
}