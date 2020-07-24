import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, FlatList } from 'react-native'
import { useScrollToTop } from '@react-navigation/native'


import CalendarContext, { howManyDaysAheadCalendar } from '../context/CalendarContext'
import MyCalendarDivider from '../components/MyCalendarDivider'
import i18n from '../i18n/i18n'
import MyCard, { MyCardHeader, MyCardBodyText, MY_CARD_MARGIN } from '../components/MyCard'
import * as logger from '../utils/logger'
import MyText, { MyTextLarge, MyTextXLarge, MyTextSmall } from '../components/MyText'
import MyThemeContext from '../context/MyThemeContext'
import MyScreenHeader from '../components/MyScreenHeader'
import MilestoneListItem from '../components/MilestoneListItem'

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
  subtitle: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
});



// This is only used to differentiate between old and new events, so no need to update
const nowTime = (new Date()).getTime();

// Don't know how this works, but it's the height without margin??
const ITEM_HEIGHT = 72;
const heightWithMargin = ITEM_HEIGHT + 2 * MY_CARD_MARGIN;

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

  /* I used to show calendar events even after they were toggled off.  That's confusing,
  especially if a bunch are added & removed from the milestones screen and then the user
  goes to the calendar screen and there are a bunch of entries that are not on the calendar.
  So, only show what's actually on the calendar. */

  const tmp = calendarContext.wrappedCalendarEventsList || [];
  //const wrappedCalendarEventsList = tmp;
  const wrappedCalendarEventsList = tmp.filter(function (item, index, arr) {
    return item.isOnCalendar;
  });

  const isEmpty = wrappedCalendarEventsList.length === 0;

  /* Find how many old events, and if there are at least 11 new */
  let oldCount = 0;
  let newCount = 0; for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {
    if (wrappedCalendarEventsList[idx].startTime >= nowTime) {
      newCount++;
      if (newCount > 11) {
        // We've seen enough
        break;
      }
    } else {
      oldCount++;
    }
  }
  const initialNumToRender = 12;

  /* This is added conditionally, because if there aren't many items it causes things to be un-rendered
  after changing the max num per event.  There should be more shown, and they are not. 
   This prop to FlatList also needs getItemLayout */
  const initialScrollIndexOnlyIfMany = (newCount > 7 && oldCount > 1) ? { initialScrollIndex: oldCount } : {};


  /* Finding first item not in past so we can have divider */
  let inPast = true;
  let firstNotInPastKey = null;

  const renderItem = ({ item, index, separators }) => {

    if (inPast && item.startTime >= nowTime) {
      inPast = false;
      firstNotInPastKey = item.key;
    }
    return (
      <React.Fragment>{
        (firstNotInPastKey === item.key) && index > 0 && <MyCalendarDivider />}
        <MilestoneListItem wrappedCalendarEvent={item} toggleCalendarHandler={() => calendarContext.toggleCalendarScreenCalendarEvent(item)} />

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
        getItemLayout={getItemLayout}
        {...initialScrollIndexOnlyIfMany}
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
