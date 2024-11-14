import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { Heading } from '@instructure/ui-heading'

class UfixitReviewOnly extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      messageArgs: this.getMessageArgs(),
    }
  }

  getMessageArgs() {
    const issue = this.props.activeIssue
    const args = (issue.metadata.messageArgs) ? JSON.parse(issue.metadata.messageArgs) : {}
    console.log(args)
    return args
  }

  render() {
    return (
      <View as="div" margin="small small">
        <Text lineHeight="double">{this.props.t('label.review_only')}</Text>
        {/* <Text>Experimental messageArgs from Equal Access:</Text> */}
        {/* <Text>{this.state.messageArgs}</Text> */}
      </View>
    )
  }
}

export default UfixitReviewOnly