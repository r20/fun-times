import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, FlatList, TouchableOpacity, Platform } from 'react-native'
import { useScrollToTop } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'


import AppSettingsContext from '../context/AppSettingsContext'
import CalendarContext, {
  howManyDaysAheadCalendar,
  howManyDaysAgoCalendar, makeMilestoneClipboardContentForWrappedCalendarEvent
} from '../context/CalendarContext'
import ClipboardCopyable from '../components/ClipboardCopyable'
import MyCalendarDivider from '../components/MyCalendarDivider'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader, EventCardBodyText, EVENT_CARD_MARGIN } from '../components/EventCard'
import * as logger from '../utils/logger'
import MyText, { MyTextLarge, MyTextXLarge, MyTextSmall } from '../components/MyText'
import MyThemeContext from '../context/MyThemeContext'
import MyScreenHeader from '../components/MyScreenHeader'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
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
  subtitle: {
    paddingHorizontal: 15,
    paddingBottom: 5,
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



// This is only used to differentiate between old and new events, so no need to update
const nowTime = (new Date()).getTime();

// Don't know how this works, but it's the height without margin??
const ITEM_HEIGHT = 72;
const heightWithMargin = ITEM_HEIGHT + 2 * EVENT_CARD_MARGIN;
const eventCardHeightStyle = { height: ITEM_HEIGHT };

/* To optimize and improve FlatList performance, use fixed height
items */
const getItemLayout = (data, index) => {
  return { length: heightWithMargin, offset: heightWithMargin * index, index };
};

function CalendarScreen(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const myThemeContext = useContext(MyThemeContext);
  const calendarContext = useContext(CalendarContext);
  const appSettingsContext = useContext(AppSettingsContext);

  const wrappedCalendarEventsList = calendarContext.wrappedCalendarEventsList || [];

  const isEmpty = wrappedCalendarEventsList.length === 0;

  /* Render all past plus enough events to more than fill up screen on any supported device.
  Note that there seems to be some bug where it won't render what it should if there are only
  a few and you can't scroll to get more. Not sure if that's the cause or not. */
  let initialNumToRender = 0;

  /* Find starting index position (don't show a bunch of past events when first go to screen)
  this prop to FlatList also needs getItemLayout */
  let initialScrollIndexOnlyIfGreaterThanZero = {};

  for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {
    initialNumToRender++;
    const eventTime = wrappedCalendarEventsList[idx].startTime;
    if (eventTime >= nowTime) {
      initialScrollIndexOnlyIfGreaterThanZero = { initialScrollIndex: idx };
      break;
    }
  }
  initialNumToRender = initialNumToRender + 12;


  const colorStyle = calendarContext.milestoneColorStyle;
  const cardStyle = calendarContext.milestoneCardStyle;

  /* Finding first item not in past so we can have divider */
  let inPast = true;
  let firstNotInPastKey = null;

  const renderItem = ({ item, index, separators }) => {

    const wrappedCalendarEvent = item;

    const isOnCalendar = wrappedCalendarEvent.isOnCalendar;
    const eventTime = wrappedCalendarEvent.startTime;

    const btnType = isOnCalendar ? "calendar-check" : "calendar-blank";
    const opacityStyle = (eventTime < nowTime) ? styles.lessOpacity : styles.fullOpacity;

    if (inPast && item.startTime >= nowTime) {
      inPast = false;
      firstNotInPastKey = item.key;
    }

    return (
      <React.Fragment>{
        (firstNotInPastKey === item.key) && index > 0 && <MyCalendarDivider />}
        <EventCard style={[styles.card, cardStyle, eventCardHeightStyle]}>
          <View style={[styles.eventCardTextWrapper, opacityStyle]}>
            <ClipboardCopyable onPressGetContentFunction={() => {
              return makeMilestoneClipboardContentForWrappedCalendarEvent(wrappedCalendarEvent);
            }}>
              <EventCardHeader style={colorStyle}>{wrappedCalendarEvent.whenDescription}</EventCardHeader>
              <EventCardBodyText style={colorStyle}>{wrappedCalendarEvent.whatDescription}</EventCardBodyText>
            </ClipboardCopyable>
          </View>
          <View style={opacityStyle}>
            <TouchableOpacity onPress={() => calendarContext.toggleCalendarScreenCalendarEvent(item)} style={styles.calendarButton}>
              <MaterialCommunityIcons name={btnType} size={18} style={colorStyle} />
            </TouchableOpacity>
          </View>
        </EventCard>
      </React.Fragment>);
  }

  return (<React.Fragment>
    <MyScreenHeader title={i18n.t('headerCalendar')} />
    <MyTextSmall style={styles.subtitle}>{i18n.t('subtitleCalendarScreen')}</MyTextSmall>
    {calendarContext.isCalendarReady && !isEmpty &&
      <FlatList
        ref={ref}
        data={wrappedCalendarEventsList}
        contentContainerStyle={styles.contentContainerStyle}
        renderItem={renderItem}
        initialNumToRender={initialNumToRender}

        {...initialScrollIndexOnlyIfGreaterThanZero}
      />
    }
    {calendarContext.isCalendarReady && isEmpty &&
      <React.Fragment>
        {props.showHeaderIfListEmpty && props.listHeaderComponent}
        <View style={styles.container} ><MyTextLarge style={styles.emptyText}>{i18n.t('emptyCalendarMessage', { someValue: howManyDaysAheadCalendar })}</MyTextLarge></View>
      </React.Fragment>
    }
  </React.Fragment>
  );
}

export default CalendarScreen;
