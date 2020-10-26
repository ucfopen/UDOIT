import React from 'react'
import { TextInput } from '@instructure/ui-text-input'
import { Flex } from '@instructure/ui-flex'
import { Button } from '@instructure/ui-buttons'
import { TextArea } from '@instructure/ui-text-area'

export default class Ufixit {

    constructor() {
        
    }

    returnIssueForm(activeIssue) {
        switch(activeIssue.scanRuleId){
            case 'aTagHasNoLink':
                return <AnchorTagHasNoLinkView activeIssue={activeIssue}></AnchorTagHasNoLinkView>
            case 'altTextNotFileName':
                return <AltTextShouldNotBeFileName activeIssue={activeIssue}></AltTextShouldNotBeFileName>
            case 'videoProvidesCaptions':
                return <VideoProvidesCaptions activeIssue={activeIssue}></VideoProvidesCaptions>
        }
    }
}

const AltTextShouldNotBeFileName= (props) => {
    return(
        <div>
            <p><b>Alternative text should not be the image filename</b></p>
                <p>Alternative Text (Alt Text) is an alternative (non-visual) way to describe the meaning of an image. Please provide a brief (under 100 characters) description of the image for a screen reader user. Note: It should not be the image file name.</p>

                <Flex padding="large" alignItems="center">
                <Flex.Item padding="large">
                    <p><b>Alternative text</b></p>

                    <TextArea></TextArea>
                    <br></br>
                    <br></br>
                    <Button color="primary">Save Changes</Button>
                </Flex.Item>

                <Flex.Item padding="large">
                    <p><b>Source</b></p>
                    <p><i>Assignment, High Steppin’, img_2406.jpg</i></p>

                    <p><b>Preview</b></p>
                    <code>{props.activeIssue.sourceHtml}</code>
                    <br></br>
                    <a href="">View source code</a>
                </Flex.Item>
                </Flex>
        </div>
    );
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
                    <Button color="primary">Save Changes</Button>
                </Flex.Item>

                <Flex.Item padding="large">
                    <p><b>Source</b></p>
                    <p><i>Overview: Rich Content Editor Tools</i></p>

                    <p><b>Preview</b></p>
                    <code>{props.activeIssue.sourceHtml}</code>
                    <p>Line 32: &lt;href=""&gt;Learn More About the Rich Content Editor&gt;</p>
                </Flex.Item>
                </Flex>
        </div>
    );
}

const VideoProvidesCaptions = (props) => {
    return(
        <div>
            <p><b>Video Provides Captions</b></p>
                <p>Video content must provide captions</p>

                <Flex padding="large" direction="row">

                <Flex.Item padding="large">
                    <p><b>Source</b></p>
                    <p><i>Overview: Rich Content Editor Tools</i></p>

                    <p><b>Preview</b></p>
                    <code>{props.activeIssue.sourceHtml}</code>
                </Flex.Item>

                <Flex.Item padding="large">
                    <p><b>Mark Issue As Reviewed</b></p>
                    <br></br>
                    <br></br>
                    <Button color="primary">Mark As Reviewed</Button>
                </Flex.Item>
                </Flex>
        </div>
    );
}