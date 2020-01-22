import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons, Entypo } from '@expo/vector-icons'
// Search for available icons at https://expo.github.io/vector-icons/

import BuiltinEvents from '../screens/BuiltinEvents'
import CustomEvents from '../screens/CustomEvents'
import Today from '../screens/Today'
import Calendar from '../screens/Calendar'
import More from '../screens/More'
import i18n from '../i18n/i18n'
import theme from '../style/theme'

getDefaultNavigationOptions = ({ navigation }) => {
  let options = {
  };

  const { routeName } = navigation.state;

  const size = 30;
  if (routeName === 'CustomEvents') {
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialIcons name="create" size={size} color={tintColor} />;
    options.title = i18n.t("menuCustomEventsTitle");
  } else if (routeName === 'BuiltinEvents') {
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialCommunityIcons name="star" size={size} color={tintColor} />;
    options.title = i18n.t("menuBuiltinEventsTitle");
  } else if (routeName === 'Today') {
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialCommunityIcons name="calendar-today" size={size} color={tintColor} />;
    options.title = i18n.t("menuTodayTitle");
  } else if (routeName === 'Calendar') {
    // TBD: Or should I use calendar-blank as the icon?  It's too similar to calendar-today
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialCommunityIcons name="timetable" size={size} color={tintColor} />;
    options.title = i18n.t("menuUpcomingTitle");
  } else {
    options.tabBarIcon = ({ focused, tintColor }) => <MaterialCommunityIcons name="menu" size={size} color={tintColor} />;
    options.title = i18n.t("menuMoreTitle");
  }
  return options;
};


const TabNavigator = createBottomTabNavigator(
  {
    CustomEvents: { screen: CustomEvents },
    BuiltinEvents: { screen: BuiltinEvents },
    Today: { screen: Today },
    Calendar: { screen: Calendar },
    More: { screen: More },
  },
  {
    initialRouteName: 'CustomEvents',
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

export default TabNavigator;
