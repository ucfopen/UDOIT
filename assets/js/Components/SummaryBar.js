import React from 'react'
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { Flex } from '@instructure/ui-flex'
import { InlineList } from '@instructure/ui-list'

export default function SummaryBar({ t, report }) {

  return (
    <View as="div" margin="0 0 medium 0" background="secondary">
      <Flex margin="0" justifyItems="space-between" padding="x-small">
        <Flex.Item>
          {/* <Text weight="bold" size="small">{t('label.summary')}</Text> */}
        </Flex.Item>
        <Flex.Item>
          <InlineList>
            <InlineList.Item>
              <Text size="small">
                <b>{report.errors} </b>
                {t('label.plural.error')}
              </Text>
            </InlineList.Item>
            <InlineList.Item>
              <Text size="small">
                <b>{report.suggestions} </b>
                {t('label.plural.suggestion')}
              </Text>
            </InlineList.Item>
            <InlineList.Item>
              <Text size="small">
                <b>{report.contentFixed} </b>
                {t('label.plural.fixed')}
              </Text>
            </InlineList.Item>
            <InlineList.Item>
              <Text size="small">
                <b>{report.contentResolved} </b>
                {t('label.manually_resolved')}
              </Text>
            </InlineList.Item>
            <InlineList.Item>
              <Text size="small">
                <b>{report.filesReviewed} </b>
                {t('label.files_reviewed')}
              </Text>
            </InlineList.Item>
          </InlineList>
        </Flex.Item>
      </Flex>
    </View>
  )
}