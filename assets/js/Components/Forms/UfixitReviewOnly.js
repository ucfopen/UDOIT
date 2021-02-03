import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'

class UfixitReviewOnly extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View as="div" margin="small small">
                <Text lineHeight="double">{this.props.t('label.review_only')}</Text>
            </View>
        )
    }
}

export default UfixitReviewOnly