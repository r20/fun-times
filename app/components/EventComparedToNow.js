import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'
import moment from 'moment-timezone'

import { getMomentFromEvent } from '../context/EventListContext'
import { numberWithCommas } from '../utils/Utils'
import i18n from '../i18n/i18n'
import { EventCardBodyText } from './EventCard'


export default function EventComparedToNow(props) {
  const eventMoment = getMomentFromEvent(props.event);
  const nowMoment = moment(props.nowMillis);

  const timeUnits = ['months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];

  return (<React.Fragment>
    {
      timeUnits.map((tu) => {
        const num = Math.abs(eventMoment.diff(nowMoment, tu));
        return <EventCardBodyText key={tu} event={props.event}>{i18n.t(tu, { someValue: numberWithCommas(num) })}</EventCardBodyText>
      })
    }
  </React.Fragment>
  );
}

EventComparedToNow.propTypes = {
  event: PropTypes.object.isRequired,
  nowMillis: PropTypes.number.isRequired,
};

