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
// DFF2D8 (beige)
// C6DEA6 (tea green)
// F5EE9E faint yellow
// F06543 orange
// 56EEF4 electric blue
/*
BCEDF6 light blue
B24C63 maroon

I like this green DDFBD2 with the blue BCEDF6
raspberry ( DB2955) goes with it
This dark gray (54494B) goes with it, and this B98389 (old rose which looks like brownish with pink)

---
This could be a good color for the star (FCFF6C), or this FFFD82, or for darker goldsh this F7B801
They go with tangerine (F68E5F) and dark blue (324376)
This could be red for remove (E94F37) or this E3170A

=================
almost black: 1F271B
blue 2196F3
calendar: BCEDF6
star?:F4D35E or FFDD4A
plus button:  EE964B
red: E4572E

or same black, blue, calendar with
F3CA40 for star, or FFFC31 or FAFF81
purple for plus: 624CAB
red: FF1053

or the same black and blues
and A5B452 or C8D96F for greens
FF312E for red
and FFED65 for yellow
(this is  a good dark gray that goes with all these minus the black)
Here's another black option
Here's a red C1292E that goes with the blues, FFED65 yellow, and C8D96F green

Here's a good combo: https://coolors.co/967d69-2196f3-fff07c-bcedf6-f02d3a
https://coolors.co/ce2d4f-2196f3-688b58-bcedf6-dbff76
https://coolors.co/3b413c-2196f3-ffed66-bcedf6-a38560
https://coolors.co/3b413c-2196f3-ffed66-bcedf6-79b791
https://coolors.co/232c33-2196f3-fffd82-bcedf6-6a994e

*/

let palette;
/* 
  calendar used to be used to be #A5F2F3

  Palette colors are: 
        most butons, calendar, starred,  + button, dark_tabbar, red */

palette = ["#2196f3", "#bcedf6", "#F0CF65", "#2196f3", "#222222", "#E3170A"];
palette = ["#2196f3", "#bcedf6", "#F0CF65", "#9EB25D", "#222222", "#E3170A"];
palette = ["#2196f3", "#bcedf6", "#FFF07C", "#FE5D26", "#2B303A", "#F02D3A"];
palette = ["#2196f3", "#bcedf6", "#F3DE2C", "#688B58", "#2B303A", "#CE2D4F"];

palette = ["#2196f3", "#bcedf6", "#FFED66", "#79B791", "#30362F", "#9E2A2B"];
palette = ["#2196f3", "#bcedf6", "#fff07c", "#967d69", "#12263A", "#f02d3a"];


palette = ["#2196f3", "#bcedf6", "#FFBE0B", "#6A994E", "#232C33", "#EC0B43"]; // 686963 is a good color for unselected in dark theme for this


const lightThemeText = '#333333';
const lightThemeColors = {
  ...DefaultTheme.colors,
  primary: palette[0],
  text: lightThemeText,
  background: '#ffffff',
  card: '#ffffff', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#ffffff', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: getContrastFontColor(palette[0]),
  unselected: '#aaaaaa', // light gray
  tabBorder: '#c3c3c3', // light gray
  secondary: palette[3],
  secondaryLighterOrDarker: adjustLighterOrDarker(palette[3], 80),
  secondaryContrast: getContrastFontColor(palette[3]),
  calendar: palette[1],
  calendarContrast: getContrastFontColor(palette[1]),
  headerBackground: '#ffffff',
  footerBackground: '#ffffff',
  starred: palette[2],
  danger: palette[5],
  dangerContrast: getContrastFontColor(palette[5]),
}

const darkThemeText = '#ffffff';
const darkThemeColors = {
  ...DefaultTheme.colors,
  primary: palette[0],
  text: darkThemeText,
  background: '#000000',
  card: '#000000', // The background color of card-like elements, such as headers, tab bars etc. (We don't use this for calendar cards)
  border: '#000000', // The color of borders, e.g. header border, tab bar border etc.},
  // Those above are for react navigation and can be retrieved with useTheme().  These are extras for this app. (And useTheme doesn't return them in its object.)
  primaryContrast: getContrastFontColor(palette[0]),
  unselected: '#888888', // gray
  tabBorder: palette[4], // same as footerBackground so no border for dark
  secondary: palette[3],
  secondaryLighterOrDarker: adjustLighterOrDarker(palette[3], -80),
  secondaryContrast: getContrastFontColor(palette[3]),
  calendar: palette[1],
  calendarContrast: getContrastFontColor(palette[1]),
  headerBackground: '#000000',
  footerBackground: palette[4],
  starred: palette[2],
  danger: palette[5],
  dangerContrast: getContrastFontColor(palette[5]),
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
  // I think white looks best on colored cards/buttons and black looks best if color is light and theme is dark
  return yiq >= 180 ? '#000000' : '#ffffff';
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
