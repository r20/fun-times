import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { View, Text, StyleSheet } from 'react-native'
import theme, { getContrastFontColor } from '../style/theme'


/**
 * Components in this file provide a way for consistent styling of information
 * about an event.
 * EventCard can have an EventHeader and one or more EventCardBodyText components within it.
 */

const EventCard = (props) => {

    let stylesArray = [styles.card, styles.eventInfoCard];
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
    event: PropTypes.object.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // more style to apply if desired
};

export default EventCard;

export const EventCardHeader = (props) => {

    return (
        <Text style={[styles.header, props.style]}>{props.children}</Text>
    );
}

EventCardHeader.propTypes = {
    event: PropTypes.object.isRequired,
    style: PropTypes.object, // more style to apply if desired
};

export const EventCardBodyText = (props) => {

    return (
        <Text style={[styles.bodyText, props.style]}>{props.children}</Text>
    );
}

EventCardBodyText.propTypes = {
    event: PropTypes.object.isRequired, // jmr - this used to be used in styling for its color, but not currently
    style: PropTypes.object, // more style to apply if desired
};


const myColor = theme.DEFAULT_EVENTINFO_COLOR;

const styles = StyleSheet.create({
    header: {
        fontSize: theme.FONT_SIZE_MEDIUM + 2,
        fontWeight: 'bold',
        paddingBottom: 3,
    },
    bodyText: {
        fontSize: theme.FONT_SIZE_MEDIUM,
    },
    card: {
        flex: 0,
        padding: 10,
        margin: 5,
        borderRadius: 3,
        overflow: 'hidden',
    },
    eventInfoCard: {
        borderWidth: 0,
        borderStyle: 'solid',
        color: getContrastFontColor(myColor),
        backgroundColor: myColor,
        borderColor: getContrastFontColor(myColor),

    },
});