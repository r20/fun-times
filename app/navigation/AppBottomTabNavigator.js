import React from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons, Entypo } from '@expo/vector-icons'
// Search for available icons at https://expo.github.io/vector-icons/

import EventsScreen from '../screens/EventsScreen'
import Today from '../screens/Today'
import Calendar from '../screens/Calendar'
import More from '../screens/More'
import i18n from '../i18n/i18n'
import theme from '../style/theme'

getDefaultNavigationOptions = ({ navigation }) => {
  let options = {
  };

  const { routeName } = navigation.state;

  const dots = Platform.OS === "ios" ? "more-horiz" : 'more-vert';

  const size = 30;
  if (routeName === 'EventsScreen') {
    options.tabBarIcon = ({ focused, tintColor }) => <FontAwesome name="birthday-cake" size={size} color={tintColor} />;
    options.title = i18n.t("menuEventsTitle");
  } else if (routeName === 'Today') {
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialCommunityIcons name="calendar-today" size={size} color={tintColor} />;
    options.title = i18n.t("menuTodayTitle");
  } else if (routeName === 'Calendar') {
    // TBD: Or should I use calendar-blank as the icon?  It's too similar to calendar-today
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialCommunityIcons name="timetable" size={size} color={tintColor} />;
    options.title = i18n.t("menuUpcomingTitle");
  } else {
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialIcons name={dots} size={size} color={tintColor} />;
    options.title = i18n.t("menuMoreTitle");
  }
  return options;
};


const TabNavigator = createBottomTabNavigator(
  {
    EventsScreen: { screen: EventsScreen },
    Today: { screen: Today },
    Calendar: { screen: Calendar },
    More: { screen: More },
  },
  {
    initialRouteName: 'EventsScreen',
    lazy: true,
    tabBarOptions: {
      showLabel: false,
      activeTintColor: theme.PRIMARY_ACTIVE_TEXT_COLOR,
      inactiveTintColor: theme.PRIMARY_INACTIVE_TEXT_COLOR,
      activeBackgroundColor: theme.PRIMARY_ACTIVE_BACKGROUND_COLOR,
      inactiveBackgroundColor: theme.PRIMARY_INACTIVE_BACKGROUND_COLOR,
      style: {
        borderTopWidth: 1,
        borderTopColor: theme.TAB_BAR_BORDER_COLOR,
      },
    },
    defaultNavigationOptions: getDefaultNavigationOptions,
  }
);

export default TabNavigator;
