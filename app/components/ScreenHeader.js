import React from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, Text } from 'react-native'
import { Header } from 'react-native-elements'
import theme from '../style/theme'

/* This gets our default backgroundColor. 
*/
const ScreenHeader = (props) => (
  <Header containerStyle={{
    backgroundColor: theme.PRIMARY_BACKGROUND_COLOR,
  }} {...props} >{props.children}</Header>
);

export default ScreenHeader;

export const ScreenHeaderTitle = (props) => (
  <Text style={styles.title} {...props}>{props.children}</Text>
)


const styles = StyleSheet.create({
  title: {
    color: theme.PRIMARY_TEXT_COLOR,
    fontSize: theme.FONT_SIZE_XLARGE,
    fontWeight: 'bold',
  }
});