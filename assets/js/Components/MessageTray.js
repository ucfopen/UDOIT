import React, { useEffect} from 'react'
import { Alert } from '@instructure/ui-alerts'
import { Spinner } from '@instructure/ui-spinner'
import Classes from '../../css/app.css'

export default function MessageTray ({ messages, hasNewReport, clearMessages, t }) {

  useEffect(() => {
    clearMessages()
  }, [])

  return (
    <div className={Classes.messagesTray}>
      {!hasNewReport && (
        <Alert
          variant="info"
          renderCloseButtonLabel={t('label.close')}
          onDismiss={clearMessages}
          margin="small large"
          liveRegion={() => document.getElementsByClassName(Classes.messagesTray)[0]}
        >
          {t('label.content_loading_msg')}
          <Spinner size="x-small" margin="0 small" renderTitle="Loading" />
        </Alert>
      )}
      {messages.map((msg, i) => (
        <Alert
          variant={msg.severity}
          timeout={msg.timeout ? msg.timeout : 0}
          renderCloseButtonLabel={t('label.close')}
          onDismiss={clearMessages}
          margin="small large"
          key={`msg${i}`}
        >
          {t(msg.message)}
        </Alert>
      ))}
    </div>
  )
}