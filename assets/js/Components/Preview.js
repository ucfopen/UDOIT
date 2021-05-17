import React from 'react';
import Classes from '../../css/ContentPreview.scss'
import ReactHtmlParser from 'react-html-parser'

import Html from '../Services/Html'

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
        let previewHtml = issueHtml

        if(issueHtml.length > 3000 || activeIssue.previewHtml.length > 3000) {
            console.log("hello")
            previewHtml = this.handleLongText(issueHtml)
            return previewHtml
        }

        switch(issueType) {
            case 'TableHeaderShouldHaveScope':
                previewHtml = this.handleTable(issueHtml)
                break;

            case 'TableDataShouldHaveTableHeader':
                previewHtml = this.handleTable(issueHtml)
                break;

            default:
                break;
        }

        return this.highlightHtml(activeIssue, previewHtml)
    }

    highlightHtml(activeIssue, html) {
        // const html = (activeIssue.newHtml) ? activeIssue.newHtml : Html.toString(Html.toElement(activeIssue.sourceHtml))
        const highlighted = `<span class="highlighted" style="display:inline-block; border:5px dashed #F1F155;">${html}</span>`
        let previewHtml 

        try {
            previewHtml = activeIssue.previewHtml.replace(activeIssue.sourceHtml, highlighted)
        } catch (error) {
            previewHtml = html
        }
    
        return previewHtml
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