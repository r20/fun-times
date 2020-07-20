import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { useIsFocused } from '@react-navigation/native';

import { getMomentFromEvent } from '../context/EventsAndMilestonesContext'
import { numberToFormattedString } from '../utils/Utils'
import i18n from '../i18n/i18n'
import { EventCardBodyText } from './EventCard'


export default function EventComparedToNow(props) {
  const eventMoment = getMomentFromEvent(props.event);

  const [nowDate, setNowDate] = useState(new Date());
  // useIsFocused() can't be called within the useEffect so do it here
  const isFocued = useIsFocused();

  useEffect(() => {
    const interval = setInterval(() => {
      /* I tried useFocusEffect like in Today.js but was getting an error. 
        Check if screen in focus this way. */
      if (isFocued) {
        setNowDate(new Date());
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, [nowDate, isFocued]);

  const nowMoment = moment(nowDate);
  const timeUnits = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];

  const ms = Math.abs(nowMoment.diff(eventMoment));
  const duration = moment.duration(ms);
  /* TBD note that this won't use i18n.  Also, momemnt-duration-format has a usePlural option (on by default) that adds "s" at end of unit
  Also note that due to floating point errors, I've seen -1 days in an event 30 years from now.  See https://github.com/jsmreese/moment-duration-format/issues/121
  */
  const s = isAllDayAndNow ? '' : duration.format("y [years], M [months], d [days], h [hours], m [minutes], s [seconds]");


  const isAllDayAndNow = (props.event.isAllDay && eventMoment.isSame(nowMoment, "day"));

  return (<React.Fragment>
    <EventCardBodyText>{s}</EventCardBodyText>
    {
      timeUnits.map((tu) => {
        const num = Math.abs(eventMoment.diff(nowMoment, tu));
        if (isAllDayAndNow) {
          return <EventCardBodyText key={tu} >{i18n.t(tu, { someValue: numberToFormattedString(0) })}</EventCardBodyText>
        } else {
          return <EventCardBodyText key={tu} >&nbsp;&nbsp;&nbsp;{i18n.t(tu, { someValue: numberToFormattedString(num) })}</EventCardBodyText>
        }
      })
    }
  </React.Fragment>
  );
}

EventComparedToNow.propTypes = {
  event: PropTypes.object.isRequired,
};

