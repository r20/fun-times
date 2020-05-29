import React from 'react'
import { Platform, Colors } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'

import AppBottomTabNavigator from '../navigation/AppBottomTabNavigator'

import { MyReactNavigationBasedTheme } from '../style/theme'
import AddOrEditEvent from '../screens/AddOrEditEvent'
import EventInfo from '../screens/EventInfo'
import theme, { getContrastFontColor } from '../style/theme'

import i18n from '../i18n/i18n'

const Stack = createStackNavigator();
function MyStack() {

  const opts = {
    gestureEnabled: false, headerTitle: '',
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
    },
  };

  return (
    <Stack.Navigator
      initialRouteName="AppBottomTabNavigator"
      screenOptions={opts}
    >
      <Stack.Screen
        name="AppBottomTabNavigator"
        component={AppBottomTabNavigator}
      />
      <Stack.Screen
        name="AddEvent"
        component={AddOrEditEvent}
      />
      <Stack.Screen
        name="EditEvent"
        component={AddOrEditEvent}
      />
      <Stack.Screen
        name="EventInfo"
        component={EventInfo}
      />
    </Stack.Navigator>
  );
}

export default function AppStackNavigator() {
  return <NavigationContainer theme={MyReactNavigationBasedTheme}><MyStack /></NavigationContainer>
}