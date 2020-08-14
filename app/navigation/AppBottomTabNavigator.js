import React, { useContext } from 'react'
import { StyleSheet, View, Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons, Entypo, Fontisto } from '@expo/vector-icons'
import { NavigationContainer } from '@react-navigation/native'
// Search for available icons at https://expo.github.io/vector-icons/

import MyThemeContext from '../context/MyThemeContext'
import AppStackNavigator from '../navigation/AppStackNavigator'
import EventsScreen from '../screens/EventsScreen'
import Today from '../screens/Today'
import Milestones from '../screens/Milestones'
import CalendarScreen from '../screens/CalendarScreen'
import More from '../screens/More'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import AppSettingsContext from '../context/AppSettingsContext'


const Tab = createBottomTabNavigator();
function MyTabs(props) {

  const dots ="more-horiz"; // ios wants horiz, but I likeit for both ios and android

  const myThemeContext = useContext(MyThemeContext);

  const tabBarOptions = {
    showLabel: false,
    activeTintColor: myThemeContext.colors.primary,
    inactiveTintColor: myThemeContext.colors.unselected,
    activeBackgroundColor: myThemeContext.colors.footerBackground,
    inactiveBackgroundColor: myThemeContext.colors.footerBackground,
    style: {
      borderTopWidth: 1,
      borderTopColor: myThemeContext.colors.tabBorder,
    },

  };
  const eventsStackOptions = { tabBarIcon: ({ focused, color, size }) => <Fontisto name="nav-icon-list" size={size-4} color={color} /> };
  const todayOptions = { tabBarIcon: ({ focused, color, size }) => <Entypo name="stopwatch" size={size+2} color={color} /> };
  const milestoneOptions = { tabBarIcon: ({ focused, color, size }) => <FontAwesome name="birthday-cake" size={size} color={color} /> };
  const calendarOptions = { tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="calendar-check" size={size+2} color={color} /> };
  const moreOptions = { tabBarIcon: ({ focused, color, size }) => <MaterialIcons name={dots} size={size+2} color={color} /> };

  return (
    <Tab.Navigator initialRouteName="AppStackNavigator" lazy={true}
      tabBarOptions={tabBarOptions} >
      <Tab.Screen name="AppStackNavigator" component={AppStackNavigator} tabBarAccessibilityLabel={i18n.t("menuEventsTitle")}
        options={eventsStackOptions} />
      <Tab.Screen name="Today" component={Today} tabBarAccessibilityLabel={i18n.t("menuTodayTitle")}
        options={todayOptions} />
      <Tab.Screen name="Milestones" component={Milestones} tabBarAccessibilityLabel={i18n.t("menuMilestoneSuggestionsTitle")}
        options={milestoneOptions} />
      <Tab.Screen name="CalendarScreen" component={CalendarScreen} tabBarAccessibilityLabel={i18n.t("menuCalendarTitle")}
        options={calendarOptions} />
      <Tab.Screen name="More" component={More} tabBarAccessibilityLabel={i18n.t("menuMoreTitle")}
        options={moreOptions} />
    </Tab.Navigator>
  );
}

export default function AppBottomTabsNavigator() {

  const appSettingsContext = useContext(AppSettingsContext);
  const myThemeContext = useContext(MyThemeContext);

  return <NavigationContainer theme={myThemeContext.myReactNavigationBasedTheme}><MyTabs /></NavigationContainer>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});