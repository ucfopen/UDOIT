// jadan
import React, { useState, useEffect } from 'react'
import { Heading } from '@instructure/ui-heading'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { Flex } from '@instructure/ui-flex'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import { issueRuleIds } from './Constants'
import * as Html from '../Services/Html'
import ReactHtmlParser from 'react-html-parser'
import Classes from '../../css/theme-overrides.css'

export default function AboutSection({ t, settings }) {
  const [expandDetails, setExpandDetails] = useState(false)
  const [issues, setIssues] = useState({"error": [], "suggestion": []})

  const handleDetailsToggle = () => {
    setExpandDetails(!expandDetails)
  }

  useEffect(() => {
    const suggestionTypes = (settings.suggestionRuleIds != null) ? settings.suggestionRuleIds : ''

    let currentIssues = {
      "error": [],
      "suggestion": []
    }

    issueRuleIds.forEach(issue => {
      if (suggestionTypes.includes(issue)) {
        currentIssues.suggestion.push(issue)
      } else {
        currentIssues.error.push(issue)
      }
    })

    setIssues(currentIssues)
  }, [])

  return (
    <View as="div">
      <Flex>
        <Flex.Item shouldShrink shouldGrow align="start">
          <View as="div">
            <Text as="p" lineHeight="default">
              {ReactHtmlParser(t('about.description'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </Text>
          </View>
          <View as="div" margin="large 0">
            <Text as="strong">{t('about.disclaimer_title')}</Text>
            <Text as="p" weight="normal" lineHeight="default">
              {ReactHtmlParser(t('about.disclaimer'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </Text>
          </View>
        </Flex.Item>
        <Flex.Item size="400px" align="start" padding="small 0 0 large">
          <View as="div">
            {ReactHtmlParser(t('about.video_embed'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
          </View>
          <View as="div" textAlign="center">
            {ReactHtmlParser(t('about.video_link'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
          </View>

          <View as="div" margin="large 0">
            <View as="div">
              <Text as="strong">{t('about.resources')}</Text>
            </View>
            <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
              <View>
                {ReactHtmlParser(t('about.user_guide_link'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
              </View>
            </View>
          </View>

          <View as="div" margin="large 0">
            <View as="div">
              <Text as="strong">{t('about.policies')}</Text>
            </View>
            <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
                {ReactHtmlParser(t('about.youtube_terms'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </View>  
            <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
              {ReactHtmlParser(t('about.google_privacy'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </View>
          </View>
        </Flex.Item>
      </Flex>
      <View as="div" margin="medium 0" display="inline-block" width="100vw">
        <ToggleDetails
          summary={t('label.btn.udoit_details')}
          expanded={expandDetails}
          fluidWidth={true}
          onToggle={handleDetailsToggle}>

          {Object.keys(issues).map((issueType) => {
            const type = issues[issueType]
            return (
              <View as="div" margin="small large" key={issueType}>
                <View padding="x-small" margin="none">
                  <Heading level="h3">
                    {('error' === issueType) ? <IconNoLine className={Classes.error} /> : <IconInfoBorderlessLine className={Classes.suggestion} />}&nbsp;
                    {t(`label.plural.${issueType}`)}
                  </Heading><br />
                </View>
                {type.map((rule) => {
                  let showExample = false
                  if (!t(`rule.example.${rule}`).includes('rule.example')) {
                    showExample = true
                  }
                  return (
                    <ToggleDetails key={rule} summary={
                      <Heading level="h4">
                        {t(`rule.label.${rule}`)}
                      </Heading>}
                    >
                      <View as="div" margin="small 0" background="primary" padding="small" shadow="above">
                        {ReactHtmlParser(t(`rule.desc.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
                        {
                          (showExample) &&
                          <View as="div">{ReactHtmlParser(t(`rule.example.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}</View>
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
        <Text weight="light">{t('label.version')} {settings.versionNumber}</Text>
      </View>
    </View>
  )
}

import React, { useState, useEffect } from 'react'
import { Heading } from '@instructure/ui-heading'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { Flex } from '@instructure/ui-flex'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { IconInfoBorderlessLine, IconNoLine } from '@instructure/ui-icons'
import { issueRuleIds } from './Constants'
import * as Html from '../Services/Html'
import ReactHtmlParser from 'react-html-parser'
import Classes from '../../css/theme-overrides.css'

export default function AboutPage({ t, settings }) {
  const [expandDetails, setExpandDetails] = useState(false)
  const [issues, setIssues] = useState({"error": [], "suggestion": []})

  const handleDetailsToggle = () => {
    setExpandDetails(!expandDetails)
  }

  useEffect(() => {
    const suggestionTypes = (settings.suggestionRuleIds != null) ? settings.suggestionRuleIds : ''

    let currentIssues = {
      "error": [],
      "suggestion": []
    }

    issueRuleIds.forEach(issue => {
      if (suggestionTypes.includes(issue)) {
        currentIssues.suggestion.push(issue)
      } else {
        currentIssues.error.push(issue)
      }
    })

    setIssues(currentIssues)
  }, [])

  return (
    <View as="div">
      <Flex>
        <Flex.Item shouldShrink shouldGrow align="start">
          <View as="div">
            <Text as="p" lineHeight="default">
              {ReactHtmlParser(t('about.description'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </Text>
          </View>
          <View as="div" margin="large 0">
            <Text as="strong">{t('about.disclaimer_title')}</Text>
            <Text as="p" weight="normal" lineHeight="default">
              {ReactHtmlParser(t('about.disclaimer'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </Text>
          </View>
        </Flex.Item>
        <Flex.Item size="400px" align="start" padding="small 0 0 large">
          <View as="div">
            {ReactHtmlParser(t('about.video_embed'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
          </View>
          <View as="div" textAlign="center">
            {ReactHtmlParser(t('about.video_link'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
          </View>

          <View as="div" margin="large 0">
            <View as="div">
              <Text as="strong">{t('about.resources')}</Text>
            </View>
            <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
              <View>
                {ReactHtmlParser(t('about.user_guide_link'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
              </View>
            </View>
          </View>

          <View as="div" margin="large 0">
            <View as="div">
              <Text as="strong">{t('about.policies')}</Text>
            </View>
            <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
                {ReactHtmlParser(t('about.youtube_terms'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </View>  
            <View as="div" position="relative" textAlign="start" insetBlockStart="1vh">
              {ReactHtmlParser(t('about.google_privacy'), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
            </View>
          </View>
        </Flex.Item>
      </Flex>
      <View as="div" margin="medium 0" display="inline-block" width="100vw">
        <ToggleDetails
          summary={t('label.btn.udoit_details')}
          expanded={expandDetails}
          fluidWidth={true}
          onToggle={handleDetailsToggle}>

          {Object.keys(issues).map((issueType) => {
            const type = issues[issueType]
            return (
              <View as="div" margin="small large" key={issueType}>
                <View padding="x-small" margin="none">
                  <Heading level="h3">
                    {('error' === issueType) ? <IconNoLine className={Classes.error} /> : <IconInfoBorderlessLine className={Classes.suggestion} />}&nbsp;
                    {t(`label.plural.${issueType}`)}
                  </Heading><br />
                </View>
                {type.map((rule) => {
                  let showExample = false
                  if (!t(`rule.example.${rule}`).includes('rule.example')) {
                    showExample = true
                  }
                  return (
                    <ToggleDetails key={rule} summary={
                      <Heading level="h4">
                        {t(`rule.label.${rule}`)}
                      </Heading>}
                    >
                      <View as="div" margin="small 0" background="primary" padding="small" shadow="above">
                        {ReactHtmlParser(t(`rule.desc.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}
                        {
                          (showExample) &&
                          <View as="div">{ReactHtmlParser(t(`rule.example.${rule}`), { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, settings) })}</View>
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
        <Text weight="light">{t('label.version')} {settings.versionNumber}</Text>
      </View>
    </View>
  )
}