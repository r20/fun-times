import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import * as logger from '../utils/logger'
import MyThemeContext from '../context/MyThemeContext'

function EventSelectedStar(props) {

    const myThemeContext = useContext(MyThemeContext);
    const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
    const event = props.event;

    /* I thought of using a local state for showing which star, but it might get out of sync if
    changed from other screen.  So keeping it simple for now. */

    // Having a local state variable makes change in star a little more responseive
    const isSelected = eventsAndMilestonesContext.isEventSelected(event);

    const toggleSelected = () => {
        if (event) {
            eventsAndMilestonesContext.toggleEventSelected(event);
        }
    }

    const starStyle = {
        fontSize: 30,
        color: isSelected ? myThemeContext.colors.starred : myThemeContext.colors.unselected,
    };

    return (
        <TouchableOpacity style={[props.containerStyle, styles.selected]} onPress={toggleSelected}>
            <MaterialCommunityIcons
                name="star"
                style={starStyle}
            />
        </TouchableOpacity>
    );
}

export default EventSelectedStar;

EventSelectedStar.propTypes = {
    event: PropTypes.object.isRequired,
    containerStyle: PropTypes.object,
}

const styles = StyleSheet.create({
    selected: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
