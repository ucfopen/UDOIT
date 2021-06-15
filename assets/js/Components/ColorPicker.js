import React from 'react'
import { View } from '@instructure/ui-view'
import { ToggleDetails } from '@instructure/ui-toggle-details'
import { ScreenReaderContent } from '@instructure/ui-a11y-content'
import { Link } from '@instructure/ui-link'

class ColorPicker extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
        detailsOpen: false
    }

    this.renderColors = this.renderColors.bind(this)
    this.handleChange = this.handleChange.bind(this)
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
        <View as="div" margin="xx-small">
            <ToggleDetails 
            size="small"
            summary={(this.state.detailsOpen) ? this.props.t('label.hide_color_picker') : this.props.t('label.show_color_picker')} 
            expanded={this.state.detailsOpen} 
            onToggle={this.handleChange}>
                <View as="div" margin="0" padding="0">
                    {this.renderColors(topColorList)}
                </View>
                <View as="div">
                    {this.renderColors(bottomColorList)}
                </View>
            </ToggleDetails>
        </View>
    )
  }

  renderColors(colorList) {
    return colorList.map((color, i) => {
        return (
          <Link key={color} href="#" onClick={(e) => this.props.update('#' + color)}>
            <div style={{ border: '1px solid #DDD', backgroundColor: '#' + color, display: 'inline-block', width: '20px', height: '20px', opacity: 1.0 }}>
              <ScreenReaderContent>{this.props.t('label.hex_color')}: {color}</ScreenReaderContent>
            </div>
          </Link>
    )});
  }
}

export default ColorPicker