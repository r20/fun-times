import React, { useState, useContext } from 'react'
import { AppLoading } from 'expo'
import * as Font from 'expo-font'
import { MenuProvider } from 'react-native-popup-menu'
import { Ionicons } from '@expo/vector-icons'
import { AppearanceProvider, useColorScheme } from 'react-native-appearance'

import { EventsAndMilestonesContextProvider } from './app/context/EventsAndMilestonesContext'
import AppSettingsContext, { AppSettingsContextProvider } from './app/context/AppSettingsContext'
import { CalendarProvider } from './app/context/CalendarContext'
import { MyThemeProvider } from './app/context/MyThemeContext'
import AppBottomTabNavigator from './app/navigation/AppBottomTabNavigator'
import MyText from './app/components/MyText'

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


/* jmr - need to add crash reporting and aggregation via sentry.
See https://docs.expo.io/versions/latest/guides/using-sentry/ */

/* Don't render this stuff until the AppSettingsContext has done its initial load */
const InnerApp = (props) => {

  const appSettingsContext = useContext(AppSettingsContext);

  if (appSettingsContext.isInitialSettingsLoaded) {
    return <MyThemeProvider><CalendarProvider><EventsAndMilestonesContextProvider ><MenuProvider><AppBottomTabNavigator /></MenuProvider></EventsAndMilestonesContextProvider></CalendarProvider></MyThemeProvider>
  } else {
    // jmr - I should change to have splash screen or loading or something
    return null;
  }
}

export default (props) => {

  // jmr- I don't think this was doing anything.  It was await and the function was async and that had problems. (it was class component before that)
  // const [isReady, setIsReady] = useState(false);

  // if (!isReady) {
  //    Font.loadAsync({
  //     Roboto: require('native-base/Fonts/Roboto.ttf'),
  //     Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
  //     ...Ionicons.font,
  //   });
  //   setIsReady(true);
  // }

  // if (!isReady) {
  //   return (<AppLoading />);
  // }
  return (<AppearanceProvider><AppSettingsContextProvider>
    <InnerApp />
  </AppSettingsContextProvider></AppearanceProvider>);

}
