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
import MyCalendarDivider from './MyCalendarDivider'

// This is only used to differentiate between old and new events, so no need to update
const nowTime = (new Date()).getTime();

// This is height without margin
const ITEM_HEIGHT = 72;
const heightWithMargin = ITEM_HEIGHT + 2 * EVENT_CARD_MARGIN;
const eventCardHeightStyle = { height: ITEM_HEIGHT };


/* To optimize and improve FlatList performance, use fixed height
  items */
const getItemLayout = (data, index) => {
  return { length: heightWithMargin, offset: heightWithMargin * index, index };
};


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

  /* Render all past plus enough milestones to more than fill up screen on any supported device.
Note that there seems to be some bug where it won't render what it should if there are only
a few and you can't scroll to get more. Not sure if that's the cause or not. */
  let initialNumToRender = 0;

  /* Find starting index position (don't show a bunch of past events when first go to screen)
  this prop to FlatList also needs getItemLayout */
  let initialScrollIndexOnlyIfGreaterThanZero = {};
  for (let idx = 0; idx < specials.length; idx++) {
    initialNumToRender++;
    if (specials[idx].time >= nowTime) {
      initialScrollIndexOnlyIfGreaterThanZero = { initialScrollIndex: idx };
      break;
    }
  }
  initialNumToRender = initialNumToRender + 12;

  const colorStyle = calendarContext.milestoneColorStyle;
  const cardStyle = calendarContext.milestoneCardStyle;

  let inPast = true;
  let firstNotInPastKey = null;

  const renderItem = ({ item, index, separators }) => {

    const noShowTimeOfDay = getIsMilestoneFullDay(item);
    const specialDisplayDateTime = getDisplayStringDateTimeForEpoch(item.time, noShowTimeOfDay);

    const verboseDesc = getMilestoneVerboseDescription(item);
    const desc = props.verboseDescription ? verboseDesc : i18n.t(item.unit, { someValue: item.description });

    const isOnCalendar = calendarContext.getIsMilestoneInCalendar(item);
    const btnType = isOnCalendar ? "calendar-check" : "calendar-blank";
    const opacityStyle = (item.time < nowTime) ? styles.lessOpacity : styles.fullOpacity;

    /* Finding first item not in past so we can have divider */
    if (inPast && item.time >= nowTime) {
      inPast = false;
      firstNotInPastKey = item.key;
    }

    /* We only want between past and future divider if it's not first item (so we also look at index)*/
    return (<React.Fragment>{(firstNotInPastKey === item.key) && index > 0 && <MyCalendarDivider />}
      <EventCard style={[styles.card, cardStyle, eventCardHeightStyle]}>
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
      </EventCard>
    </React.Fragment>);
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
          initialNumToRender={initialNumToRender}
          getItemLayout={getItemLayout}
          {...initialScrollIndexOnlyIfGreaterThanZero}
        />
      }
      {isEmpty &&
        <React.Fragment>
          {props.showHeaderIfListEmpty && <View style={styles.contentContainerStyle}>{props.listHeaderComponent}</View>}
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
    padding: 15,
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
