import React from 'react'
import { Platform, Colors } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'


import { MyReactNavigationBasedTheme } from '../style/theme'
import EventsScreen from '../screens/EventsScreen'
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
            initialRouteName="EventsScreen"
            screenOptions={opts}
        >
            <Stack.Screen
                name="EventsScreen"
                component={EventsScreen}
                options={{
                    headerStyle: {
                        height: 0, // Instead of using stack header, we'll use the other header that is common to other screens
                    },
                }}
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

export default MyStack;