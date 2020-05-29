import React from 'react'
import { AppLoading } from 'expo'
import * as Font from 'expo-font'
import { MenuProvider } from 'react-native-popup-menu'
import { Ionicons } from '@expo/vector-icons'

import { EventsAndMilestonesContextProvider } from './app/context/EventsAndMilestonesContext'
import { AppSettingsContextProvider } from './app/context/AppSettingsContext'
import { CalendarProvider } from './app/context/CalendarContext'

// Before rendering any navigation stack, to optimize memory usage and performance
import { enableScreens } from 'react-native-screens';
enableScreens();

// jmr - for optimization
// if (process.env.NODE_ENV === 'development') {
//   console.warn("Using whydidyourender");
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React, {
//     trackAllPureComponents: true,
//   });
// }

if (process.env.NODE_ENV !== 'development') {
  // get rid of console.log if not in dev
  console.log = () => { };
}


import AppStackNavigator from './app/navigation/AppStackNavigator'

/* jmr - need to add crash reporting and aggregation via sentry.
See https://docs.expo.io/versions/latest/guides/using-sentry/ */

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
    };
  }

  async componentDidMount() {
    // Some fonts used in native-base components need to be pre-loaded
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });
    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }
    return <CalendarProvider><AppSettingsContextProvider><EventsAndMilestonesContextProvider ><MenuProvider><AppStackNavigator /></MenuProvider></EventsAndMilestonesContextProvider></AppSettingsContextProvider></CalendarProvider>
  }
}
