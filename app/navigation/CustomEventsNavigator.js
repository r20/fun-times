import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'

import CustomEvents from '../screens/CustomEvents'
import AddEvent from '../screens/AddEvent'
import EventInfo from '../screens/EventInfo'
import theme, { getContrastFontColor } from '../style/theme'

import i18n from '../i18n/i18n'


const CustomEventsNavigator = createStackNavigator({
    CustomEvents: {
        navigationOptions: {
            title: i18n.t("headerCustomEventsTitle"),
        },
        screen: CustomEvents
    },
    AddEvent: {
        navigationOptions: {
            title: i18n.t('headerAddEventTitle'),
        },
        screen: AddEvent
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


export default CustomEventsNavigator;