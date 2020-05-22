import { StyleSheet } from 'react-native'
import {DefaultTheme} from '@react-navigation/native'


/* TBD - Eventually add theming to allow user to switch between
  style themes (such as white background vs black background
*/

const THEME_SETTINGS = {
  FONT_SIZE_SMALL: 10,
  FONT_SIZE_MEDIUM: 12,
  FONT_SIZE_LARGE: 14,
  FONT_SIZE_XLARGE: 20,
  PRIMARY_BACKGROUND_COLOR: '#ffffff',
  PRIMARY_TEXT_COLOR: '#444444', // real dark gray
  PRIMARY_HEADER_BUTTONS_COLOR: '#666666', // dark gray
  PRIMARY_ACTIVE_BACKGROUND_COLOR: '#ffffff',
  PRIMARY_INACTIVE_BACKGROUND_COLOR: '#ffffff',
  PRIMARY_ACTIVE_TEXT_COLOR: '#2196F3', // blue 
  PRIMARY_INACTIVE_TEXT_COLOR: '#c3c3c3', // light gray
  TAB_BAR_BORDER_COLOR: '#c3c3c3', // light gray
  ADD_EVENT_BUTTON_BACKGROUND_COLOR: '#2196F3', // blue
  DEFAULT_CALENDAR_COLOR: '#add8e6',
  DEFAULT_EVENTINFO_COLOR: '#add8e6',
};

export default THEME_SETTINGS;

export const MyReactNavigationBasedTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: THEME_SETTINGS.PRIMARY_ACTIVE_TEXT_COLOR,
    text: THEME_SETTINGS.PRIMARY_TEXT_COLOR,
    background: THEME_SETTINGS.PRIMARY_BACKGROUND_COLOR,
  },
};


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

/** 
 * Return the color that works best (white or dark gray)
 * to use for contrasting with the input hexcolor.
 * For example, a dark gray would be a better font for a realy light color background,
 * and white better for a dark color background.
 */
export const getContrastFontColor = hexcolor => {
  var r = parseInt(hexcolor.substring(1, 3), 16);
  var g = parseInt(hexcolor.substring(3, 5), 16);
  var b = parseInt(hexcolor.substring(5, 7), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? '#444' : '#fff';
};

