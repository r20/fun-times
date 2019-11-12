import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'

import Events from '../screens/Events'
import AddEvent from '../screens/AddEvent'
import SelectedEvent from '../screens/SelectedEvent'
import theme, { getContrastFontColor } from '../style/theme'

const EventsNavigator = createStackNavigator({
    Events: {
        navigationOptions: {
            title: "Events",
        },
        screen: Events
    },
    AddEvent: {
        navigationOptions: {
            title: 'Add Event',
        },
        screen: AddEvent
    },
    SelectedEvent: {
        navigationOptions: ({ navigation }) => {
            const event = navigation.getParam("event");
            const selectedTitle = event.title;
            const headerColor = event.color || theme.PRIMARY_BACKGROUND_COLOR;

            return ({
                title: selectedTitle,
                headerStyle: {
                    backgroundColor: headerColor,
                },
                headerTintColor: getContrastFontColor(headerColor),
            });
        },
        screen: SelectedEvent
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


export default EventsNavigator;