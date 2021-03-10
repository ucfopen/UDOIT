import React from 'react'
import { Heading } from '@instructure/ui-heading'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { Text } from '@instructure/ui-text'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { List } from '@instructure/ui-list'
import Html from '../Services/Html'
import ReactHtmlParser from 'react-html-parser'

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
class AboutPage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      expandDetails: false
    }

    this.handleDetailsToggle = this.handleDetailsToggle.bind(this)
  }

  render() {
    const translations = this.props.t('translations')
    const errors = translations.look_for.header.errors
    const suggestions = translations.look_for.header.suggestions

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
        <View as="div" margin="medium 0" display="inline-block">
          <ToggleDetails
            summary={this.props.t('label.btn.udoit_details')}
            expanded={this.state.expandDetails}
            fluidWidth={true}
            onToggle={this.handleDetailsToggle}>
            <View as="div" margin="small 0">
            <Text color="danger" weight="bold">{this.props.t('label.plural.error')}</Text><br/>
              {errors.map((rule) => {
                return (
                  <ToggleDetails key={rule.error} summary={rule.error}>
                    <View as="div" margin="small 0" background="primary" padding="small" shadow="above">
                      <Heading level="h4">{rule.error}</Heading>
                      <Text as="p">{ReactHtmlParser(rule.description)}</Text>
                      {rule.resources &&
                      <List>
                        {rule.resources.map((resource) => {
                          return (
                            <List.Item key={resource}>
                              {ReactHtmlParser(Html.prepareLink(resource).outerHTML)}
                            </List.Item>
                          )
                        })}
                      </List>}

                      {rule.incorrect && 
                      <View>
                        <Text color="danger" weight="bold">
                        {translations.look_for.header.incorrect}:
                      </Text> 
                      <List>
                        {rule.incorrect.map((example) => {
                          return (
                            <List.Item key={example}>
                              {example}
                            </List.Item>
                          )
                        })}
                      </List>
                      </View>}

                      {rule.correct && 
                      <View>
                        <Text color="success" weight="bold">
                        {translations.look_for.header.correct}:
                      </Text> 
                      <List>
                        {rule.correct.map((example) => {
                          return (
                            <List.Item key={example}>
                              {example}
                            </List.Item>
                          )
                        })}
                      </List>
                      </View>}
                    </View>
                  </ToggleDetails>
                )
              })}
            </View>
            <View as="div" margin="small 0">
            <Text color="brand" weight="bold">{this.props.t('label.plural.suggestion')}</Text><br/>
              {suggestions.map((rule) => {
                return (
                  <ToggleDetails key={rule.error} summary={rule.suggestion}>
                    <View as="div" margin="small 0" background="primary" padding="small" shadow="above">
                      <Heading level="h4">{rule.suggestion}</Heading>
                      <Text as="p">{ReactHtmlParser(rule.description)}</Text>

                      {rule.resources &&
                      <List>
                        {rule.resources.map((resource) => {
                          return (
                            <List.Item key={resource}>
                              {ReactHtmlParser(Html.prepareLink(resource).outerHTML)}
                            </List.Item>
                          )
                        })}
                      </List>}

                      {rule.incorrect && 
                      <View>
                        <Text color="danger" weight="bold">
                        {this.props.t('label.incorrect')}:
                      </Text> 
                      <List>
                        {rule.incorrect.map((example) => {
                          return (
                            <List.Item key={example}>
                              {example}
                            </List.Item>
                          )
                        })}
                      </List>
                      </View>}

                      {rule.correct && 
                      <View>
                        <Text color="success" weight="bold">
                        {this.props.t('label.correct')}:
                      </Text> 
                      <List>
                        {rule.correct.map((example) => {
                          return (
                            <List.Item key={example}>
                              {example}
                            </List.Item>
                          )
                        })}
                      </List>
                      </View>}
                    </View>
                  </ToggleDetails>
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