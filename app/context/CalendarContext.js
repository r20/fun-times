import React, { useState, useEffect, createContext } from 'react'
import { StyleSheet } from 'react-native'
import * as Calendar from 'expo-calendar'
import * as Localization from 'expo-localization'

import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import { getDisplayStringDateTimeForEvent } from '../utils/Utils'
import theme, { getContrastFontColor } from '../style/theme'

export const howManyDaysAheadCalendar = 365; // How far ahead should we calendar things

export const howManyDaysAgoCalendar = 3; // So user can see a little before today

export const numMillisecondsPerDay = 24 * 60 * 60000;

const CALENDAR_TITLE = 'Fun Times Milestones Calendar';

const initialColor = theme.DEFAULT_CALENDAR_COLOR;

// This created with defaults.  The provider sets the real values using value prop.
const CalendarContext = createContext({
  isCalendarReady: false,
  toggleCalendarMilestoneEvent: () => { },
  getMilestoneVerboseDescription: () => { },
  getIsMilestoneInCalendar: () => { },
  removeFunTimesCalendar: () => { },
  getMilestoneOnCalendarColorStyle: () => { },
  getMilestoneNotOnCalendarColorStyle: () => { },
  getMilestoneOnCalendarCardStyle: () => { },
  getMilestoneNotOnCalendarCardStyle: () => { },
});



function createMilestoneOnCalendarColorStyle(colorToUse) {
  return {
    color: getContrastFontColor(colorToUse),
    backgroundColor: colorToUse,
  }
}
function createMilestoneNotOnCalendarColorStyle(colorToUse) {
  return {
    color: getContrastFontColor(colorToUse),
    backgroundColor: colorToUse,
  }
}
function createMilestoneOnCalendarCardStyle(colorToUse) {
  return {
    color: getContrastFontColor(colorToUse),
    backgroundColor: colorToUse,
    borderColor: colorToUse,
    borderWidth: 0,
    borderStyle: 'solid',
  }
}
function createMilestoneNotOnCalendarCardStyle(colorToUse) {
  return {
    color: getContrastFontColor(colorToUse),
    backgroundColor: colorToUse,
    borderColor: colorToUse,
    borderWidth: 0,
    borderStyle: 'solid',
  }
}

// jmr- I may be able to get rid of the notoncalendar versions. Still deciding styling.


/**
 * Provides a way to see attributes about the device.
 */
