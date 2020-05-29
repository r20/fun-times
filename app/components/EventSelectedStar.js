import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import * as logger from '../utils/logger'

function EventSelectedStar(props) {

    const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
    const event = props.event;

    const isSelected = eventsAndMilestonesContext.isEventSelected(event);

    const toggleSelected = () => {
        if (event) {
            eventsAndMilestonesContext.toggleEventSelected(event);
        }
    }

    return (
        <TouchableOpacity style={[props.containerStyle, styles.selected]} onPress={toggleSelected}>
            <MaterialCommunityIcons
                name="star"
                style={isSelected ? styles.starSelected : styles.starUnselected}
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
    starSelected: {
        fontSize: 30,
        color: 'gold',
    },
    starUnselected: {
        fontSize: 30,
        color: 'lightgray',
    },
});
