import { StyleSheet } from 'react-native'

/* TBD - Add theming to allow user to switch between
  style themes (such as white background vs black background
*/

export default {
  FONT_SIZE_SMALL: 13,
  FONT_SIZE_MEDIUM: 16,
  FONT_SIZE_LARGE: 18,
  PRIMARY_BACKGROUND_COLOR: '#e3e3e3',
  PRIMARY_TEXT_COLOR: '#444444',
  PRIMARY_ACTIVE_BACKGROUND_COLOR: '#636363',
  PRIMARY_INACTIVE_BACKGROUND_COLOR: '#c3c3c3',
  PRIMARY_ACTIVE_TEXT_COLOR: '#ffffff',
  PRIMARY_INACTIVE_TEXT_COLOR: '#ffffff',
  SCREEN_BACKGROUND_COLOR: '#ffffff',
  SCREEN_TEXT_COLOR: '#000000',
  ADD_EVENT_BUTTON_BACKGROUND_COLOR: '#2196F3', // lighter blue
  TRASH_ICON_COLOR: '#636363',
  TRASH_BACKGROUND_COLOR: '#ffffff',
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

/**
 * Get a style object that sets color and backgroundColor
 * based on the event's color.
 */
export function getEventStyle(event) {
  const styles = StyleSheet.create({
    eventStyle: {
      color: getContrastFontColor(event.color),
      backgroundColor: event.color,
    },
  });
  return styles.eventStyle;
}