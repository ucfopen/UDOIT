import React, { useEffect, useState } from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'

export default function UfixitReviewOnly(props) {
  function getMetadata() {
    const issue = props.activeIssue
    const metadata = issue.metadata ? JSON.parse(issue.metadata) : {}
    return metadata
  }

  const metadata = getMetadata()
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (metadata.message) {
      // when using equal access, we should have metadata.message
      setMessage(metadata.message)
    }
    else {
      // otherwise, in phpally, we display the default "review" text
      setMessage(props.t("label.review_only"))
    }
  }, [metadata])

  return (
    <View as="div" margin="small small">
      <Text lineHeight='double'>{message}</Text>
    </View>
  )
}