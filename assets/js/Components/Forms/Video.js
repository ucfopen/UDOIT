import React from 'react'
import { View } from '@instructure/ui-view'
import { Button } from '@instructure/ui-buttons'
import { Spinner } from '@instructure/ui-spinner'

export default class Video extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        const pending = (this.props.activeIssue && this.props.activeIssue.pending)
        const buttonLabel = (pending) ? 'form.processing' : 'form.scan'
        const canSubmit = (!pending && !this.props.activeIssue.status)

        return(
            <View as="div" textAlign="center" margin="small 0" >
                <Button color="primary" onClick={this.props.handleManualScan} interaction={(canSubmit) ? 'enabled' : 'disabled'}>
                    {pending && <Spinner size="x-small" renderTitle={buttonLabel} />}
                    {this.props.t(buttonLabel)}
                </Button>
            </View>
        );
    }
}