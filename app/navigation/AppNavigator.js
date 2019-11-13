import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons'
// Search for available icons at https://expo.github.io/vector-icons/

import EventsNavigator from './EventsNavigator'
import Today from '../screens/Today'
import Calendar from '../screens/Calendar'
import More from '../screens/More'
import i18n from '../i18n/i18n'
import theme from '../style/theme'

getDefaultNavigationOptions = ({ navigation }) => {
  let options = {
  };

  const { routeName } = navigation.state;

  const size = 25;
  if (routeName === 'Events') {
    options.tabBarIcon = ({ focused, tintColor }) => <Ionicons name="ios-list" size={size} color={tintColor} />;
    options.title = i18n.t("menuEventsTitle");
  } else if (routeName === 'Today') {
    options.tabBarIcon = ({ focused, tintColor }) => <FontAwesome name="star" size={size} color={tintColor} />;
    options.title = i18n.t("menuTodayTitle");
  } else if (routeName === 'Calendar') {
    options.tabBarIcon = ({ focused, tintColor }) => <FontAwesome name="calendar-o" size={size} color={tintColor} />;
    options.title = i18n.t("menuUpcomingTitle");
  } else {
    options.tabBarIcon = ({ focused, tintColor }) => <Entypo name="menu" size={size} color={tintColor} />;
    options.title = i18n.t("menuMoreTitle");
  }
  return options;
};

/**
 * The bottom tab navigator has 4 tabs.
 * The first (Events) is actually not a single screen, 
 * but a stack navigator of screens (Events, AddEvent, SelectedEvent).
 */
const TabNavigator = createBottomTabNavigator(
  {
    Events: { screen: EventsNavigator },
    Today: { screen: Today },
    Calendar: { screen: Calendar },
    More: { screen: More },
  },
  {
    initialRouteName: 'Events',
    lazy: true,
    tabBarOptions: {
      showLabel: false,
      activeTintColor: theme.PRIMARY_ACTIVE_TEXT_COLOR,
      inactiveTintColor: theme.PRIMARY_INACTIVE_TEXT_COLOR,
      activeBackgroundColor: theme.PRIMARY_ACTIVE_BACKGROUND_COLOR,
      inactiveBackgroundColor: theme.PRIMARY_INACTIVE_BACKGROUND_COLOR,

    },
    defaultNavigationOptions: getDefaultNavigationOptions,
  }
);

export default createAppContainer(TabNavigator);
