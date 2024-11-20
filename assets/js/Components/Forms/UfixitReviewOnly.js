import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'

class UfixitReviewOnly extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      metadata: this.getMetadata(),
    }
  }

  getMetadata() {
    const issue = this.props.activeIssue
    const metadata = JSON.parse(issue.metadata)
    console.log(metadata)
    return metadata
  }


  render() {
    return (
      <View as="div" margin="small small">
        {this.state.metadata.message ? <><Text lineHeight="double">{this.state.metadata.message}</Text><br /><br /></> : <></>}
        
        <Text fontStyle='italic' >{this.props.t('label.review_only')}</Text>
      </View>
    )
  }
}

export default UfixitReviewOnly