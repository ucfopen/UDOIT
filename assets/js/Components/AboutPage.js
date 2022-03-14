import React from 'react'
import { Heading } from '@instructure/ui-heading'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { Flex } from '@instructure/ui-flex'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import { issueRuleIds } from './Constants'
import Html from '../Services/Html'
import ReactHtmlParser from 'react-html-parser'
import Classes from '../../css/theme-overrides.css'

class AboutPage extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      expandDetails: false
    }

    this.handleDetailsToggle = this.handleDetailsToggle.bind(this)
  }

  handleDetailsToggle() {
    this.setState({ expandDetails: !this.state.expandDetails })
  }

  render() {
    const suggestionTypes = (this.props.settings.suggestionRuleIds != null) ? this.props.settings.suggestionRuleIds : ''
    this.issues = {
      "error": [],
      "suggestion": []
    }

    issueRuleIds.forEach(issue => {
      if (suggestionTypes.includes(issue)) {
        this.issues.suggestion.push(issue)
      } else {
        this.issues.error.push(issue)
      }
    })

    return (
      <View as="div">
        <Flex>
          <Flex.Item shouldShrink shouldGrow align="start">
            <View as="div">
              <Text as="p" lineHeight="default">
                {ReactHtmlParser(this.props.t('about.description'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
              </Text>
            </View>
            <View as="div" margin="large 0">
              <Text as="strong">{this.props.t('about.disclaimer_title')}</Text>
              <Text as="p" weight="normal" lineHeight="default">
                {ReactHtmlParser(this.props.t('about.disclaimer'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
              </Text>
            </View>
          </Flex.Item>
          <Flex.Item size="400px" align="start" padding="small 0 0 large">
            <View as="div">
              {ReactHtmlParser(this.props.t('about.video_embed'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
            </View>
            <View as="div" textAlign="center">
              {ReactHtmlParser(this.props.t('about.video_link'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
            </View>

            <View as="div" margin="large 0">
              <View as="div">
                <Text as="strong">{this.props.t('about.resources')}</Text>
              </View>
              <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
                <View>
                  {ReactHtmlParser(this.props.t('about.user_guide_link'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
                </View>
              </View>
            </View>

            <View as="div" margin="large 0">
              <View as="div">
                <Text as="strong">{this.props.t('about.policies')}</Text>
              </View>
              <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
                  {ReactHtmlParser(this.props.t('about.youtube_terms'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
              </View>  
              <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
                {ReactHtmlParser(this.props.t('about.google_privacy'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
              </View>
            </View>
          </Flex.Item>
        </Flex>
        <View as="div" margin="medium 0" display="inline-block" width="100vw">
          <ToggleDetails
            summary={this.props.t('label.btn.udoit_details')}
            expanded={this.state.expandDetails}
            fluidWidth={true}
            onToggle={this.handleDetailsToggle}>

            {Object.keys(this.issues).map((issueType) => {
              const type = this.issues[issueType]
              return (
                <View as="div" margin="small large" key={issueType}>
                  <View padding="x-small" margin="none">
                    <Heading level="h3">
                      {('error' === issueType) ? <IconNoLine className={Classes.error} /> : <IconInfoBorderlessLine className={Classes.suggestion} />}&nbsp;
                      {this.props.t(`label.plural.${issueType}`)}
                    </Heading><br />
                  </View>
                  {type.map((rule) => {
                    if (!this.props.t(`rule.example.${rule}`).includes('rule.example')) {
                      var showExample = true
                    }
                    return (
                      <ToggleDetails key={rule} summary={
                        <Heading level="h4">
                          {this.props.t(`rule.label.${rule}`)}
                        </Heading>}
                      >
                        <View as="div" margin="small 0" background="primary" padding="small" shadow="above">
                          {ReactHtmlParser(this.props.t(`rule.desc.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}
                          {
                            (showExample) &&
                            <View as="div">{ReactHtmlParser(this.props.t(`rule.example.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })}</View>
                          }
                        </View>
                      </ToggleDetails>
                    )
                  })}
                </View>
              )
            })}
          </ToggleDetails>
        </View>
        <View as="div" textAlign="end">
          <Text weight="light">{this.props.t('label.version')} {this.props.settings.versionNumber}</Text>
        </View>
      </View>
    )
  }
}

export default AboutPage
