import React from 'react'
import { TextInput } from '@instructure/ui-text-input'
import { Flex } from '@instructure/ui-flex'
import { Button } from '@instructure/ui-buttons'

export default class Ufixit {

    constructor() {
        
    }

    returnIssueForm(activeIssue) {
        switch(activeIssue.scanRuleId){
            case 'aTagHasNoLink':
                return <AnchorTagHasNoLinkView activeIssue={activeIssue}></AnchorTagHasNoLinkView>
        }
    }
}

const AnchorTagHasNoLinkView = (props) => {
    return(
        <div>
            <p><b>Empty HTML Link</b></p>
                <p>Anchor tags must link to something</p>

                <Flex padding="large">
                <Flex.Item padding="large">
                    <p><b>Enter link for anchor tag</b></p>

                    <TextInput></TextInput>
                    <br></br>
                    <br></br>
                    <Button>Save Changes</Button>
                </Flex.Item>

                <Flex.Item padding="large">
                    <p><b>Source</b></p>
                    <p><i>Overview: Rich Content Editor Tools</i></p>

                    <p><b>Preview</b></p>
                    <code>{props.activeIssue.sourceHtml}</code>
                    <p>Line 32: {props.activeIssue.sourceHtml}</p>
                </Flex.Item>
                </Flex>
        </div>
    );
}