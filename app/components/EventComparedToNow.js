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
  const timeUnits = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];


  const isAllDayAndNow = (props.event.isAllDay && eventMoment.isSame(nowMoment, "day"));

  return (<React.Fragment>
    {
      timeUnits.map((tu) => {
        const num = Math.abs(eventMoment.diff(nowMoment, tu));
        if (isAllDayAndNow) {
          return <EventCardBodyText key={tu} >{i18n.t(tu, { someValue: numberToFormattedString(0) })}</EventCardBodyText>
        } else {
          return <EventCardBodyText key={tu} >{i18n.t(tu, { someValue: numberToFormattedString(num) })}</EventCardBodyText>
        }
      })
    }
  </React.Fragment>
  );
}

EventComparedToNow.propTypes = {
  event: PropTypes.object.isRequired,
};

