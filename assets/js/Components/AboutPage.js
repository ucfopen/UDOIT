import React from 'react'
import { Heading } from '@instructure/ui-heading'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { List } from '@instructure/ui-list'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import Html from '../Services/Html'
import ReactHtmlParser from 'react-html-parser'

const issueRuleIds = [
  "AnchorLinksToMultiMediaRequireTranscript",
  "AnchorLinksToSoundFilesNeedTranscripts",
  "AnchorMustContainText",
  "AnchorSuspiciousLinkText",
  "BaseFontIsNotUsed",
  "BlinkIsNotUsed",
  "ContentTooLong",
  "CssTextHasContrast",
  "CssTextStyleEmphasize",
  "DocumentReadingDirection",
  "EmbedHasAssociatedNoEmbed",
  "FontIsNotUsed",
  "HeadersHaveText",
  "ImageAltIsDifferent",
  "ImageAltIsTooLong",
  "ImageAltNotEmptyInAnchor",
  "ImageAltNotPlaceholder",
  "ImageHasAlt",
  "ImageHasAltDecorative",
  "ImageHasLongDescription",
  "InputImageNotDecorative",
  "MarqueeIsNotUsed",
  "NoHeadings",
  "ObjectInterfaceIsAccessible",
  "ObjectMustContainText",
  "ObjectShouldHaveLongDescription",
  "ObjectTagDetected",
  "ParagraphNotUsedAsHeader",
  "PreShouldNotBeUsedForTabularValues",
  "TableDataShouldHaveTableHeader",
  "TableHeaderShouldHaveScope",
  "VideoCaptionsMatchCourseLanguage",
  "VideoEmbedCheck",
  "VideoProvidesCaptions",
  "VideosEmbeddedOrLinkedNeedCaptions"
]

class AboutPage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      expandDetails: false
    }

    this.handleDetailsToggle = this.handleDetailsToggle.bind(this)
  }

  handleDetailsToggle() {
    this.setState({expandDetails: !this.state.expandDetails})
  }

  render() {
    const suggestionTypes = (this.props.settings.suggestionRuleIds != null) ? this.props.settings.suggestionRuleIds : ''
    this.issues = {
      "error": [],
      "suggestion": []
    }

    issueRuleIds.forEach(issue => {
      if(suggestionTypes.includes(issue)){
        this.issues.suggestion.push(issue)
      } else {
        this.issues.error.push(issue)
      }
    })

    return (
      <View as="div">
        <View as="div">
          <Text as="p" lineHeight="default">{this.props.t('about.description')}</Text>
        </View>
        <View as="div" margin="large 0">
          <Text as="strong">{this.props.t('about.disclaimer_title')}</Text>
          <Text as="p" weight="normal" lineHeight="default">{this.props.t('about.disclaimer')}</Text>
        </View>
        <View as="div" margin="medium 0" display="inline-block">
          <ToggleDetails
            summary={this.props.t('label.btn.udoit_details')}
            expanded={this.state.expandDetails}
            fluidWidth={true}
            onToggle={this.handleDetailsToggle}>

            {Object.keys(this.issues).map((issueType) => {
              const type = this.issues[issueType]
              return (
                <View as="div" margin="small large">
                  {('error' === issueType ) ? <IconNoLine color="error" /> : <IconInfoBorderlessLine color="alert" />}
                  <View padding="x-small"><Text weight="bold">{this.props.t(`label.plural.${issueType}`)}</Text><br/></View>
                  {type.map((rule) => {
                    return (
                      <ToggleDetails key={rule} summary={this.props.t(`rule.label.${rule}`)}>
                        <View as="div" margin="small 0" background="primary" padding="small" shadow="above">
                          <Heading level="h4">{this.props.t(`rule.label.${rule}`)}</Heading>
                          <Text as="p">{ReactHtmlParser(this.props.t(`rule.desc.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}</Text>
                          <Text as="p">{ReactHtmlParser(this.props.t(`rule.example.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}</Text>
                        </View>
                      </ToggleDetails>
                    )
                  })}
            
                </View>
              )
            })} 
          </ToggleDetails>
        </View>
        
      </View>
    )
  }
}

export default AboutPage