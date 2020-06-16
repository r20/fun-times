import React, { createContext, useContext } from 'react'
import { DefaultTheme } from '@react-navigation/native'

import * as logger from '../utils/logger'
import AppSettingsContext from './AppSettingsContext';
import { useColorScheme } from 'react-native-appearance';


const FONT_SIZE_SMALL = 10;
const FONT_SIZE_MEDIUM = 12;
const FONT_SIZE_LARGE = 14;
const FONT_SIZE_XLARGE = 20;


/** 
 * The event colors to chose from 
 */
export const colors = ["#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E", "#607D8B"];

/**
 * Return a random color from the event colors
 */
export const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)];
}

const lightThemeText = '#444444'; // darker gray
const lightThemeColors = {
  ...DefaultTheme.colors,
  primary: '#2196F3', // blue 
  text: lightThemeText,
  background: '#ffffff',
  card: '#ffffff', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#ffffff', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: getContrastFontColor('#2196F3'),
  unselected: '#c3c3c3', // light gray
  tabBorder: '#c3c3c3', // light gray
  calendar: '#A5F2F3', // A light blueish
  calendarContrast: getContrastFontColor('#A5F2F3'),
}

const darkThemeText = '#dfdfdf'; // lighter gray
const darkThemeColors = {
  ...DefaultTheme.colors,
  primary: '#2196F3', // blue 
  text: darkThemeText,
  background: '#000000',
  card: '#000000', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#000000', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: getContrastFontColor('#2196F3'),
  unselected: '#444444', // darker gray
  tabBorder: '#444444', // darker gray
  calendar: '#A5F2F3', // A light blueish
  calendarContrast: getContrastFontColor('#A5F2F3'),
}

/** 
 * Return the color that works best (light or dark)
 * to use for contrasting with the input hexcolor.
 */
export function getContrastFontColor(hexcolor) {
  var r = parseInt(hexcolor.substring(1, 3), 16);
  var g = parseInt(hexcolor.substring(3, 5), 16);
  var b = parseInt(hexcolor.substring(5, 7), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? lightThemeText : '#ffffff'; // This, because white looks better than darkThemeText if hexcolor is not black (and not wanting to bother checking if black)
};


// This created with defaults.  The provider sets the real values using value prop.
const MyThemeContext = createContext({
  myReactNavigationBasedTheme: DefaultTheme,
  colors: DefaultTheme.colors,
  FONT_SIZE_SMALL: FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM: FONT_SIZE_MEDIUM,
  FONT_SIZE_LARGE: FONT_SIZE_LARGE,
  FONT_SIZE_XLARGE: FONT_SIZE_XLARGE,
});


/**
 * Provides a way to see attributes about the device.
 */
export const MyThemeProvider = (props) => {

  const isColorSchemeDark = useColorScheme() === 'dark';
  const appSettingsContext = useContext(AppSettingsContext);
  // Use isThemeDefault setting and the device color scheme setting to see if we want dark
  const isThemeDark = appSettingsContext.isThemeDefault ? isColorSchemeDark : !isColorSchemeDark;

  const myReactNavigationBasedTheme = {
    ...DefaultTheme,
    dark: isThemeDark, // whether this is dark or light theme
    colors: isThemeDark ? darkThemeColors : lightThemeColors,
  };


  return (
    <MyThemeContext.Provider value={{
      myReactNavigationBasedTheme: myReactNavigationBasedTheme,
      colors: myReactNavigationBasedTheme.colors,
      FONT_SIZE_SMALL: FONT_SIZE_SMALL,
      FONT_SIZE_MEDIUM: FONT_SIZE_MEDIUM,
      FONT_SIZE_LARGE: FONT_SIZE_LARGE,
      FONT_SIZE_XLARGE: FONT_SIZE_XLARGE,
      isThemeDark: isThemeDark,
    }}>
      {props.children}
    </MyThemeContext.Provider>
  );
}


export default MyThemeContext;
