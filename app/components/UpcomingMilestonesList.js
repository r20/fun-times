import React, { useState, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, FlatList, TouchableOpacity, Clipboard } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useScrollToTop } from '@react-navigation/native'

import { getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import CalendarContext, {
  howManyDaysAheadCalendar, howManyDaysAgoCalendar,
  getIsMilestoneFullDay, makeMilestoneClipboardContentForMilestone,
  getMilestoneVerboseDescription
} from '../context/CalendarContext'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import EventCard, { EventCardHeader, EventCardBodyText, EVENT_CARD_MARGIN } from '../components/EventCard'
import { shouldShowMilestoneForNumberType } from '../utils/milestones'
import ClipboardCopyable from '../components/ClipboardCopyable'
import AppSettingsContext from '../context/AppSettingsContext'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import MyText, { MyTextLarge } from './MyText'

// This is only used to differentiate between old and new events, so no need to update
const nowTime = (new Date()).getTime();

// This is height without margin
const ITEM_HEIGHT = 72;
const heightWithMargin = ITEM_HEIGHT + 2 * EVENT_CARD_MARGIN;
const eventCardHeightStyle = { height: ITEM_HEIGHT };


export default function UpcomingMilestonesList(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const appSettingsContext = useContext(AppSettingsContext);
  const calendarContext = useContext(CalendarContext);

  // Store which events we want milestones for
  const eventTitleMap = {};
  const numMilestonesPerEventMap = {};
  for (let idx = 0; idx < props.events.length; idx++) {
    eventTitleMap[props.events[idx].title] = true;
    numMilestonesPerEventMap[props.events[idx].title] = 0;
  }


  /* Memoize for performance using allMilestones which is already sorted
  */
  let specials = useMemo(() => {
    return eventsAndMilestonesContext.allMilestones.filter(function (milestone, index, arr) {
      if (milestone.event && eventTitleMap[milestone.event.title]) {
        // yes this milestone is for one of the events
        if (shouldShowMilestoneForNumberType(milestone, appSettingsContext.numberTypeUseMap)) {
          // Yes we should show this type of milestone
          if (!props.maxNumMilestonesPerEvent) {
            // No max was specified
            return true;
          } else if (numMilestonesPerEventMap[milestone.event.title] < props.maxNumMilestonesPerEvent) {
            // A max limit was specified, and we haven't shown too many yet
            numMilestonesPerEventMap[milestone.event.title] = numMilestonesPerEventMap[milestone.event.title] + 1;
            return true;
          }
        }
      }
      return false;
    });
  }, [eventsAndMilestonesContext.allMilestones, props.events, props.maxNumMilestonesPerEvent, appSettingsContext.numberTypeUseMap]);


  const isEmpty = specials.length === 0;


  /* To optimize and improve FlatList performance, use fixed height
    items */
  const getItemLayout = (data, index) => {
    return { length: heightWithMargin, offset: heightWithMargin * index, index };
  };

  /* Find starting index position (don't show a bunch of past events when first go to screen)
  this prop to FlatList also needs getItemLayout */
  let initialScrollIndexOnlyIfGreaterThanZero = {};
  for (let idx = 0; idx < specials.length; idx++) {
    if (specials[idx].time >= nowTime) {
      initialScrollIndexOnlyIfGreaterThanZero = { initialScrollIndex: idx };
      break;
    }
  }

  const renderItem = ({ item, index, separators }) => {

    const noShowTimeOfDay = getIsMilestoneFullDay(item);
    const specialDisplayDateTime = getDisplayStringDateTimeForEpoch(item.time, noShowTimeOfDay);

    const verboseDesc = getMilestoneVerboseDescription(item);
    const desc = props.verboseDescription ? verboseDesc : i18n.t(item.unit, { someValue: item.description });

    const isOnCalendar = calendarContext.getIsMilestoneInCalendar(item);
    const btnType = isOnCalendar ? "calendar-check" : "calendar-blank";
    const opacityStyle = (item.time < nowTime) ? styles.lessOpacity : styles.fullOpacity;

    const colorStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarColorStyle() : calendarContext.getMilestoneNotOnCalendarColorStyle();
    const cardStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarCardStyle() : calendarContext.getMilestoneNotOnCalendarCardStyle();


    return (<EventCard style={[styles.card, cardStyle, eventCardHeightStyle]}>
      <View style={[styles.eventCardTextWrapper, opacityStyle]}>
        <ClipboardCopyable onPressGetContentFunction={() => {
          return makeMilestoneClipboardContentForMilestone(item);
        }}>
          <EventCardHeader style={colorStyle}>{specialDisplayDateTime}</EventCardHeader>
          <EventCardBodyText style={colorStyle}>{desc}</EventCardBodyText>
        </ClipboardCopyable>
      </View>
      {calendarContext.isCalendarReady &&
        <View style={opacityStyle}>
          <TouchableOpacity onPress={() => calendarContext.toggleMilestoneScreenCalendarEvent(item)} style={styles.calendarButton}>
            <MaterialCommunityIcons name={btnType} size={18} style={colorStyle} />
          </TouchableOpacity>
        </View>
      }
    </EventCard>);
  }

  return (
    <React.Fragment>
      {!isEmpty &&
        <FlatList
          ref={ref}
          data={specials}
          ListHeaderComponent={props.listHeaderComponent}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={renderItem}
          initialNumToRender={10}
          getItemLayout={getItemLayout}
          {...initialScrollIndexOnlyIfGreaterThanZero}
        />
      }
      {isEmpty &&
        <React.Fragment>
          {props.showHeaderIfListEmpty && props.listHeaderComponent}
          <View style={styles.container} ><MyTextLarge style={styles.emptyText}>{i18n.t('emptyMilestoneMessage', { someValue: howManyDaysAheadCalendar })}</MyTextLarge></View>
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
  showHeaderIfListEmpty: PropTypes.bool, // still show header even if list is empty
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
