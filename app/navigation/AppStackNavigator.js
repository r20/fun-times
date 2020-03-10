import React from 'react'
import { Platform, Colors } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { Ionicons } from '@expo/vector-icons'

import AppBottomTabNavigator from '../navigation/AppBottomTabNavigator'

import AddOrEditEvent from '../screens/AddOrEditEvent'
import EventInfo from '../screens/EventInfo'
import theme, { getContrastFontColor } from '../style/theme'

import i18n from '../i18n/i18n'


const AppStackNavigator = createStackNavigator({
  AppBottomTabNavigator: {
    headerMode: "none",
    screen: AppBottomTabNavigator
  },
  AddEvent: {
    headerMode: "none",
    screen: AddOrEditEvent
  },
  EditEvent: {
    headerMode: "none",
    screen: AddOrEditEvent
  },
  EventInfo: {
    headerMode: "none",
    screen: EventInfo
  },

}, {
  headerLayoutPreset: 'center',
  defaultNavigationOptions: {
    header: null,
  },
});


export default createAppContainer(AppStackNavigator);