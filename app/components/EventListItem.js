import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { withNavigation } from 'react-navigation'

import { withEventListContext } from '../context/EventListContext'
import { getEventDisplayDate } from '../utils/Event'
import theme from '../style/theme'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'
import * as logger from '../utils/logger'

function EventListItem(props) {

  /* Using state instead of getting it from eventListContext
  because when toggle, it takes a moment for it to update.  When the user presses the star,
  we want the color to change immediately, not a short moment later. */
  const [isSelected, setIsSelected] = useState(props.eventListContext.isEventSelected(props.event));

  const title = props.event.title;

  const onPressEventInfo = (event) => {
    if (props.navigation) {
      // Passed param will be accessible via props.navigation.getParam()
      props.navigation.navigate("EventInfo", { event: event });
    }
  }

  const toggleSelected = (event) => {
    setIsSelected(!isSelected);
    // This change is async and takes longer than state update
    props.eventListContext.toggleEventSelected(event);
  }


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selected} onPress={() => toggleSelected(props.event)}>
        <MaterialCommunityIcons
          name="star"
          style={[{ fontSize: 30 }, isSelected ? { fontSize: 30, color: 'gold', } : { fontSize: 30, color: 'lightgray', }]}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => onPressEventInfo(props.event)}>
        <EventCard event={props.event}>
          <EventCardHeader event={props.event} >{title}</EventCardHeader>
          <EventCardBodyText event={props.event} >{getEventDisplayDate(props.event)}</EventCardBodyText>
        </EventCard>
      </TouchableOpacity>
    </View>
  );
}


const EventListItemWithStuff = withEventListContext(withNavigation(EventListItem));
export default EventListItemWithStuff;

EventListItemWithStuff.propTypes = {
  event: PropTypes.object.isRequired,
  /* If required is specified for navigation, it gives a warning.
  Perhaps it's not hooked up right away when component is created.*/
  navigation: PropTypes.func,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  selected: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1, // So it will stretch out and take up rest of space
  },
});
