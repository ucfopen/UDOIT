import React from 'react';
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Flex } from '@instructure/ui-flex'
import { CloseButton } from '@instructure/ui-buttons'
import AboutPage from './AboutPage'


export default function AboutModal({ t, settings, handleModal }) {
  return (
    <Modal
      open={true}
      size="large"
      label={t('label.about')}>
      <Modal.Header padding="0 medium">
        <Flex>
          <Flex.Item shouldGrow shouldShrink>
            <Heading>{t('label.about')}</Heading>
          </Flex.Item>
          <Flex.Item>
            <CloseButton
              placement="end"
              offset="small"
              screenReaderLabel={t('srlabel.close')}
              onClick={() => handleModal(null)}
            />
          </Flex.Item>
        </Flex>
      </Modal.Header>
      <Modal.Body padding="small medium">
        <AboutPage t={t} settings={settings} />
      </Modal.Body>
    </Modal>
  )
}