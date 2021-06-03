import React from 'react';
import { View } from '@instructure/ui-view'
import { Text } from '@instructure/ui-text'
import { Flex } from '@instructure/ui-flex'
import { InlineList } from '@instructure/ui-list'

class SummaryBar extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const report = this.props.report
    return (
        <View as="div" margin="none" background="secondary">
        <Flex margin="none none large" justifyItems="space-between" padding="xx-small">
          <Flex.Item margin="x-small">
            <Text weight="bold" size="large">{this.props.t('label.summary')}</Text>
          </Flex.Item>
          <Flex.Item>
            <InlineList>
              <InlineList.Item>
                <Text>
                  <b>{report.errors} </b>
                  {this.props.t('label.plural.error')}
                </Text>
              </InlineList.Item>
              <InlineList.Item>
                <Text>
                  <b>{report.suggestions} </b>
                  {this.props.t('label.plural.suggestion')}
                </Text>
              </InlineList.Item>
              <InlineList.Item>
                <Text>
                  <b>{report.contentFixed} </b>
                  {this.props.t('label.plural.fixed')}
                </Text>
              </InlineList.Item>
              <InlineList.Item>
                <Text>
                  <b>{report.contentResolved} </b>
                  {this.props.t('label.manually_resolved')}
                </Text>
              </InlineList.Item>
              <InlineList.Item>
                <Text>
                  <b>{report.filesReviewed} </b>
                  {this.props.t('label.files_reviewed')}
                </Text>
              </InlineList.Item>
            </InlineList>
          </Flex.Item>
        </Flex>
      </View>
    )
  }
}

export default SummaryBar;