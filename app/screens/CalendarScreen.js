import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import { useScrollToTop } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import AppSettingsContext from '../context/AppSettingsContext'
import CalendarContext, { howManyDaysAheadCalendar, howManyDaysAgoCalendar } from '../context/CalendarContext'
import ClipboardCopyable from '../components/ClipboardCopyable'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader, EventCardBodyText, EVENT_CARD_MARGIN } from '../components/EventCard'
import * as logger from '../utils/logger'


// This is only used to differentiate between old and new events, so no need to update
const nowTime = (new Date()).getTime();

// Don't know how this works, but it's the height without margin??
const ITEM_HEIGHT = 72;
const heightWithMargin = ITEM_HEIGHT + 2 * EVENT_CARD_MARGIN;
const eventCardHeightStyle = { height: ITEM_HEIGHT };


function CalendarScreen(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);


  const calendarContext = useContext(CalendarContext);
  const appSettingsContext = useContext(AppSettingsContext);

  const wrappedCalendarEventsList = calendarContext.wrappedCalendarEventsList || [];

  const isEmpty = wrappedCalendarEventsList.length === 0;



  /* To optimize and improve FlatList performance, use fixed height
  items */
  const getItemLayout = (data, index) => {
    return { length: heightWithMargin, offset: heightWithMargin * index, index };
  };


  /* Find starting index position (don't show a bunch of past events when first go to screen)
  this prop to FlatList also needs getItemLayout */
  let initialScrollIndexOnlyIfGreaterThanZero = {};
  for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {
    const eventTime = wrappedCalendarEventsList[idx].startTime;
    if (eventTime >= nowTime) {
      initialScrollIndexOnlyIfGreaterThanZero = { initialScrollIndex: idx };
      break;
    }
  }


  const renderItem = ({ item, index, separators }) => {

    const wrappedCalendarEvent = item;

    const isOnCalendar = wrappedCalendarEvent.isOnCalendar;
    const eventTime = wrappedCalendarEvent.startTime;


    const colorStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarColorStyle() : calendarContext.getMilestoneNotOnCalendarColorStyle();
    const cardStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarCardStyle() : calendarContext.getMilestoneNotOnCalendarCardStyle();

    const btnType = isOnCalendar ? "calendar-check" : "calendar-blank";
    const opacityStyle = (eventTime < nowTime) ? styles.lessOpacity : styles.fullOpacity;

    const clipboadContent = wrappedCalendarEvent.header + "\n" + wrappedCalendarEvent.description; // use verbose description for this no matter which screen they're on


    return (<EventCard style={[styles.card, cardStyle, eventCardHeightStyle]}>
      <View style={[styles.eventCardTextWrapper, opacityStyle]}>
        <ClipboardCopyable content={clipboadContent}>
          <EventCardHeader style={colorStyle}>{wrappedCalendarEvent.header}</EventCardHeader>
          <EventCardBodyText style={colorStyle}>{wrappedCalendarEvent.description}</EventCardBodyText>
        </ClipboardCopyable>
      </View>
      <View style={opacityStyle}>
        <TouchableOpacity onPress={() => calendarContext.toggleCalendarScreenCalendarEvent(item)} style={styles.calendarButton}>
          <MaterialCommunityIcons name={btnType} size={18} style={colorStyle} />
        </TouchableOpacity>
      </View>
    </EventCard>);
  }

  return (
    <React.Fragment>
      {calendarContext.isCalendarReady && !isEmpty &&
        <FlatList
          ref={ref}
          data={wrappedCalendarEventsList}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={renderItem}
          initialNumToRender={10}
          getItemLayout={getItemLayout}
          {...initialScrollIndexOnlyIfGreaterThanZero}
        />
      }
      {calendarContext.isCalendarReady && isEmpty &&
        <React.Fragment>
          {props.showHeaderIfListEmpty && props.listHeaderComponent}
          <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyCalendarMessage', { someValue: howManyDaysAheadCalendar })}</Text></View>
        </React.Fragment>
      }
    </React.Fragment>
  );
}

export default CalendarScreen;

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