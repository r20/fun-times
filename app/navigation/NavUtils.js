import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'

import theme from '../style/theme'

/**
 * A HOC to provide a stack navigator for a single screen.
 * This was introduced simply to get the same header look
 * as the EventsNavigator for the other screens.
 * They may evolve and need real navigation later.
 */
export function withSingleScreenInStackNavigator(Screen, title) {
    return createStackNavigator({
        SingleScreen: {
            navigationOptions: {
                title: title,
            },
            screen: Screen
        },
    }, {
        headerLayoutPreset: 'center',
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: theme.PRIMARY_BACKGROUND_COLOR,
            },
            headerTintColor: theme.PRIMARY_TEXT_COLOR,
        }
    }
    );
}