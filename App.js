import React, { useState, useContext } from 'react'
import { AppLoading } from 'expo'
import * as Font from 'expo-font'
import { MenuProvider } from 'react-native-popup-menu'
import { Ionicons } from '@expo/vector-icons'
import { AppearanceProvider, useColorScheme } from 'react-native-appearance'

import { EventsAndMilestonesContextProvider } from './app/context/EventsAndMilestonesContext'
import AppSettingsContext, { AppSettingsContextProvider } from './app/context/AppSettingsContext'
import CalendarContext, { CalendarProvider } from './app/context/CalendarContext'
import { MyThemeProvider } from './app/context/MyThemeContext'
import AppBottomTabNavigator from './app/navigation/AppBottomTabNavigator'
import MyText from './app/components/MyText'

// Before rendering any navigation stack, to optimize memory usage and performance
import { enableScreens } from 'react-native-screens';
enableScreens();

// TBD - use for optimization
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


/* TBD - need to add crash reporting and aggregation via sentry.
See https://docs.expo.io/versions/latest/guides/using-sentry/ 

Still need to add error boundaries too.
*/

/* Don't render this stuff until the AppSettingsContext has done its initial load */
const InnerApp = (props) => {

  const appSettingsContext = useContext(AppSettingsContext);
  const calendarContext = useContext(CalendarContext);
  // Have these loaded and ready first so colors don't switch right after it opens.

  if (appSettingsContext.isInitialSettingsLoaded && calendarContext.isCalendarReady) {
    return <EventsAndMilestonesContextProvider ><MenuProvider><AppBottomTabNavigator /></MenuProvider></EventsAndMilestonesContextProvider>
  } else {
    return null;
  }
}

export default (props) => {

  /* AppLoading tells Expo to keep the app loading screen open (splash screen). But only if it's the first and only component in your app. 
  I thought it'd be nice to have the splash screen until the theme is ready, but I'm using contexts and I use them to get stuff ready.
  I need the provider components. */

  return (<AppearanceProvider><AppSettingsContextProvider><MyThemeProvider><CalendarProvider>
    <InnerApp />
  </CalendarProvider></MyThemeProvider></AppSettingsContextProvider></AppearanceProvider>);

}
