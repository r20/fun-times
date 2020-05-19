import React from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons, Entypo } from '@expo/vector-icons'
// Search for available icons at https://expo.github.io/vector-icons/

import EventsScreen from '../screens/EventsScreen'
import Today from '../screens/Today'
import MilestoneCalendar from '../screens/MilestoneCalendar'
import More from '../screens/More'
import i18n from '../i18n/i18n'
import theme from '../style/theme'
import * as logger from '../utils/logger'


const Tab = createBottomTabNavigator();
function MyTabs(props) {

  const navigation = useNavigation();
  const route = useRoute();

  const dots = Platform.OS === "ios" ? "more-horiz" : 'more-vert';

  React.useLayoutEffect(() => {
    // EventsScreen is initialRouteName
    let title = i18n.t("headerEventsTitle");
    if (route && route.state && route.state.routeNames && route.state.index !== undefined) {
      const stateName = route.state.routeNames[route.state.index];
      if (stateName === "Today") {
        title = i18n.t("headerTodayTitle");
      } else if (stateName === "MilestoneCalendar") {
        title = i18n.t("headerUpcomingCalendarScreenTitle");
      } else if (stateName === "More") {
        title = i18n.t("headerMoreTitle");
      }
    }

    navigation.setOptions({
      headerTitle: title,
      // this defaults to left android and center on ios
      // headerTitleAlign: 'center' , // on android center makes it too high. So keep it left.
      headerStyle: {
        elevation: 0,
        shadowOpacity: 0,
      },

    });
  }, [navigation, route]);


  return (
    <Tab.Navigator initialRouteName="EventsScreen" lazy={true}
      tabBarOptions={{
        showLabel: false,
        activeTintColor: theme.PRIMARY_ACTIVE_TEXT_COLOR,
        inactiveTintColor: theme.PRIMARY_INACTIVE_TEXT_COLOR,
        activeBackgroundColor: theme.PRIMARY_ACTIVE_BACKGROUND_COLOR,
        inactiveBackgroundColor: theme.PRIMARY_INACTIVE_BACKGROUND_COLOR,
        style: {
          borderTopWidth: 1,
          borderTopColor: theme.TAB_BAR_BORDER_COLOR,
        },
      }} >

      <Tab.Screen name="EventsScreen" component={EventsScreen} tabBarAccessibilityLabel={i18n.t("menuEventsTitle")}
        options={{ activeTintColor: 'red', tabBarIcon: ({ focused, color, size }) => <FontAwesome name="birthday-cake" size={size} color={color} /> }} />
      <Tab.Screen name="Today" component={Today} tabBarAccessibilityLabel={i18n.t("menuTodayTitle")}

        options={{ tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="calendar-today" size={size} color={color} /> }} />
      <Tab.Screen name="MilestoneCalendar" component={MilestoneCalendar} tabBarAccessibilityLabel={i18n.t("menuUpcomingTitle")}
        options={{ tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="calendar-multiselect" size={size} color={color} /> }} />
      <Tab.Screen name="More" component={More} tabBarAccessibilityLabel={i18n.t("menuMoreTitle")}
        options={{ tabBarIcon: ({ focused, color, size }) => <MaterialIcons name={dots} size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

export default MyTabs;
