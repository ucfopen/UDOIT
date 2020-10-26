import React from 'react';
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
        size="large">
          <Modal.Header>
              <Heading>Review Issue</Heading>

              <p>Issue {this.props.index} of {this.props.totalCount} | Status = {this.props.activeIssue.status === false ? 'Unreviewed' : 'Reviewed'}</p>
          </Modal.Header>

          <Modal.Body>
              {this.props.ufixitService.returnIssueForm(this.props.activeIssue)}
          </Modal.Body>

          <Modal.Footer>
            <Button color="alert">Close</Button>
            <Button>Previous Issue</Button>
            <Button>Next Issue</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default UfixitModal;