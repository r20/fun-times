import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, FlatList } from 'react-native'

import { getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'
import { findInterestingDates } from '../utils/interestingDatesFinder'

export default function UpcomingMilestonesList(props) {

  const howManyDaysAhead = 365;
  const tooCloseDays = 4;
  const now = new Date();
  const nowTime = now.getTime();

  let specials = [];
  for (var idx = 0; idx < props.events.length; idx++) {
    const event = props.events[idx];
    specials = specials.concat(findInterestingDates(event, nowTime, howManyDaysAhead, tooCloseDays));
  }
  specials.sort((a, b) => { return (a.time - b.time); });


  /* 
    Combination of event title and time
    would NOT be unique if a time had more than one representation
    that was interesting. So, description is also added.
  */
  const keyExtractor = (item) => {
    return ('key_' + item.event.title + "_" + item.time + "_" + item.description)
  }

  return (
    <FlatList
      data={specials}
      ListHeaderComponent={props.listHeaderComponent}
      contentContainerStyle={{ padding: 15 }}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => {
        const event = item.event;
        const specialDisplayDateTime = getDisplayStringDateTimeForEpoch(item.time, event.isFullDay);
        const eventDisplayDateTime = getDisplayStringDateTimeForEvent(event);

        let desc = item.description + " " + item.unit;
        if (props.verboseDescription) {
          const isEventInFuture = (event.epochMillis > nowTime);
          // jmr - need to use i18n for this
          const sinceOrUntil = isEventInFuture ? " until " : " since ";
          desc = desc + sinceOrUntil + event.title + " (" + eventDisplayDateTime + ")";
        }
        return (<EventCard event={event}>
          <EventCardHeader event={event}>{specialDisplayDateTime}</EventCardHeader>
          <EventCardBodyText event={event} >{desc}</EventCardBodyText>
        </EventCard>);
      }
      }
    />
  );

}

UpcomingMilestonesList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  /* 
    If verboseDescription, include more info in the description including the event title.
  */
  verboseDescription: PropTypes.bool.isRequired,
  listHeaderComponent: PropTypes.element,
}


