import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import EventListContext from '../context/EventListContext'
import * as logger from '../utils/logger'

function EventSelectedStar(props) {

    const eventListContext = useContext(EventListContext);
    const event = props.event;

    const isSelected = eventListContext.isEventSelected(event);

    const toggleSelected = () => {
        if (event) {
            eventListContext.toggleEventSelected(event);
        }
    }

    return (
        <TouchableOpacity style={[props.containerStyle, styles.selected]} onPress={() => toggleSelected()}>
            <MaterialCommunityIcons
                name="star"
                style={[{ fontSize: 30 }, isSelected ? { fontSize: 30, color: 'gold', } : { fontSize: 30, color: 'lightgray', }]}
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
