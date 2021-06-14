import React from 'react'
import { View } from '@instructure/ui-view'
import { Flex } from '@instructure/ui-flex'
import { Text } from '@instructure/ui-text'
import { Heading } from '@instructure/ui-heading'
import { IconDownloadLine } from '@instructure/ui-icons'
import { InlineList } from '@instructure/ui-list'

class ColorPicker extends React.Component {
  constructor(props) {
    super(props)

    this.renderColors = this.renderColors.bind(this)
  }

  render() {
    return (
        <View as="div" margin="medium">
            <InlineList>
                {this.renderColors()}
            </InlineList>
        </View>
    )
  }

  renderColors() {
    let colorList = this.props.colors
    
    return colorList.map((color, i) => {
        return (
            <InlineList.Item key={i}>
                <div 
                    onClick={(e) => this.props.update('#' + color)}
                    style={{ boxShadow: '0 0 5px 0 #CCC', backgroundColor: '#' + color, width: '20px', height: '20px', opacity: 1.0 }}>
                </div>
            </InlineList.Item>
    )});
  }
}

export default ColorPicker