import React from 'react'
import { Spinner } from '@instructure/ui-spinner'
import { Alert } from '@instructure/ui-alerts'

import Classes from '../../css/app.css'

class CourseUpdateProgress extends React.Component {
    constructor(props) {
        super(props)
        this.checkProgress = this.checkProgress.bind(this)
        this.state = {
            completed: false,
        }
    }

    render() {
        return (
            this.checkProgress() && !this.props.contentUpdateCompleted &&
            <div>
                <Alert
                    variant="info"
                    margin="small large"
                >
                    Updated {this.props.progress} items so far...
                    <Spinner size="x-small" margin="0 small" renderTitle="Loading" />
                </Alert>
            </div>
        )
    }

    checkProgress() {
        if(this.props.title != "Getting content from Canvas") {
            setTimeout(() => {
                this.props.contentUpdateCompleted = false
            }, 2000);
        }
        return true
    }
}

export default CourseUpdateProgress
