import React from 'react';
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { CloseButton } from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { InlineList } from '@instructure/ui-list'
import { IconExternalLinkLine, IconCheckMarkLine, IconUploadSolid, IconDownloadLine } from '@instructure/ui-icons'
import { Checkbox } from '@instructure/ui-checkbox'
import { FileDrop } from '@instructure/ui-file-drop'
import MessageTray from './MessageTray';

import Api from '../Services/Api'
import { Spinner } from '@instructure/ui-spinner'

class SettingsModal extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            reports: []
        }
    }

    componentDidMount() {
        if (this.state.reports.length === 0) {

        }
    }

    render() {

    }
}

export default SettingsModal