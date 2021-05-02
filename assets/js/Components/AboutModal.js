import React from 'react';
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { CloseButton } from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import AboutPage from './AboutPage'


class AboutModal extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Modal
        open={true}
        size="large"
        label={this.props.t('label.about')}>
        <Modal.Header padding="0 medium">
          <Flex>
            <Flex.Item shouldGrow shouldShrink>
              <Heading>{this.props.t('label.about')}</Heading>
            </Flex.Item>
            <Flex.Item>
              <CloseButton
                placement="end"
                offset="small"
                screenReaderLabel={this.props.t('srlabel.close')}
                onClick={() => this.props.handleModal(null)}
              />
            </Flex.Item>
          </Flex>
        </Modal.Header>
        <Modal.Body padding="small medium">
          <AboutPage t={this.props.t} settings={this.props.settings} />
        </Modal.Body>
      </Modal>
    )
  }
}

export default AboutModal