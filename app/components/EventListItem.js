import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { withNavigation } from '@react-navigation/compat'

import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import { getDisplayStringDateTimeForEvent } from '../utils/Utils'
import EventSelectedStar from '../components/EventSelectedStar'
import theme from '../style/theme'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'
import * as logger from '../utils/logger'

function EventListItem(props) {

  const title = props.event.title;

  const onPressEventInfo = (event) => {
    if (props.navigation) {
      // Pass param
      props.navigation.navigate("EventInfo", { event: event });
    }
  }

  return (
    <View style={styles.container}>
      <EventSelectedStar event={props.event} containerStyle={styles.starStyle} />
      <TouchableOpacity style={styles.card} onPress={() => onPressEventInfo(props.event)}>
        <EventCard>
          <EventCardHeader >{title}</EventCardHeader>
          <EventCardBodyText >{getDisplayStringDateTimeForEvent(props.event)}</EventCardBodyText>
        </EventCard>
      </TouchableOpacity>
    </View>
  );
}


const EventListItemWithNavigation = withNavigation(EventListItem);
export default EventListItemWithNavigation;

EventListItemWithNavigation.propTypes = {
  event: PropTypes.object.isRequired,
  /* If required is specified for navigation, it gives a warning.
  Perhaps it's not hooked up right away when component is created.*/
  navigation: PropTypes.func,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.PRIMARY_BACKGROUND_COLOR,
  },
  card: {
    flex: 1, // So it will stretch out and take up rest of space
  },
  starStyle: {
    paddingRight: 5
  }
});
