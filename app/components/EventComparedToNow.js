import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'
import moment from 'moment-timezone'

import { getMomentFromEvent } from '../context/EventsAndMilestonesContext'
import { numberToFormattedString } from '../utils/Utils'
import i18n from '../i18n/i18n'
import { EventCardBodyText } from './EventCard'


export default function EventComparedToNow(props) {
  const eventMoment = getMomentFromEvent(props.event);
  const nowMoment = moment(props.nowMillis);

  const timeUnits = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];

  return (<React.Fragment>
    {
      timeUnits.map((tu) => {
        const num = Math.abs(eventMoment.diff(nowMoment, tu));
        return <EventCardBodyText key={tu} >{i18n.t(tu, { someValue: numberToFormattedString(num) })}</EventCardBodyText>
      })
    }
  </React.Fragment>
  );
}

EventComparedToNow.propTypes = {
  event: PropTypes.object.isRequired,
  nowMillis: PropTypes.number.isRequired,
};

