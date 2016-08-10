/*
 * Screen to scan/show qrcode/text code. Goes into various modes with various options depending on if
 * you're a phone/computer and if you're the existing device or the new device
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'
import Render from './index.render'

class CodePage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      enterText: '',
    }
  }

  render () {
    return (
      <Render
        enterText={this.state.enterText}
        onChangeText={enterText => this.setState({enterText})}
        onBack={this.props.onBack}
        mode={this.props.mode}
        textCode={this.props.textCode}
        qrCode={this.props.qrCode}
        myDeviceRole={this.props.myDeviceRole}
        otherDeviceRole={this.props.otherDeviceRole}
        cameraBrokenMode={this.props.cameraBrokenMode}
        setCodePageMode={this.props.setCodePageMode}
        qrScanned={this.props.qrScanned}
        setCameraBrokenMode={this.props.setCameraBrokenMode}
        textEntered={() => this.props.textEntered(this.state.enterText)}
        doneRegistering={this.props.doneRegistering}
      />
    )
  }
}

export default connect(
  (state, ownProps) => ownProps.mapStateToProps(state)
)(CodePage)
