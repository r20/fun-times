import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'

import { MaterialCommunityIcons } from '@expo/vector-icons'

import { getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import theme, { getEventStyle } from '../style/theme'
import CalendarContext, {howManyDaysAheadToCalendar} from '../context/CalendarContext'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'
import { findInterestingDates } from '../utils/interestingDatesFinder'

import AppSettingsContext from '../context/AppSettingsContext'


export default function UpcomingMilestonesList(props) {

  const appSettingsContext = useContext(AppSettingsContext);
  const calendarContext = useContext(CalendarContext);

  const [calendarReady, setCalendarReady] = useState(calendarContext.isCalendarReady);


  const [specials, setSpecials] = useState([]);
  const [isEmpty, setIsEmpty] = useState(true);
  const howManyDaysAgo = 4; // Let's show a little before today
  const nowDate = new Date();
  const startTime = nowDate.getTime() - howManyDaysAgo * 24 * 60 * 60000;


  const tooCloseDays = 4; // jmr - redo this



  React.useEffect(() => {

    let newSpecials = [];
    for (var idx = 0; idx < props.events.length; idx++) {
      const event = props.events[idx];
      newSpecials = newSpecials.concat(findInterestingDates(event, startTime, howManyDaysAheadToCalendar, tooCloseDays, appSettingsContext, props.maxNumMilestonesPerEvent));
    }

    newSpecials.sort((a, b) => { return (a.time - b.time); });

    setSpecials(newSpecials);
    setIsEmpty(newSpecials.length === 0);

  }, [props.events, appSettingsContext.numberTypeUseMap]);


  React.useEffect(() => {
    setCalendarReady(calendarContext.isCalendarReady);
  }, [calendarContext.isCalendarReady]);


  const getShouldShowMilestone = (milestoneItem) => {
    const selectedButtonIndex = props.filterNumber;
    if (!selectedButtonIndex) {
      return true;
    } else if (selectedButtonIndex === 1 && !calendarContext.getIsMilestoneInCalendar(milestoneItem)) {
      return true;
    } else if (selectedButtonIndex === 2 && calendarContext.getIsMilestoneInCalendar(milestoneItem)) {
      return true;
    }
    return false;
  }


  /* 
    Combination of event title and time
    would NOT be unique if a time had more than one representation
    that was interesting. So, description is also added.
  */
  const keyExtractor = (item) => {
    return ('key_' + item.event.title + "_" + item.time + "_" + item.description)
  }

  // Find starting index position (don't show past)
  let startIdx = 0;
  for (let specialIdx in specials) {
    if (specials[specialIdx].time >= nowDate.getTime()) {
      startIdx = specialIdx;
      break;
    }
  }

  return (
    <React.Fragment>

      {!isEmpty &&
        <FlatList
          data={specials}
          ListHeaderComponent={props.listHeaderComponent}
          contentContainerStyle={{ padding: 15 }}
          keyExtractor={keyExtractor}
          initialScrollIndex={startIdx}
          renderItem={({ item, index, separators }) => {
            const event = item.event;
            const noShowTimeOfDay = event.isFullDay && (['hours', 'minutes', 'seconds'].indexOf(item.unit) < 0);
            const specialDisplayDateTime = getDisplayStringDateTimeForEpoch(item.time, noShowTimeOfDay);

            // If in past, use less than full opacity
            const opacityStyle = (index < startIdx) ? { opacity: 0.4 } : {};

            const desc = props.verboseDescription ? calendarContext.getMilestoneVerboseDescription(item) : i18n.t(item.unit, { someValue: item.description });

            const btnType = calendarContext.getIsMilestoneInCalendar(item) ? "calendar-remove" : "calendar-import";

            if (getShouldShowMilestone(item)) {
              return (<EventCard event={event} style={styles.card}>
                <View style={[styles.eventCardTextWrapper, opacityStyle]}>
                  <EventCardHeader event={event}>{specialDisplayDateTime}</EventCardHeader>
                  <EventCardBodyText event={event} >{desc}</EventCardBodyText>
                </View>
                {calendarReady &&
                  <View style={opacityStyle}>
                    <TouchableOpacity onPress={() => calendarContext.toggleCalendarMilestoneEvent(item)} style={styles.calendarButton}>
                      <MaterialCommunityIcons name={btnType} size={17} style={getEventStyle(event)} />
                    </TouchableOpacity>
                  </View>
                }
              </EventCard>);
            } else {
              return null;
            }

          }
          }
        />
      }
      {isEmpty &&
        <React.Fragment>
          {props.showHeaderIfListEmpty && props.listHeaderComponent}
          <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyMilestoneMesage', { someValue: howManyDaysAheadToCalendar })}</Text></View>
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
  eventCardTextWrapper: {
    flex: 1,
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