function MyCalendarProvider(props) {

  [calendarId, setCalendarId] = useState(null);
  [calendarMilestoneEventsMap, setCalendarMilestoneEventsMap] = useState(null);
  [isCalendarReady, setIsCalendarReady] = useState(false);

  [milestoneOnCalendarColorStyle, setMilestoneOnCalendarColorStyle] = useState(createMilestoneOnCalendarColorStyle(initialColor));
  [milestoneNotOnCalendarColorStyle, setMilestoneNotOnCalendarColorStyle] = useState(createMilestoneNotOnCalendarColorStyle(initialColor));
  [milestoneOnCalendarCardStyle, setMilestoneOnCalendarCardStyle] = useState(createMilestoneOnCalendarCardStyle(initialColor));
  [milestoneNotOnCalendarCardStyle, setMilestoneNotOnCalendarCardStyle] = useState(createMilestoneNotOnCalendarCardStyle(initialColor));

  /* This is done here so we can create the objects once and then re-use them no matter how much cards
  are re-rendered (As long as color stays the same, the same object is used.). */
  const setStyleStates = (colorToUse) => {
    setMilestoneOnCalendarColorStyle(createMilestoneOnCalendarColorStyle(colorToUse));
    setMilestoneNotOnCalendarColorStyle(createMilestoneNotOnCalendarColorStyle(colorToUse));
    setMilestoneOnCalendarCardStyle(createMilestoneOnCalendarCardStyle(colorToUse));
    setMilestoneNotOnCalendarCardStyle(createMilestoneNotOnCalendarCardStyle(colorToUse));
  }

  function getMilestoneOnCalendarColorStyle() {
    return milestoneOnCalendarColorStyle;
  }
  function getMilestoneNotOnCalendarColorStyle() {
    return milestoneNotOnCalendarColorStyle;
  }
  function getMilestoneOnCalendarCardStyle() {
    return milestoneOnCalendarCardStyle;
  }
  function getMilestoneNotOnCalendarCardStyle() {
    return milestoneNotOnCalendarCardStyle;
  }

  const getCalendarReady = async () => {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status === 'granted') {

      // Get calendar
      const calendars = await Calendar.getCalendarsAsync();
      let calFound = false;
      let theCalendarId = null;
      for (let cal of calendars) {
        if (cal.title === CALENDAR_TITLE) {
          calFound = true;
          theCalendarId = cal.id;
          setStyleStates(cal.color);
          logger.warn('We found the calendar.', cal);
          break;
        }
      }
      logger.warn('Here are all your calendars:', calendars);
      if (!calFound) {
        /* jmr- we should ask user and get permission before creating.  And, we should let them pick color.
        And we should allow way to remove calendar and events from settings screen?
        */

        logger.warn("Didn't find calendar, so we'll create one.");
        theCalendarId = await createCalendar();

      }
      setCalendarId(theCalendarId);

      // Get events
      const theCalendarEvents = await getCalendarEventsAsync(theCalendarId);
      let tmpcalendarMilestoneEventsMap = {};

      for (let calendarEvent of theCalendarEvents) {
        const theKey = getMilestoneKeyFromCalendarNotes(calendarEvent.notes);
        if (theKey) {
          tmpcalendarMilestoneEventsMap[theKey] = calendarEvent.id;
        }
      }
      setCalendarMilestoneEventsMap(tmpcalendarMilestoneEventsMap);
      setIsCalendarReady(true)
      logger.warn("jmr ===== milestones on calendar mapped", tmpcalendarMilestoneEventsMap);
    } else {
      logger.warn("Don't have permission to use calendar.");
    }
  }

  /* We set state later asynchronously after query */
  useEffect(() => {
    getCalendarReady();
  }, []);


  /* Remove the calendar, and set isCalendarReady to false to it
    can be recreated.  This will effectively remove all events.
   */
  async function removeFunTimesCalendar() {
    const calendars = await Calendar.getCalendarsAsync();
    const filtered = calendars.filter(each => each.title === CALENDAR_TITLE);
    logger.warn("Deleting calendar ");
    if (filtered.length) {
      await Calendar.deleteCalendarAsync(filtered[0].id);
      setIsCalendarReady(false);
      getCalendarReady();
    }

  }

  function getIsMilestoneInCalendar(milestoneItem) {
    const milestoneKey = milestoneItem.key;
    if (!calendarMilestoneEventsMap) {
      logger.warn("jmr === map not ready");
    }
    return calendarMilestoneEventsMap && (calendarMilestoneEventsMap[milestoneKey] !== undefined);
  }


  function getMilestoneVerboseDescription(milestoneItem) {
    const event = milestoneItem.event;
    const eventDisplayDateTime = getDisplayStringDateTimeForEvent(event);

    const isEventInFuture = (event.epochMillis > nowTime);
    const i18nKey = isEventInFuture ? "milestoneDescriptionFuture" : "milestoneDescriptionPast";
    desc = i18n.t(i18nKey, { milestoneDesciption: i18n.t(milestoneItem.unit, { someValue: milestoneItem.description }), eventTitle: event.title, eventDateTime: eventDisplayDateTime });
    return desc;
  }


  async function createCalendar() {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSource()
        : { isLocalAccount: true, name: 'Fun Times Calendar' };

    const colorToUse = theme.DEFAULT_CALENDAR_COLOR;
    setStyleStates(colorToUse);

    const newCalendarId = await Calendar.createCalendarAsync({
      title: CALENDAR_TITLE,
      color: colorToUse, // jmr - should use app color, or let user pick
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCalendarSource.id,
      source: defaultCalendarSource,
      name: 'internalCalendarName',
      ownerAccount: 'personal',
      isVisible: true,
      isSynced: true,
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    logger.log(`Your new calendar ID is: ${newCalendarId}`);

    return newCalendarId;

  }


  const nowDate = new Date();
  const nowTime = nowDate.getTime();


  const getCalendarEventsAsync = async (theCalendarId) => {
    const endDate = new Date(nowTime + (howManyDaysAheadCalendar + 1) * numMillisecondsPerDay); // get one more day's worth just in case.
    const startDate = new Date(nowTime - (howManyDaysAgoCalendar + 1) * numMillisecondsPerDay);
    logger.warn('jmr === searching calendar ', theCalendarId, " between ", startDate.toLocaleDateString(), "and ", endDate.toLocaleDateString());
    const calendarEventObjects = await Calendar.getEventsAsync([theCalendarId], startDate, endDate);

    return calendarEventObjects;
  }

  logger.log("Localization.timezone is ", Localization.timezone);

  /* Get a line we can put in the notes that has the milestone key */
  const getCalendarNotesLineWithMilestoneKey = milestoneItem => {
    // This matches what we look for in getMilestoneKeyFromCalendarNotes
    return "\n=== id:" + milestoneItem.key + " ===\n";
  }

  /* Returns the milestone key found in the notes, else undefined */
  const getMilestoneKeyFromCalendarNotes = (notes) => {
    const lineWithKeyRegex = /^=== id:(.+) ===$/; // This matches what we did in getCalendarNotesLineWithMilestoneKey
    const lines = notes.split("\n");
    for (let line of lines) {
      const m = line.match(lineWithKeyRegex);
      if (m) {
        // ,[0] is whole match.  [1] is first group (and we have just one), which should be the key
        return m[1];
      }
    }
    return undefined
  }

  const createCalendarMilestoneEntry = async (milestoneItem) => {

    /* On Android, allday events need to be set to midnight and timezone utc.
     Otherwise the start and/or end date might be wrong.
     It can even look right on the calendar, then if you edit the entry and look at the dates it has a different date and is wrong.
     
     I don't know if ios behaves this way though.  It needs tested.
     */


    const milestoneKey = milestoneItem.key;
    // Set to UTC midnight for allday events. Android needs it that way.
    const start = milestoneItem.event.isFullDay ? new Date(milestoneItem.time).setUTCHours(0, 0, 0, 0) : new Date(milestoneItem.time);
    const tz = milestoneItem.event.isFullDay ? "UTC" : Localization.timezone;

    const end = start;

    // 8am on the day of event if full day, else 2 hours before
    const offsetMinutes = milestoneItem.event.isFullDay ? 8 * 60 : -120;


    const verboseDesc = getMilestoneVerboseDescription(milestoneItem);

    const eventId = await Calendar.createEventAsync(calendarId, {
      alarms: [{ relativeOffset: offsetMinutes }],
      notes: verboseDesc + "\n\nThis event was created by the Fun Times app."+getCalendarNotesLineWithMilestoneKey(milestoneItem),
      title: verboseDesc,
      startDate: start,
      endDate: end,
      allDay: milestoneItem.event.isFullDay,
      timeZone: tz, // string, required on Android
      endTimeZone: tz,
    });
    const mapEntry = {};
    mapEntry[milestoneKey] = eventId;
    const newMap = Object.assign({}, calendarMilestoneEventsMap, mapEntry);
    setCalendarMilestoneEventsMap(newMap);
  }

  const removeCalendarMilestonEntry = (milestoneItem) => {
    const milestoneKey = milestoneItem.key;
    const calendarEventId = calendarMilestoneEventsMap[milestoneKey];
    if (calendarEventId) {
      const newMap = Object.assign({}, calendarMilestoneEventsMap);
      delete newMap[milestoneKey];
      setCalendarMilestoneEventsMap(newMap);
      // Not waiting around.  It can happen later.
      Calendar.deleteEventAsync(calendarEventId, { futureEvents: true });
    }
  }

  const toggleCalendarMilestoneEvent = (milestoneItem) => {

    const milestoneKey = milestoneItem.key;
    const calendarEventId = calendarMilestoneEventsMap[milestoneKey];
    if (calendarEventId) {
      removeCalendarMilestonEntry(milestoneItem);
    } else {
      createCalendarMilestoneEntry(milestoneItem);
    }
  }



  return (
    <CalendarContext.Provider value={{
      isCalendarReady: isCalendarReady,
      toggleCalendarMilestoneEvent: toggleCalendarMilestoneEvent,
      getMilestoneVerboseDescription: getMilestoneVerboseDescription,
      getIsMilestoneInCalendar: getIsMilestoneInCalendar,
      removeFunTimesCalendar: removeFunTimesCalendar,
      getMilestoneOnCalendarColorStyle: getMilestoneOnCalendarColorStyle,
      getMilestoneNotOnCalendarColorStyle: getMilestoneNotOnCalendarColorStyle,
      getMilestoneOnCalendarCardStyle: getMilestoneOnCalendarCardStyle,
      getMilestoneNotOnCalendarCardStyle: getMilestoneNotOnCalendarCardStyle,
    }}>
      {props.children}
    </CalendarContext.Provider>
  );

}

export const CalendarProvider = MyCalendarProvider;

export default CalendarContext;
