import React from 'react';
import Classes from '../../css/ContentPreview.css'
import ReactHtmlParser from 'react-html-parser'

import Html from '../Services/Html'

const MAX_CONTENT_LENGTH = 800

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
        let previewHtml = activeIssue.previewHtml

        if(!previewHtml && !activeIssue.sourceHtml) {
            return '<span>Preview Not Available</span>'
        }

        switch(issueType) {
            // Add custom rules here as a case
            case 'TableHeaderShouldHaveScope':
                previewHtml = this.handleTable(issueHtml)
                break;

            case 'TableDataShouldHaveTableHeader':
                previewHtml = this.handleTable(issueHtml)
                break;

            default:
                let element = this.findCurrentElement(previewHtml, activeIssue.sourceHtml)
                let prev = element.previousElementSibling
                let next = element.nextElementSibling

                if(next === null && prev === null) {
                    previewHtml = this.handleLongText(issueHtml, MAX_CONTENT_LENGTH)
                    return previewHtml
                }

                let parent = Html.toElement(previewHtml)
                parent.innerHTML = ''

                if(prev !== null) {
                    prev = Html.toElement(this.handleLongText(prev.outerHTML, MAX_CONTENT_LENGTH/3))
                    parent.appendChild(prev)
                }
                
                issueHtml = this.handleLongText(issueHtml, MAX_CONTENT_LENGTH/3)
                parent.appendChild(Html.toElement(issueHtml))

                if(next !== null) {
                    next = Html.toElement(this.handleLongText(next.outerHTML, MAX_CONTENT_LENGTH/3))
                    parent.appendChild(next)
                }

                previewHtml = parent.outerHTML
                previewHtml = this.handleLongText(previewHtml, MAX_CONTENT_LENGTH)
                
                break;
        }

        return this.highlightHtml(issueHtml, previewHtml)
    }

    highlightHtml(issueHtml, previewHtml) {
        const highlighted = `<span class="highlighted" style="display:inline-block; border:5px dashed #F1F155;">${issueHtml}</span>`
        try {
            previewHtml = previewHtml.replace(issueHtml, highlighted)
        } catch (error) {
            console.log(error)
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

    handleLongText(issueHtml, maxLen) {
        let element = Html.toElement(issueHtml)

        if(element.innerText.length < maxLen) {
            return issueHtml
        }

        element.innerText = element.innerText.substr(0, maxLen)
        element.innerText = element.innerText.concat(' ...')

        return element.outerHTML
    }

    findCurrentElement(parent, target) {
        if(!target) {
            return Html.toElement(parent)
        }

        if(!parent) {
            return Html.toElement(target)
        }

        parent = Html.toElement(parent)
        
        let children = parent.children
        
        if(children !== undefined) {
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                if(child.outerHTML === target) {
                    return child
                }
            }
        }

        return Html.toElement(target)
    }
}

export default Preview;
