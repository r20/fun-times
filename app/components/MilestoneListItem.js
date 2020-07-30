import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import CalendarContext, {
  getIsMilestoneAllDay, makeMilestoneClipboardContentForMilestone,
  makeMilestoneClipboardContentForWrappedCalendarEvent, getMilestoneVerboseDescription
} from '../context/CalendarContext'
import ClipboardCopyable from '../components/ClipboardCopyable'
import { getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import MyCard, { MyCardHeader, MyCardBodyText, MY_CARD_MARGIN } from '../components/MyCard'
import * as logger from '../utils/logger'
import MyThemeContext from '../context/MyThemeContext'

// This is height without margin
const ITEM_HEIGHT = 72;
const myCardHeightStyle = { height: ITEM_HEIGHT };

// This is only used to differentiate between old and new events, so no need to update
const nowTime = (new Date()).getTime();

export default function MilestoneListItem(props) {

  /* One of tehse two props should have been specified */
  const item = props.milestone;
  const wrappedCalendarEvent = props.wrappedCalendarEvent;

  const myThemeContext = useContext(MyThemeContext);
  const calendarContext = useContext(CalendarContext);

  const isOnCalendar = wrappedCalendarEvent ? wrappedCalendarEvent.isOnCalendar : calendarContext.getIsMilestoneInCalendar(item);
  /* I thought of using a local state for showing which button, but it was getting out of sync if
  it was changed from other screen.  So keeping it simple for now. */
  const isChecked = isOnCalendar;

  const calendarTime = wrappedCalendarEvent ? wrappedCalendarEvent.startTime : item.time;
  const when = wrappedCalendarEvent ? wrappedCalendarEvent.whenDescription : getDisplayStringDateTimeForEpoch(item.time, getIsMilestoneAllDay(item));
  const what = wrappedCalendarEvent ? wrappedCalendarEvent.whatDescription : getMilestoneVerboseDescription(item);

  const colorStyle = calendarContext.milestoneColorStyle;
  const cardStyle = calendarContext.milestoneCardStyle;


  const btnType = isChecked ? "calendar-check" : "calendar-blank";
  //const opacityStyle = !isChecked ? styles.lessOpacity : styles.fullOpacity;
  const opacityStyle = (calendarTime < nowTime) ? styles.lessOpacity : styles.fullOpacity;

  const onToggleCalendar = () => {
    props.toggleCalendarHandler();
  }

  const calendarIconStyle = [{ color: myThemeContext.colors.text }, opacityStyle];

  return (
    <View style={styles.container}>
      <View style={{ flex: 0, justifyContent: 'center' }}>
        <TouchableOpacity onPress={onToggleCalendar} style={styles.calendarButton}>
          <MaterialCommunityIcons name={btnType} size={24} style={calendarIconStyle} />
        </TouchableOpacity>
      </View>

      <MyCard style={[styles.card, cardStyle, myCardHeightStyle]}>
        <View style={[styles.myCardTextWrapper, opacityStyle]}>

          <ClipboardCopyable onPressGetContentFunction={() => {
            if (wrappedCalendarEvent) {
              return makeMilestoneClipboardContentForWrappedCalendarEvent(wrappedCalendarEvent);
            }
            return makeMilestoneClipboardContentForMilestone(item);
          }}>
            <MyCardHeader style={colorStyle}>{when}</MyCardHeader>
            <MyCardBodyText style={colorStyle}>{what}</MyCardBodyText>
          </ClipboardCopyable>
        </View>

      </MyCard>
    </View>
  );

}


MilestoneListItem.propTypes = {
  milestone: PropTypes.object,
  wrappedCalendarEvent: PropTypes.object,
  toggleCalendarHandler: PropTypes.func.isRequired,
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  myCardTextWrapper: {
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
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
