import React from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet } from 'react-native'
import theme, { getEventStyle } from '../style/theme'

/**
 * Components in this file provide a way for consistent styling of information
 * about an event using the event's color.
 * EventCard can have an EventHeader and one or more EventCardBodyText components within it.
 */

const EventCard = (props) => (
    <View style={[styles.card, getEventStyle(props.event), props.style]} >
        {props.children}
    </View>
);

EventCard.propTypes = {
    event: PropTypes.object.isRequired,
    style: PropTypes.object, // more style to apply if desired
};

export default EventCard;

export const EventCardHeader = (props) => (
    <Text style={[styles.header, getEventStyle(props.event), props.style]}>{props.children}</Text>
);

EventCardHeader.propTypes = {
    event: PropTypes.object.isRequired,
    style: PropTypes.object, // more style to apply if desired
};

export const EventCardBodyText = (props) => (
    <Text style={[styles.bodyText, getEventStyle(props.event), props.style]}>{props.children}</Text>
);

EventCardBodyText.propTypes = {
    event: PropTypes.object.isRequired,
    style: PropTypes.object, // more style to apply if desired
};

const styles = StyleSheet.create({
    header: {
        fontSize: theme.FONT_SIZE_MEDIUM+2,
        fontWeight: 'bold',
        paddingBottom: 5,
    },
    bodyText: {
        fontSize: theme.FONT_SIZE_MEDIUM,
    },
    card: {
        flex: 1,
        padding: 15,
        margin: 10,
        borderRadius: 5,
        overflow: 'hidden'
    }
});