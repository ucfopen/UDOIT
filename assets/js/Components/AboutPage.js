import React from 'react'
import { Heading } from '@instructure/ui-heading'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { Text } from '@instructure/ui-text'
import { ToggleDetails } from '@instructure/ui-toggle-details'

class AboutPage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      expandDetails: false
    }

    this.handleDetailsToggle = this.handleDetailsToggle.bind(this)
  }

  render() {
    const rules = [
      'AnchorMustContainText',
      'AnchorLinksToMultiMediaRequireTranscript',
      'AnchorLinksToSoundFilesNeedTranscripts',
      'AnchorMustContainText',
      'AnchorSuspiciousLinkText',
      'BaseFontIsNotUsed',
      'BlinkIsNotUsed',
      'ContentTooLong',
      'CssTextHasContrast',
      'CssTextStyleEmphasize',
      'DocumentReadingDirection',
      'EmbedHasAssociatedNoEmbed',
      'FontIsNotUsed',
      'HeadersHaveText',
      'ImageAltIsDifferent',
      'ImageAltIsTooLong',
      'ImageAltNotEmptyInAnchor',
      'ImageAltNotPlaceholder',
      'ImageGifNoFlicker',
      'ImageHasAlt',
      'ImageHasAltDecorative',
      'ImageHasLongDescription',
      'InputImageNotDecorative',
      'MarqueeIsNotUsed',
      'NoHeadings',
      'ObjectInterfaceIsAccessible',
      'ObjectMustContainText',
      'ObjectShouldHaveLongDescription',
      'ObjectTagDetected',
      'ParagraphNotUsedAsHeader',
      'PreShouldNotBeUsedForTabularValues',
      'TableDataShouldHaveTableHeader',
      'TableHeaderShouldHaveScope',
      'VideoCaptionsMatchCourseLanguage',
      'VideoEmbedCheck',
      'VideoProvidesCaptions',
      'VideosEmbeddedOrLinkedNeedCaptions',
    ]

    return (
      <View as="div" margin="small 0" padding="medium 0">
        <Heading level="h3">{this.props.t('about.title')}</Heading>
        <Flex justifyItems="start" alignItems="start">
          <Flex.Item width="50%" padding="0 medium 0 0">
            <Text weight="light" as="p" lineHeight="default">{this.props.t('about.description')}</Text>
          </Flex.Item>
          <Flex.Item width="50%" padding="0 0 0 medium">
            <Text as="strong">{this.props.t('about.disclaimer_title')}</Text>
            <Text as="p" weight="light" lineHeight="default">{this.props.t('about.disclaimer')}</Text>
          </Flex.Item>
        </Flex>
        <View as="div" margin="medium 0">
          <ToggleDetails
            summary={this.props.t('label.btn.udoit_details')}
            expanded={this.state.expandDetails}
            fluidWidth={true}
            onToggle={this.handleDetailsToggle}>
            <View as="div" margin="small 0">
              {rules.map((rule) => {
                return (
                  <View as="div" margin="small 0" background="primary" padding="small" shadow="above">
                    <Heading level="h4">{this.props.t(`rule.label.${rule}`)}</Heading>
                    <Text as="p">{this.props.t(`rule.desc.${rule}`)}</Text>
                  </View>
                )
              })}
            </View>
          </ToggleDetails>
        </View>
      </View>
    )
  }

  handleDetailsToggle() {
    this.setState({expandDetails: !this.state.expandDetails})
  }
}

export default AboutPage