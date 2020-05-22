import React, { useState, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import theme from '../style/theme'
import CalendarContext, { howManyDaysAheadCalendar, howManyDaysAgoCalendar } from '../context/CalendarContext'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'
import { findInterestingDates } from '../utils/interestingDatesFinder'

import AppSettingsContext from '../context/AppSettingsContext'

/* jmr - maybe use unit and numtype in key, making key more simple */


export default function UpcomingMilestonesList(props) {

  const appSettingsContext = useContext(AppSettingsContext);
  const calendarContext = useContext(CalendarContext);

  const nowDate = new Date();
  const nowTime = nowDate.getTime();

  const maxNumPastMilestonesPerEvent = 2; // jmr - where to keep this?

  let specials = [];
  for (var idx = 0; idx < props.events.length; idx++) {
    const event = props.events[idx];
    let specialsForEvent = findInterestingDates(event, nowTime, howManyDaysAgoCalendar, howManyDaysAheadCalendar, maxNumPastMilestonesPerEvent, props.maxNumMilestonesPerEvent, appSettingsContext);
    specials = specials.concat(specialsForEvent);
  }
  specials.sort((a, b) => { return (a.time - b.time); });
  const isEmpty = specials.length === 0;

  const getShouldShowMilestone = (isOnCalendar) => {
    const selectedButtonIndex = props.filterNumber;
    if (!selectedButtonIndex) {
      return true;
    } else if (selectedButtonIndex === 1 && !isOnCalendar) {
      return true;
    } else if (selectedButtonIndex === 2 && isOnCalendar) {
      return true;
    }
    return false;
  }


  /* jmr - can't use initialScrollIndex. it's breaking when there are no old events??
    And it says it needs getItemLayout to be implemented. */
  // Find starting index position (don't show a bunch of past events when first go to screen)

  // let initialScrollIndexOnlyIfGreaterThanZero = {};
  // for (let idx = 0; idx < specials.length; idx++) {
  //   if (specials[idx].time >= nowTime) {
  //     initialScrollIndexOnlyIfGreaterThanZero = { initialScrollIndex: idx };
  //     break;
  //   }
  // }
  // jmr- tried putting in   {...initialScrollIndexOnlyIfGreaterThanZero} but still not working

  const renderItem = ({ item, index, separators }) => {
    const event = item.event;
    const noShowTimeOfDay = event.isFullDay && (['hours', 'minutes', 'seconds'].indexOf(item.unit) < 0);
    const specialDisplayDateTime = getDisplayStringDateTimeForEpoch(item.time, noShowTimeOfDay);

    const desc = props.verboseDescription ? calendarContext.getMilestoneVerboseDescription(item) : i18n.t(item.unit, { someValue: item.description });

    const isOnCalendar = calendarContext.getIsMilestoneInCalendar(item);
    const btnType = isOnCalendar ? "calendar-check" : "calendar-blank";
    const opacityStyle = (item.time < nowTime) ? styles.lessOpacity : styles.fullOpacity;

    const colorStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarColorStyle() : calendarContext.getMilestoneNotOnCalendarColorStyle();
    const cardStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarCardStyle() : calendarContext.getMilestoneNotOnCalendarCardStyle();

    if (getShouldShowMilestone(isOnCalendar)) {
      //logger.warn("jmr ==== rendering item ", item.description);

      return (<EventCard event={event} style={[styles.card, cardStyle]}>
        <View style={[styles.eventCardTextWrapper, opacityStyle]}>
          <EventCardHeader event={event} style={colorStyle}>{specialDisplayDateTime}</EventCardHeader>
          <EventCardBodyText event={event} style={colorStyle}>{desc}</EventCardBodyText>
        </View>
        {calendarContext.isCalendarReady &&
          <View style={opacityStyle}>
            <TouchableOpacity onPress={() => calendarContext.toggleCalendarMilestoneEvent(item)} style={styles.calendarButton}>
              <MaterialCommunityIcons name={btnType} size={18} style={colorStyle} />
            </TouchableOpacity>
          </View>
        }
      </EventCard>);
    } else {
      //logger.warn("jmr ==== not rendering item ", item.description);
      return null;
    }

  }

  return (
    <React.Fragment>

      {!isEmpty &&
        <FlatList
          data={specials}
          ListHeaderComponent={props.listHeaderComponent}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={renderItem}
          initialNumToRender={10}
        />
      }
      {isEmpty &&
        <React.Fragment>
          {props.showHeaderIfListEmpty && props.listHeaderComponent}
          <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyMilestoneMesage', { someValue: howManyDaysAheadCalendar })}</Text></View>
        </React.Fragment>
      }
    </React.Fragment>
  );

}


UpcomingMilestonesList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  filterNumber: PropTypes.number, // 0=show all, 1=not on calendar, 2=on calendar
  /* 
    If verboseDescription, include more info in the description including the event title.
  */
  verboseDescription: PropTypes.bool.isRequired,
  listHeaderComponent: PropTypes.element,
  showHeaderIfListEmpty: PropTypes.bool, // still how header even if list is empty
  maxNumMilestonesPerEvent: PropTypes.number, // If > 0 only show up to this many milestones per event
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainerStyle: {
    padding: 15,
  },
  eventCardTextWrapper: {
    flex: 1,
  },
  lessOpacity: {
    opacity: 0.5,
  },
  fullOpacity: {
    opacity: 1,
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: theme.FONT_SIZE_LARGE,
    padding: 15,
  },
  calendarButton: {
    // padding is so touching close to it works too
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5, // Not seen, but that's ok
  },
  card: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
