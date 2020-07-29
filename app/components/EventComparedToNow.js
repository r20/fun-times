import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import { useIsFocused } from '@react-navigation/native';

import { getMomentFromEvent } from '../context/EventsAndMilestonesContext'
import { numberToFormattedString, getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import { getNextAnniversaryMoment } from '../utils/Event'
import i18n from '../i18n/i18n'
import MyCard, { MyCardHeader, MyCardBodyText } from '../components/MyCard'


export default function EventComparedToNow(props) {
  const eventMoment = getMomentFromEvent(props.event);

  const [nowDate, setNowDate] = useState(new Date());
  // useIsFocused() can't be called within the useEffect so do it here
  const isFocued = useIsFocused();
  const event = props.event;
  const nowMillis = nowDate.getTime();

  const showAnniversary = (event.epochMillis < nowMillis);
  const anniveraryMoment = showAnniversary ? getNextAnniversaryMoment(eventMoment) : null;

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
  const durationFormatted = isAllDayAndNow ? '' : duration.format("y [years], M [months], d [days], h [hours], m [minutes], s [seconds]");

  const i18nKeyNow = (nowMillis > event.epochMillis) ? "timeSinceEventTitle" : "timeUntilEventTitle";
  const headerElapsed = i18n.t(i18nKeyNow, { eventTitle: event.title, eventDateTime: getDisplayStringDateTimeForEvent(event) });

  /* header and info for anniversary */
  let anniversaryDurationFormatted, headerAnniversary;
  if (showAnniversary) {
    const anniversaryDuration = moment.duration(Math.abs(nowMoment.diff(anniveraryMoment)));
    anniversaryDurationFormatted = isAllDayAndNow ? '' : anniversaryDuration.format("y [years], M [months], d [days], h [hours], m [minutes], s [seconds]");
    headerAnniversary = i18n.t('timeUntilEventTitle', { eventTitle: i18n.t('anniversaryTitleUpper', { title: event.title }), eventDateTime: getDisplayStringDateTimeForEpoch(anniversaryDuration.valueOf(), event.isAllDay) });
  }

  const isAllDayAndNow = (event.isAllDay && eventMoment.isSame(nowMoment, "day"));


  return (<MyCard >
    <MyCardHeader >{headerElapsed}</MyCardHeader>
    <MyCardBodyText>{durationFormatted}</MyCardBodyText>
    {
      timeUnits.map((tu) => {
        const num = Math.abs(eventMoment.diff(nowMoment, tu));
        if (isAllDayAndNow) {
          return <MyCardBodyText key={tu} >{i18n.t(tu, { someValue: numberToFormattedString(0) })}</MyCardBodyText>
        } else {
          return <MyCardBodyText key={tu} >&nbsp;&nbsp;&nbsp;{i18n.t(tu, { someValue: numberToFormattedString(num) })}</MyCardBodyText>
        }
      })
    }
    {showAnniversary && <React.Fragment>
      <MyCardHeader style={styles.space} >{headerAnniversary}</MyCardHeader>
      <MyCardBodyText>{anniversaryDurationFormatted}</MyCardBodyText>
      {
        timeUnits.map((tu) => {
          const num = Math.abs(anniveraryMoment.diff(nowMoment, tu));
          if (isAllDayAndNow) {
            return <MyCardBodyText key={tu} >{i18n.t(tu, { someValue: numberToFormattedString(0) })}</MyCardBodyText>
          } else {
            return <MyCardBodyText key={tu} >&nbsp;&nbsp;&nbsp;{i18n.t(tu, { someValue: numberToFormattedString(num) })}</MyCardBodyText>
          }
        })
      }
    </React.Fragment>}
  </MyCard>
  );
}

EventComparedToNow.propTypes = {
  event: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  space: {
    marginTop: 10,
  },
  moreSpace: {
    marginTop: 20,
  },

});