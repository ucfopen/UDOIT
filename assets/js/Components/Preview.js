import React from 'react';
import Classes from '../../css/ContentPreview.scss'
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'
import { View } from '@instructure/ui-view'
import { Pill } from '@instructure/ui-pill'
import { Flex } from '@instructure/ui-flex'
import { CloseButton} from '@instructure/ui-buttons'
import { Text } from '@instructure/ui-text'
import { Link } from '@instructure/ui-link'
import { InlineList } from '@instructure/ui-list'
import { IconExternalLinkLine, IconCheckMarkLine } from '@instructure/ui-icons'
import { CodeEditor } from '@instructure/ui-code-editor'
import { Checkbox } from '@instructure/ui-checkbox'
import { Spinner } from '@instructure/ui-spinner'
import ReactHtmlParser from 'react-html-parser'
import MessageTray from './MessageTray'
import { ToggleDetails } from '@instructure/ui-toggle-details'

import Ufixit from '../Services/Ufixit'
import Api from '../Services/Api'
import Html from '../Services/Html'

import Pretty from 'pretty'

class Preview extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const activeIssue = this.props.activeIssue
        const highlightedHtml = this.highlightHtml(activeIssue)
        const contextHtml = (highlightedHtml) ? ReactHtmlParser(highlightedHtml, { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) }) : 'N/A'
        return(
            <div className={Classes.previewWindow}>
                {contextHtml}
            </div>
        )
    }

    highlightHtml(activeIssue) {
        const html = (activeIssue.newHtml) ? activeIssue.newHtml : Html.toString(Html.toElement(activeIssue.sourceHtml))
        const highlighted = `<span class="highlighted" style="display:inline-block; border:5px dashed #F1F155;">${html}</span>`
    
        return activeIssue.previewHtml ? activeIssue.previewHtml.replace(activeIssue.sourceHtml, highlighted) : '<span>Not Available</span>'
    }
}

export default Preview;