import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'

import BuiltinEvents from '../screens/BuiltinEvents'
import EventInfo from '../screens/EventInfo'
import theme, { getContrastFontColor } from '../style/theme'

import i18n from '../i18n/i18n'


const BuiltinEventsNavigator = createStackNavigator({
    BuiltinEvents: {
        navigationOptions: {
            title: i18n.t("headerBuiltinEventsTitle"),
        },
        screen: BuiltinEvents
    },
    EventInfo: {
        navigationOptions: ({ navigation }) => {
            const event = navigation.getParam("event");
            const eventTitle = event.title;
            const headerColor = event.color || theme.PRIMARY_BACKGROUND_COLOR;

            return ({
                title: eventTitle,
                headerStyle: {
                    backgroundColor: headerColor,
                },
                headerTintColor: getContrastFontColor(headerColor),
            });
        },
        screen: EventInfo
    },
}, {
    headerLayoutPreset: 'center',
    defaultNavigationOptions: ({ navigation }) => ({
        headerBackTitle: null, // so no title on back button.
        headerStyle: {
            backgroundColor: theme.PRIMARY_BACKGROUND_COLOR,
        },
        headerTintColor: theme.PRIMARY_TEXT_COLOR,
    })
});


export default BuiltinEventsNavigator;