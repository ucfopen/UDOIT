import React from 'react'
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'
import { IconCheckMarkLine } from '@instructure/ui-icons'

export default class Video extends React.Component {
  constructor(props) {
    super(props)

    this.handleVideoRescan = this.handleVideoRescan.bind(this)
  }

  render() {
    const pending =
      this.props.activeIssue && this.props.activeIssue.pending == '1'
    const buttonLabel = pending ? 'form.processing' : 'form.scan'

    if (this.props.activeIssue.status == 1) {
      return (
        <View as="div" margin="small 0 large x-small" padding="0">
          <IconCheckMarkLine color="success" />
          <View margin="0 x-small">{this.props.t('label.fixed')}</View>
        </View>
      )
    }

    return (
      <View as="div" margin="small 0 large x-small" padding="0">
        <Button
          color="primary"
          onClick={this.handleVideoRescan}
          interaction={!pending ? 'enabled' : 'disabled'}
        >
          {'1' == pending && (
            <Spinner size="x-small" renderTitle={buttonLabel} />
          )}
          {this.props.t(buttonLabel)}
        </Button>
      </View>
    )
  }

  handleVideoRescan()
  {
    this.props.handleManualScan(this.props.activeIssue)
  }
}
