import React from 'react'
import { Platform, Colors } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'

import AppBottomTabNavigator from '../navigation/AppBottomTabNavigator'

import AddOrEditEvent from '../screens/AddOrEditEvent'
import EventInfo from '../screens/EventInfo'
import theme, { getContrastFontColor } from '../style/theme'

import i18n from '../i18n/i18n'

const Stack = createStackNavigator();
function MyStack() {
  return (
    <Stack.Navigator
      initialRouteName="AppBottomTabNavigator"
      screenOptions={{ gestureEnabled: false , headerTitle: ''}}
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
  return <NavigationContainer><MyStack /></NavigationContainer>
}