import React from 'react'
import PropTypes from 'prop-types'
import { Text, TouchableOpacity } from 'react-native'

import { getDateFromEvent } from '../context/EventListContext'
import * as Utils from '../utils/Utils'
import theme from '../style/theme'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'

export default function EventListItem(props) {
  const date = getDateFromEvent(props.event);

  const title = props.event.title;

  return (
    <TouchableOpacity onPress={props.onPressSelectEvent} >
      <EventCard event={props.event}>
        <EventCardHeader event={props.event} >{title}</EventCardHeader>
        <EventCardBodyText event={props.event} >{Utils.getDisplayStringForDate(date)}</EventCardBodyText>
      </EventCard>
    </TouchableOpacity>
  );
}


EventListItem.propTypes = {
  onPressSelectEvent: PropTypes.func.isRequired,
  event: PropTypes.object.isRequired,
}

