import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet } from 'react-native'
import MyThemeContext from '../context/MyThemeContext'

import MyText, { MyCalendarText, MyCalendarTextLarge } from './MyText'
import * as logger from '../utils/logger'

/**
 * Components in this file provide a way for consistent styling of information
 * about an event.
 * EventCard can have an EventHeader and one or more EventCardBodyText components within it.
 */

const EventCard = (props) => {

    const myThemeContext = useContext(MyThemeContext);

    const eventInfoCardStyle = {
        borderWidth: 0,
        borderStyle: 'solid',
        color: myThemeContext.colors.calendarContrast,
        backgroundColor: myThemeContext.colors.calendar,
        borderColor: myThemeContext.colors.calendarContrast,

    };

    let stylesArray = [styles.card, eventInfoCardStyle];
    if (props.style) {
        if (Array.isArray(props.style)) {
            stylesArray = stylesArray.concat(props.style);
        } else {
            stylesArray = stylesArray.push(props.style);
        }
    }
    return (
        <View style={stylesArray} >
            {props.children}
        </View>
    );
}

EventCard.propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // more style to apply if desired
};

export default EventCard;

export const EventCardHeader = (props) => {

    return (
        <MyCalendarTextLarge style={[styles.header, props.style]}>{props.children}</MyCalendarTextLarge>
    );
}

EventCardHeader.propTypes = {
    style: PropTypes.object, // more style to apply if desired
};

export const EventCardBodyText = (props) => {

    return (
        <MyCalendarText style={[props.style]}>{props.children}</MyCalendarText>
    );
}

EventCardBodyText.propTypes = {
    style: PropTypes.object, // more style to apply if desired
};

export const EVENT_CARD_MARGIN = 5;


const styles = StyleSheet.create({
    header: {
        fontWeight: 'bold',
        paddingBottom: 3,
    },
    card: {
        flex: 0,
        padding: 10,
        margin: EVENT_CARD_MARGIN,
        borderRadius: 3,
        overflow: 'hidden',
    },
});