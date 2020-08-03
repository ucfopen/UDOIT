import React from 'react';
import { CheckboxGroup } from '@instructure/ui-elements';
import { Checkbox } from '@instructure/ui-checkbox';

class ScanCheckbox extends React.Component {
  render() {
    return (
      <div>
        <Checkbox label="clickMe" value="medium" defaultChecked/>
      </div>
    )
  }
}

export default ScanCheckbox;