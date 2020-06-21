import React, { createContext, useContext } from 'react'
import { DefaultTheme } from '@react-navigation/native'

import * as logger from '../utils/logger'
import AppSettingsContext from './AppSettingsContext';
import { useColorScheme } from 'react-native-appearance';


const FONT_SIZE_SMALL = 10;
const FONT_SIZE_MEDIUM = 12;
const FONT_SIZE_LARGE = 14;
const FONT_SIZE_XLARGE = 20;

/* Add positive amount to lighten and negative to darken
e.g. +80 or -80 */
function adjustLighterOrDarker(color, amount) {
  return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

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


let palette;
/* 
  calendar used to be used to be #A5F2F3

  https://coolors.co/296eb4-92d5e6-f4d35e-222222-96031a


  Palette colors are: 
        most buttons, calendar,   starred,  +button, dark_tabbar, red */
palette = ["#296EB4", "#92D5E6", "#F4D35E", "#296EB4", "#222222", "#96031A"];
palette = ["#296EB4", "#75B9BE", "#F4D35E", "#296EB4", "#222222", "#96031A"];


let isDarkTheme = false;
const lightThemeText = '#333333';
const lightThemeColors = {
  ...DefaultTheme.colors,
  primary: palette[0],
  text: lightThemeText,
  background: '#ffffff',
  card: '#ffffff', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#ffffff', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: _getContrastFontColorForTheme(palette[0], isDarkTheme),
  unselected: '#aaaaaa', // light gray
  tabBorder: '#c3c3c3', // light gray
  secondary: palette[3],
  secondaryLighterOrDarker: adjustLighterOrDarker(palette[3], 80),
  secondaryContrast: _getContrastFontColorForTheme(palette[3], isDarkTheme),
  calendar: palette[1],
  calendarContrast: _getContrastFontColorForTheme(palette[1], isDarkTheme),
  headerBackground: '#ffffff',
  footerBackground: '#ffffff',
  starred: palette[2],
  danger: palette[5],
  dangerContrast: _getContrastFontColorForTheme(palette[5], isDarkTheme),
}

isDarkTheme = true;
const darkThemeText = '#ffffff';
const darkThemeColors = {
  ...DefaultTheme.colors,
  primary: palette[0],
  text: darkThemeText,
  background: '#000000',
  card: '#000000', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#000000', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: _getContrastFontColorForTheme(palette[0], isDarkTheme),
  unselected: '#888888', // gray
  tabBorder: palette[4], // same as footerBackground so no border for dark
  secondary: palette[3],
  secondaryLighterOrDarker: adjustLighterOrDarker(palette[3], -80),
  secondaryContrast: _getContrastFontColorForTheme(palette[3], isDarkTheme),
  calendar: palette[1],
  calendarContrast: _getContrastFontColorForTheme(palette[1], isDarkTheme),
  headerBackground: '#000000',
  footerBackground: palette[4],
  starred: palette[2],
  danger: palette[5],
  dangerContrast: _getContrastFontColorForTheme(palette[5], isDarkTheme),
}

/** 
 * Return the color that works best (light or dark)
 * to use for contrasting with the input hexcolor.
 * 
 * There's another function within the theme that will apply isThemeDark.
 */
function _getContrastFontColorForTheme(hexcolor, isDarkTheme) {
  var r = parseInt(hexcolor.substring(1, 3), 16);
  var g = parseInt(hexcolor.substring(3, 5), 16);
  var b = parseInt(hexcolor.substring(5, 7), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  // Have slightly different cutoff threshoold depending on if theme is dark
  const cutoffVal = isDarkTheme ? 150 : 180;
  // I think white looks best on colored cards/buttons and black looks best if color is light and theme is dark
  return yiq >= cutoffVal ? '#000000' : '#ffffff';
};


// This created with defaults.  The provider sets the real values using value prop.
const MyThemeContext = createContext({
  myReactNavigationBasedTheme: DefaultTheme,
  colors: DefaultTheme.colors,
  FONT_SIZE_SMALL: FONT_SIZE_SMALL,
  FONT_SIZE_MEDIUM: FONT_SIZE_MEDIUM,
  FONT_SIZE_LARGE: FONT_SIZE_LARGE,
  FONT_SIZE_XLARGE: FONT_SIZE_XLARGE,
  getContrastFontColor: (hexcolor) => {
    return _getContrastFontColorForTheme(hexcolor, true);
  },
  isThemeDark: true,
});


/**
 * Provides a way to see attributes about the device.
 */
export const MyThemeProvider = (props) => {

  const isColorSchemeDark = useColorScheme() === 'dark';
  const appSettingsContext = useContext(AppSettingsContext);
  // Use isThemeDefault setting and the device color scheme setting to see if we want dark
  const isThemeDark = appSettingsContext.isThemeDefault ? isColorSchemeDark : !isColorSchemeDark;

  const getContrastFontColor = (hexcolor) => {
    return _getContrastFontColorForTheme(hexcolor, isThemeDark);
  }

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
      getContrastFontColor: getContrastFontColor,
      isThemeDark: isThemeDark,
    }}>
      {props.children}
    </MyThemeContext.Provider>
  );
}


export default MyThemeContext;
