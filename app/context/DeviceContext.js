import React, { createContext } from 'react'
/* TBD - I tried this but it doesn't work. Probably because I'm in Expo environment.
So this context isn't used currently.  I could remove the library and remove this file.*/
import DeviceTimeFormat from 'react-native-device-time-format'

import * as logger from '../utils/logger'


// This created with defaults.  The provider sets the real values using value prop.
const DeviceContext = createContext({
  is24HourFormat: false,
});

/**
 * Provides a way to see attributes about the device.
 */
export class DeviceProvider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      is24HourFormat: false,
    };
  }

  async componentDidMount() {

    try {
      const using24HourFormat = await DeviceTimeFormat.is24HourFormat();
      this.setState({ is24HourFormat: using24HourFormat });
    } catch (e) {
      logger.log("Error from getting device info: ", e);
    }
  }


  render() {
    return (
      <DeviceContext.Provider value={{
        ...this.state,
      }}>
        {this.props.children}
      </DeviceContext.Provider>
    );
  }
}

/** 
 * A HOC to add deviceContext as a prop
 */
export const withDeviceContext = ChildComponent => props => (
  <DeviceContext.Consumer>
    {
      context => <ChildComponent {...props} deviceContext={context} />
    }
  </DeviceContext.Consumer>
);
