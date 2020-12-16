import React from 'react'
import { Heading } from '@instructure/ui-heading'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { Text } from '@instructure/ui-text'

class AboutPage extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <View as="div" margin="small 0" padding="medium 0">
        <Heading >{this.props.t('about.title')}</Heading>
        <Flex justifyItems="start" alignItems="start">
          <Flex.Item width="50%" padding="0 medium 0 0">
            <Text weight="light" as="p" lineHeight="default">{this.props.t('about.description')}</Text>
          </Flex.Item>
          <Flex.Item width="50%" padding="0 0 0 medium">
            <Text as="strong">{this.props.t('about.disclaimer_title')}</Text>
            <Text as="p" weight="light" lineHeight="default">{this.props.t('about.disclaimer')}</Text>
          </Flex.Item>
        </Flex>
      </View>
    )
  }
}

export default AboutPage