import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, FlatList } from 'react-native'
import moment from 'moment'

import { getDateFromEvent } from '../context/EventListContext'
import * as Utils from '../utils/Utils'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'
import { findInterestingDates } from '../utils/interestingDatesFinder'

export default function UpcomingMilestonesList(props) {

  const howManyDaysAhead = 365;
  const now = new Date();
  const nowTime = now.getTime();

  let specials = [];
  for (var idx = 0; idx < props.events.length; idx++) {
    const event = props.events[idx];
    specials = specials.concat(findInterestingDates(event, nowTime, howManyDaysAhead));
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

  if (!props.renderEventCardBodyTextOnly) {
    return (
      <FlatList
        data={specials}
        contentContainerStyle={{ padding: 15 }}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => {
          const event = item.event;
          const specialDate = new Date(item.time);
          const isEventInFuture = (event.epochMillis > nowTime);
          const sinceOrUntil = isEventInFuture ? " until " : " since ";
          const desc = item.description + " " + item.unit + sinceOrUntil + event.title;

          return (<EventCard event={event}>
            <EventCardHeader event={event}>{Utils.getDisplayStringForDate(specialDate)}</EventCardHeader>
            <EventCardBodyText event={event} >{desc}</EventCardBodyText>
          </EventCard>);
        }
        }
      />
    );
  } else {
    return (<React.Fragment>
      {
        specials.map((item) => {
          const event = item.event;
          const specialDate = new Date(item.time);
          const desc = Utils.getDisplayStringForDate(specialDate) + " -- " + item.description + " " + item.unit;
          const key = keyExtractor(item);

          return (
            <EventCardBodyText key={key} event={event} >{desc}</EventCardBodyText>
          );
        })
      }
    </React.Fragment>
    );
  }
}

UpcomingMilestonesList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  /* 
    This was done this way so SelectedEvent could use this code too.
    If true renders a FlatList with EventCard components with headers,
    else renders EventCardBodyText only
  */
  renderEventCardBodyTextOnly: PropTypes.bool.isRequired,
}


