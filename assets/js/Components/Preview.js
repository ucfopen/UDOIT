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
        const previewHtml = this.preparePreview(activeIssue)
        const contextHtml = ReactHtmlParser(previewHtml, { preprocessNodes: (nodes) => Html.processStaticHtml(nodes, this.props.settings) })
        return(
            <div className={Classes.previewWindow}>
                {contextHtml}
            </div>
        )
    }

    preparePreview(activeIssue) {
        let issueType = activeIssue.scanRuleId
        let issueHtml = Html.getIssueHtml(activeIssue)
        let previewHtml = null

        switch(issueType) {
            case 'ContentTooLong':
                previewHtml = this.handleLongText(issueHtml)
                break;

            case 'TableHeaderShouldHaveScope':
                previewHtml = this.handleTable(issueHtml)
                break;

            default:
                previewHtml = this.highlightHtml(activeIssue, activeIssue.previewHtml)
                break;
        }

        return previewHtml
    }

    highlightHtml(activeIssue, previewHtml) {
        const html = (activeIssue.newHtml) ? activeIssue.newHtml : Html.toString(Html.toElement(activeIssue.sourceHtml))
        const highlighted = `<span class="highlighted" style="display:inline-block; border:5px dashed #F1F155;">${html}</span>`
    
        return previewHtml ? previewHtml.replace(activeIssue.sourceHtml, highlighted) : '<span>Not Available</span>'
    }

    handleTable(issueHtml) {
        let table = Html.toElement(issueHtml)
        let newTable = document.createElement('table')

        for(let rowInd = 0; rowInd < table.rows.length; rowInd++) {
            if(rowInd > 4) {
                return newTable.outerHTML
            }

            let row = table.rows[rowInd]
            let newRow = newTable.insertRow()

            for(let cellInd = 0; cellInd < row.cells.length; cellInd++) {
                if(cellInd > 3) {
                    break;
                }

                let cell = row.cells[cellInd]
                let newCell = Html.toElement(cell.outerHTML)
                
                newRow.appendChild(newCell)
            }
        }

        console.log(newTable.outerHTML)
        return newTable.outerHTML
    }

    handleLongText(issueHtml) {
        let element = Html.toElement(issueHtml)
        element.innerText = element.innerText.substr(0, 300)
        element.innerText.concat('...')

        return element.outerHTML
    }
}

export default Preview;