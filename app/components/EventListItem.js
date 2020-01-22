import React from 'react'
import PropTypes from 'prop-types'
import { Text, TouchableOpacity } from 'react-native'


import {getEventDisplayDate} from '../utils/Event'
import theme from '../style/theme'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'

export default function EventListItem(props) {

  const title = props.event.title;

  return (
    <TouchableOpacity onPress={props.onPressEventInfo} >
      <EventCard event={props.event}>
        <EventCardHeader event={props.event} >{title}</EventCardHeader>
        <EventCardBodyText event={props.event} >{getEventDisplayDate(props.event)}</EventCardBodyText>
      </EventCard>
    </TouchableOpacity>
  );
}


EventListItem.propTypes = {
  onPressEventInfo: PropTypes.func.isRequired,
  event: PropTypes.object.isRequired,
}

