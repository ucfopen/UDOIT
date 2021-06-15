import React from 'react'
import { View } from '@instructure/ui-view'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { InlineList } from '@instructure/ui-list'

class ColorPicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
        detailsOpen: false,
        hover: false
    }

    this.renderColors = this.renderColors.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleMouseEvent = this.handleMouseEvent.bind(this)
  }

  handleChange() {
    this.setState({
        detailsOpen: !this.state.detailsOpen
    })
  }

  render() {
    let topColorList = this.props.colors.slice(0,11)
    let bottomColorList = this.props.colors.slice(11,22)
    return (
        <View as="div" margin="small">
            <ToggleDetails 
            summary={(this.state.detailsOpen) ? this.props.t('label.hide_color_picker') : this.props.t('label.show_color_picker')} 
            expanded={this.state.detailsOpen} 
            onToggle={this.handleChange}>
                <InlineList margin="xx-small"itemSpacing="xx-small">
                    {this.renderColors(topColorList)}
                </InlineList>
                <InlineList margin="xx-small"itemSpacing="xx-small">
                    {this.renderColors(bottomColorList)}
                </InlineList>
            </ToggleDetails>
        </View>
    )
  }

  renderColors(colorList) {
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