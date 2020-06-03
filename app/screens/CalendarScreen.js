import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'

import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import { Slider, ButtonGroup } from "react-native-elements"
import * as Calendar from 'expo-calendar'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import AppSettingsContext from '../context/AppSettingsContext'
import CalendarContext from '../context/CalendarContext'
import ClipboardCopyable from '../components/ClipboardCopyable'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader, EventCardBodyText, EVENT_CARD_MARGIN } from '../components/EventCard'
import * as logger from '../utils/logger'


// jmr -  SHould I keep it in state? And how often should I update it??
const nowDate = new Date();
const nowTime = nowDate.getTime();

  // Don't know how this works, but it's the height without margin??
  const ITEM_HEIGHT = 72;

  const heightWithMargin = ITEM_HEIGHT + 2 * EVENT_CARD_MARGIN;

  const eventCardHeightStyle = { height: ITEM_HEIGHT };


function CalendarScreen(props) {

  const calendarContext = useContext(CalendarContext);
  const appSettingsContext = useContext(AppSettingsContext);
  [removedCalendarEntries, setRemovedCalendarEntries] = useState([]); // keep track of calendar entries we remove from calendar

  const calendarEvents = calendarContext.calendarEventsList || [];

  const isEmpty = calendarEvents.length === 0;

  const toggleCalendarEvent = (calendarEvent) => {
    logger.warn("jmr == implement calendarJmr");
  }

    /* To optimize and improve FlatList performance, use fixed height
    items */
    const getItemLayout = (data, index) => {
      return { length: heightWithMargin, offset: heightWithMargin * index, index };
    };
  
    /* jmr - can't use initialScrollIndex. it's breaking when there are no old events??
      And it says it needs getItemLayout to be implemented. */
    // Find starting index position (don't show a bunch of past events when first go to screen)
  
    let initialScrollIndexOnlyIfGreaterThanZero = {};

    for (let idx = 0; idx < calendarEvents.length; idx++) {
      const eventTime = (new Date(calendarEvents[idx].startDate)).getTime();

      if (eventTime>= nowTime) {
        initialScrollIndexOnlyIfGreaterThanZero = { initialScrollIndex: idx };
        logger.warn("jmr == initialScrollIndexOnlyIfGreaterThanZero", idx);
        break;
      }
    }


  const renderItem = ({ item, index, separators }) => {

    const calendarEvent = item;

     const isOnCalendar = true; //jmr
    const eventTime = (new Date(calendarEvent.startDate)).getTime();


    const colorStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarColorStyle() : calendarContext.getMilestoneNotOnCalendarColorStyle();
    const cardStyle = isOnCalendar ? calendarContext.getMilestoneOnCalendarCardStyle() : calendarContext.getMilestoneNotOnCalendarCardStyle();

    const btnType = isOnCalendar ? "calendar-check" : "calendar-blank";
    const opacityStyle = (eventTime < nowTime) ? styles.lessOpacity : styles.fullOpacity;

    const clipboadContent = "jmr";
    const specialDisplayDateTime = calendarEvent.title;
    const desc = calendarEvent.title;

    // jmr- need to change from "event"

    return (<EventCard event={calendarEvent} style={[styles.card, cardStyle, eventCardHeightStyle]}>
      <View style={[styles.eventCardTextWrapper, opacityStyle]}>
        <ClipboardCopyable content={clipboadContent}>
          <EventCardHeader event={calendarEvent} style={colorStyle}>{specialDisplayDateTime}</EventCardHeader>
          <EventCardBodyText event={calendarEvent} style={colorStyle}>{desc}</EventCardBodyText>
        </ClipboardCopyable>
      </View>
      <View style={opacityStyle}>
        <TouchableOpacity onPress={() => toggleCalendarEvent(calendarEvent)} style={styles.calendarButton}>
          <MaterialCommunityIcons name={btnType} size={18} style={colorStyle} />
        </TouchableOpacity>
      </View>
    </EventCard>);
  }


  // jmr - fix empty thing (noting if calendar not ready, else message that nothign on calendar if empty)

  return (
    <React.Fragment>
      {!isEmpty &&
        <FlatList
          data={calendarEvents}
        
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
          <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyMilestoneMesage', { someValue: howManyDaysAheadCalendar })}</Text></View>
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
  sliderWrapper: {
    flex: 0,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: theme.FONT_SIZE_LARGE,
    padding: 15,
  },
  maxMilestoneLabel: {
    fontSize: theme.FONT_SIZE_SMALL,
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