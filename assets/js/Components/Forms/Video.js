import React from 'react'
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'

export default class Video extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    const pending = (this.props.activeIssue && (this.props.activeIssue.pending == '1'))
    const buttonLabel = (pending) ? 'form.processing' : 'form.scan'

    return (
      <View as="div" textAlign="center" margin="x-large" padding="x-large">
        <Button color="primary" onClick={this.props.handleManualScan} interaction={(!pending) ? 'enabled' : 'disabled'}>
          {('1' == pending) && <Spinner size="x-small" renderTitle={buttonLabel} />}
          {this.props.t(buttonLabel)}
        </Button>
      </View>
    );
  }
}