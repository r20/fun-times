import React from 'react'
import { Platform, Colors } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import { Ionicons } from '@expo/vector-icons'

import AppBottomTabNavigator from '../navigation/AppBottomTabNavigator'

import AddEvent from '../screens/AddEvent'
import EventInfo from '../screens/EventInfo'
import theme, { getContrastFontColor } from '../style/theme'

import i18n from '../i18n/i18n'


const AppStackNavigator = createStackNavigator({
  AppBottomTabNavigator: {
    navigationOptions: {
      header: null,
    },
    headerMode: "none",
    screen: AppBottomTabNavigator
  },
  AddEvent: {
    navigationOptions: {
      title: i18n.t('headerAddEventTitle'),
    },
    screen: AddEvent
  },
  EventInfo: {
    navigationOptions: ({ navigation }) => {
      const event = navigation.getParam("event");
      const eventTitle = event.title;
      const headerColor = event.color || theme.PRIMARY_BACKGROUND_COLOR;

      const headerContrastColor = getContrastFontColor(headerColor);

      return ({
        title: eventTitle,
        headerStyle: {
          backgroundColor: headerColor,
        },
        headerTintColor: headerContrastColor,
        headerLeft: (
          // This was added because on ios the back arrow was missing. See https://github.com/react-navigation/react-navigation/issues/2918
          // On my Android back isn't needed. On iphone 7 it is.  I suppose just leave it.
          <Ionicons
            name={Platform.OS === "ios" ? "ios-arrow-back" : "md-arrow-back"}
            size={Platform.OS === "ios" ? 35 : 24}
            color={headerContrastColor}
            style={
              Platform.OS === "ios"
                ? { marginBottom: -4, width: 25, marginLeft: 20 }
                : { marginBottom: -4, width: 25, marginLeft: 20 }
            }
            onPress={() => {
              navigation.goBack();
            }}
          />
        ),
      });
    },
    screen: EventInfo
  },
}, {
  headerLayoutPreset: 'center',
  defaultNavigationOptions: ({ navigation }) => ({
    headerBackTitle: null, // so no title on back button.
    headerTitleStyle: {
      fontWeight: 'bold',
    },
    headerStyle: {
      backgroundColor: theme.PRIMARY_BACKGROUND_COLOR,
    },
    headerTintColor: theme.PRIMARY_TEXT_COLOR,
    headerLeft: (
      // This was added because on ios the back arrow was missing. See https://github.com/react-navigation/react-navigation/issues/2918
      // On my Android back isn't needed. On iphone 7 it is.  I suppose just leave it.
      <Ionicons
        name={Platform.OS === "ios" ? "ios-arrow-back" : "md-arrow-back"}
        size={Platform.OS === "ios" ? 35 : 24}
        color={theme.PRIMARY_TEXT_COLOR}
        style={
          Platform.OS === "ios"
            ? { marginBottom: -4, width: 25, marginLeft: 20 }
            : { marginBottom: -4, width: 25, marginLeft: 20 }
        }
        onPress={() => {
          navigation.goBack();
        }}
      />
    ),
  })
});


export default createAppContainer(AppStackNavigator);