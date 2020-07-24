import React, { createContext, useContext, useState } from 'react'
import { DefaultTheme } from '@react-navigation/native'
import nanomemoize from 'nano-memoize'

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
 * Return the color that works best (light or dark)
 * to use for contrasting with the input hexcolor.
 * 
 * There's another function within the theme that will apply isThemeDark.
 */
const _getContrastFontColorForTheme = nanomemoize(function (hexcolor, isDarkTheme) {

  var r = parseInt(hexcolor.substring(1, 3), 16);
  var g = parseInt(hexcolor.substring(3, 5), 16);
  var b = parseInt(hexcolor.substring(5, 7), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  // Have different cutoff threshold depending on if theme is dark
  const cutoffVal = isDarkTheme ? 70 : 180;
  // I think white looks best on colored cards/buttons and black looks best if color is light and theme is dark
  return yiq >= cutoffVal ? '#000000' : '#ffffff';
});


let palette;
/* 
  This helps pick colors:
https://coolors.co/296eb4-f4d35e-aeecef-222222-96031a

  These colors are used for the app.  Palette colors are: 
        most buttons, starred,  +button, dark_tabbar, red */
palette = ["#296EB4", "#296EB4", "#F4D35E", "#222222", "#96031A"];



/** 
 * The event colors to choose from 
 * For dark theme, if a color in the palette is too dark, can't see the palette icon and circle in color picker.
 * Same for white for light theme.  So for now don't include those options.
 * If we wanted to, we could make a border around the icon and circle.
 */
const calendarColorPallete = [
  "#296EB4", "#75B9BE", "#51E5FF", "#AEECEF",
  "#080357", "#440381", "#731963", "#C04ABC",
  "#E2CFEA", "#F4AFAB", "#E56399", "#CA054D",
  "#AF3800", "#D72638", "#96031A", "#FF1D15",
  "#FA7921", "#F4D35E", "#EC7357", "#823329",
  "#544B3D", "#806D40", "#4B644A", "#3E5622",
  "#2BC016", "#0C8346", "#447604", "#09BC8A",
  "#63C7B2", "#333333", "#c3c3c3",
];

/* This is initial color for first time using the app.  
  After a calendar is created, the calendarContext will query the calendar and find out its color 
  and call setCalendarColor to make sure it's set. */

const initialCalendarColor = "#AEECEF";

let tmpIsDarkTheme = false;
const lightThemeText = '#333333';
const lightThemeColors = {
  ...DefaultTheme.colors,
  primary: palette[0],
  text: lightThemeText,
  background: '#ffffff',
  card: '#ffffff', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#ffffff', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: _getContrastFontColorForTheme(palette[0], tmpIsDarkTheme),
  unselected: '#c3c3c3', // light gray
  unselectedContrast: '#888888',
  tabBorder: '#c3c3c3', // light gray
  secondary: palette[1], // This might belong in those for react navigation
  secondaryLighterOrDarker: adjustLighterOrDarker(palette[1], 80),
  secondaryContrast: _getContrastFontColorForTheme(palette[1], tmpIsDarkTheme),
  calendar: initialCalendarColor,
  calendarContrast: _getContrastFontColorForTheme(initialCalendarColor, tmpIsDarkTheme),
  event: '#EBEBEB',
  eventContrast:  _getContrastFontColorForTheme('#EBEBEB', tmpIsDarkTheme),
  card: '#EBEBEB',
  cardContrast:  _getContrastFontColorForTheme('#EBEBEB', tmpIsDarkTheme),
  headerBackground: '#ffffff',
  footerBackground: '#ffffff',
  starred: palette[2],
  danger: palette[4],
  dangerContrast: _getContrastFontColorForTheme(palette[4], tmpIsDarkTheme),
}

tmpIsDarkTheme = true;
const darkThemeText = '#ffffff';
const darkThemeColors = {
  ...DefaultTheme.colors,
  primary: palette[0],
  text: darkThemeText,
  background: '#000000',
  card: '#000000', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#000000', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: _getContrastFontColorForTheme(palette[0], tmpIsDarkTheme),
  unselected: '#555555', // gray
  unselectedContrast: '#333333',
  tabBorder: palette[3], // same as footerBackground so no border for dark
  secondary: palette[1], // This might belong in those for react navigation
  secondaryLighterOrDarker: adjustLighterOrDarker(palette[1], -80),
  secondaryContrast: _getContrastFontColorForTheme(palette[1], tmpIsDarkTheme),
  calendar: initialCalendarColor,
  calendarContrast: _getContrastFontColorForTheme(initialCalendarColor, tmpIsDarkTheme),
  event: '#2C2C34',
  eventContrast:  _getContrastFontColorForTheme('#2C2C34', tmpIsDarkTheme),
  card: '#2C2C34',
  cardContrast:  _getContrastFontColorForTheme('#2C2C34', tmpIsDarkTheme),
  headerBackground: '#000000',
  footerBackground: palette[3],
  starred: palette[2],
  danger: palette[4],
  dangerContrast: _getContrastFontColorForTheme(palette[4], tmpIsDarkTheme),
}




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
  setCalendarColor: (hexcolor) => { },
  calendarColorPallete: [],
});


/**
 * Provides a way to see attributes about the device.
 */
export const MyThemeProvider = (props) => {

  const isColorSchemeDark = useColorScheme() === 'dark';
  const appSettingsContext = useContext(AppSettingsContext);
  // Use isThemeDefault setting and the device color scheme setting to see if we want dark
  const isThemeDark = appSettingsContext.isThemeDefault ? isColorSchemeDark : !isColorSchemeDark;

  const [calendarColor, setCalendarColor] = useState(initialCalendarColor);

  const getContrastFontColor = (hexcolor) => {
    return _getContrastFontColorForTheme(hexcolor, isThemeDark);
  }

  const someColors = isThemeDark ? darkThemeColors : lightThemeColors;
  const colors = Object.assign({}, someColors);
  colors.calendar = calendarColor;
  colors.calendarContrast = _getContrastFontColorForTheme(colors.calendar, isThemeDark);

  const myReactNavigationBasedTheme = {
    ...DefaultTheme,
    dark: isThemeDark, // whether this is dark or light theme
    colors: colors,
  };

  return (
    <MyThemeContext.Provider value={{
      myReactNavigationBasedTheme: myReactNavigationBasedTheme,
      colors: colors,
      FONT_SIZE_SMALL: FONT_SIZE_SMALL,
      FONT_SIZE_MEDIUM: FONT_SIZE_MEDIUM,
      FONT_SIZE_LARGE: FONT_SIZE_LARGE,
      FONT_SIZE_XLARGE: FONT_SIZE_XLARGE,
      getContrastFontColor: getContrastFontColor,
      isThemeDark: isThemeDark,
      setCalendarColor: setCalendarColor,
      calendarColorPallete: calendarColorPallete,
    }}>
      {props.children}
    </MyThemeContext.Provider>
  );
}


export default MyThemeContext;
