import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, FlatList } from 'react-native'

import { getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
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

  const empty = !specials.length;

  /* 
    Combination of event title and time
    would NOT be unique if a time had more than one representation
    that was interesting. So, description is also added.
  */
  const keyExtractor = (item) => {
    return ('key_' + item.event.title + "_" + item.time + "_" + item.description)
  }

  return (
    <React.Fragment>
      {!empty &&
        <FlatList
          data={specials}
          ListHeaderComponent={props.listHeaderComponent}
          contentContainerStyle={{ padding: 15 }}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => {
            const event = item.event;
            const noShowTimeOfDay = event.isFullDay || (['hours', 'minutes', 'seconds'].indexOf(item.unit) < 0);
            const specialDisplayDateTime = getDisplayStringDateTimeForEpoch(item.time, noShowTimeOfDay);
            const eventDisplayDateTime = getDisplayStringDateTimeForEvent(event);

            let desc = item.description + " " + item.unit;
            if (props.verboseDescription) {
              const isEventInFuture = (event.epochMillis > nowTime);
              const i18nKey = isEventInFuture ? "milestoneDescriptionFuture" : "milestoneDescriptionPast";
              desc = i18n.t(i18nKey, { milestoneDesciption: desc, eventTitle: event.title, eventDateTime: eventDisplayDateTime });
            }

            return (<EventCard event={event}>
              <EventCardHeader event={event}>{specialDisplayDateTime}</EventCardHeader>
              <EventCardBodyText event={event} >{desc}</EventCardBodyText>
            </EventCard>);

          }
          }
        />
      }
      {empty &&
        <React.Fragment>
          {props.showHeaderIfListEmpty && props.listHeaderComponent}
          <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyMilestoneMesage', { someValue: howManyDaysAhead })}</Text></View>
        </React.Fragment>
      }
    </React.Fragment>
  );

}


UpcomingMilestonesList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  /* 
    If verboseDescription, include more info in the description including the event title.
  */
  verboseDescription: PropTypes.bool.isRequired,
  listHeaderComponent: PropTypes.element,
  showHeaderIfListEmpty: PropTypes.bool, // still how header even if list is empty
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: theme.FONT_SIZE_LARGE,
    padding: 15,
  },
});
