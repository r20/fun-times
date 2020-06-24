import React, { useContext } from 'react'
import { StyleSheet, View, Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons, Entypo } from '@expo/vector-icons'
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

  // const navigation = useNavigation();
  // const route = useRoute();

  const dots = Platform.OS === "ios" ? "more-horiz" : 'more-vert';

  const myThemeContext = useContext(MyThemeContext);

  // React.useLayoutEffect(() => {
  //   // EventsScreen is initialRouteName
  //   let title = i18n.t("headerEventsTitle");
  //   if (route && route.state && route.state.routeNames && route.state.index !== undefined) {
  //     const stateName = route.state.routeNames[route.state.index];
  //     if (stateName === "Today") {
  //       title = i18n.t("headerTodayTitle");
  //     } else if (stateName === "Milestones") {
  //       title = i18n.t("headerUpcomingMilestonesScreenTitle");
  //     } else if (stateName === "CalendarScreen") {
  //       title = i18n.t("headerCalendar");
  //     } else if (stateName === "More") {
  //       title = i18n.t("headerMoreTitle");
  //     }
  //   }

  //   navigation.setOptions({
  //     headerTitle: title,
  //     // this defaults to left android and center on ios
  //     // headerTitleAlign: 'center' , // on android center makes it too high. So keep it left.
  //     headerStyle: {
  //       elevation: 0,
  //       shadowOpacity: 0,
  //     },

  //   });
  // }, [navigation, route]);

  const tabBarOptions = {
    showLabel: false,
    activeTintColor: myThemeContext.colors.primary,
    inactiveTintColor: myThemeContext.colors.unselected,
    activeBackgroundColor: myThemeContext.colors.footerBackground,
    inactiveBackgroundColor: myThemeContext.colors.footerBackground,
    style: {
      borderTopWidth: 1,
      // No border if dark theme
      borderTopColor: myThemeContext.colors.tabBorder,
    },

  };
  const eventsStackOptions = { tabBarIcon: ({ focused, color, size }) => <FontAwesome name="birthday-cake" size={size} color={color} /> };
  const todayOptions = { tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="calendar-today" size={size} color={color} /> };
  const milestoneOptions = { tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="calendar-multiselect" size={size} color={color} /> };
  const calendarOptions = { tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="calendar-check" size={size} color={color} /> };
  const moreOptions = { tabBarIcon: ({ focused, color, size }) => <MaterialIcons name={dots} size={size} color={color} /> };

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