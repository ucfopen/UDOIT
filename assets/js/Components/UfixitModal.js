import React from 'react';
import Ufixit from '../Services/UFIXIT'
import { Modal } from '@instructure/ui-modal'
import { Heading } from '@instructure/ui-heading'
import { Button } from '@instructure/ui-buttons'

class UfixitModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      
    }

  }
  
  render() {
    return (
      <div>
        <Modal
        open="true"
        size="auto">
          <Modal.Header>
              <Heading>Review Issue</Heading>

              <p>Issue {this.props.index} of {this.props.totalCount} | Status = {this.props.activeIssue.status}</p>
          </Modal.Header>

          <Modal.Body>
              {this.props.ufixitService.returnIssueForm(this.props.activeIssue)}
          </Modal.Body>

          <Modal.Footer>
            <Button>Close</Button>
            <Button>Previous Issue</Button>
            <Button>Next Issue</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default UfixitModal;