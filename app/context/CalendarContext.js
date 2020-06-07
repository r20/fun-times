import React, { useState, useEffect, createContext } from 'react'
import { StyleSheet } from 'react-native'
import * as Calendar from 'expo-calendar'
import * as Localization from 'expo-localization'
import moment from 'moment-timezone'

import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import { getDisplayStringForDate, getDisplayStringForTime, getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import theme, { getContrastFontColor } from '../style/theme'

export const howManyDaysAheadCalendar = 365; // How far ahead should we calendar things

export const howManyDaysAgoCalendar = 3; // So user can see a little before today

export const numMillisecondsPerDay = 24 * 60 * 60000;

const CALENDAR_TITLE = 'Fun Times Milestones Calendar';

const initialColor = theme.DEFAULT_CALENDAR_COLOR;



// Assuming not changing timezones while app is open
const TIMEZONEOFFSET_MILLISECONDS = (new Date()).getTimezoneOffset() * 60000;

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


const nowDate = new Date();
const nowTime = nowDate.getTime();


export const getMilestoneVerboseDescription = (milestoneItem) => {
  const event = milestoneItem.event;
  const eventDisplayDateTime = getDisplayStringDateTimeForEvent(event);

  const isEventInFuture = (event.epochMillis > nowTime);
  const i18nKey = isEventInFuture ? "milestoneDescriptionFuture" : "milestoneDescriptionPast";
  const desc = i18n.t(i18nKey, { milestoneDesciption: i18n.t(milestoneItem.unit, { someValue: milestoneItem.description }), eventTitle: event.title, eventDateTime: eventDisplayDateTime });
  return desc;
}



const wrappedCalendarEventListSorter = (a, b) => { return (a.startTime - b.startTime); }

function wrapCalendarEventObject(calendarEvent, isOnCalendar, milestoneKey) {

  let specialDisplayDateTime;

  let startTime = (new Date(calendarEvent.startDate)).getTime();
  if (calendarEvent.allDay) {
    // allday events start at 12:00am UTC, so need to add offset so it's in today's date (e.g. if in US)
    specialDisplayDateTime = getDisplayStringDateTimeForEpoch(startTime + TIMEZONEOFFSET_MILLISECONDS, true);
  } else {
    // non allDay events start at the right time for the device's timezone
    specialDisplayDateTime = getDisplayStringDateTimeForEpoch(startTime, false);
  }


  // Make an object that wraps calendarEvent
  return {
    calendarEvent: calendarEvent, // hang on to original
    whenDescription: specialDisplayDateTime,
    whatDescription: calendarEvent.title, // The title is the description
    isOnCalendar: isOnCalendar,
    milestoneKey: milestoneKey, // possible it doesn't exist if the user created an event not with app. Use id as a key for React iterables.
    key: calendarEvent.id,
    id: calendarEvent.id,
    startTime: startTime,
    allDay: calendarEvent.allDay,
  };
}


export function getIsMilestoneFullDay(milestoneItem) {
  return milestoneItem.event.isFullDay && (['hours', 'minutes', 'seconds'].indexOf(milestoneItem.unit) < 0);
}

/* 
  Get something to describe the milestone that can be copied to the clipboard.
  milestoneTime - milliseconds, when is the milestone
  isAllDay - boolean, true if milestone is considered all day
  description - what this milestone commemorates
  */
const makeMilestoneClipboardContent = (milestoneTime, isAllDay, description) => {

  logger.warn("jmr --- getting something for clipboard");

  const startMoment = moment(milestoneTime);
  const nowMoment = moment(new Date());

  const isToday = startMoment.isSame(new Date(), "day");
  const isPast = startMoment.isBefore(nowMoment);

  const dayValue = getDisplayStringForDate(startMoment.toDate());
  const timeValue = getDisplayStringForTime(startMoment.toDate());

  if (isToday) {
    if (isAllDay) {
      return i18n.t('milestoneTodayDescriptionWithDayOnly', { dayValue: dayValue, whatValue: description });
    } else if (isPast) {
      return i18n.t('milestoneTodayPastDescriptionWithDayAndTime', { dayValue: dayValue, timeValue: timeValue, whatValue: description });
    } else {
      return i18n.t('milestoneTodayFutureDescriptionWithDayAndTime', { dayValue: dayValue, timeValue: timeValue, whatValue: description });
    }
  } else if (isPast) {
    if (isAllDay) {
      return i18n.t('milestonePastDescriptionWithDayOnly', { dayValue: dayValue, whatValue: description });
    } else {
      return i18n.t('milestonePastDescriptionWithDayAndTime', { dayValue: dayValue, timeValue: timeValue, whatValue: description });
    }
  } else {
    // It's in the future
    if (isAllDay) {
      return i18n.t('milestoneFutureDescriptionWithDayOnly', { dayValue: dayValue, whatValue: description });
    }
    return i18n.t('milestoneFutureDescriptionWithDayAndTime', { dayValue: dayValue, timeValue: timeValue, whatValue: description });
  }
}


export const makeMilestoneClipboardContentForMilestone = (milestoneItem) => {
  const allDay = getIsMilestoneFullDay(milestoneItem);
  const verboseDesc = getMilestoneVerboseDescription(milestoneItem);
  return makeMilestoneClipboardContent(milestoneItem.time, allDay, verboseDesc);

}

export const makeMilestoneClipboardContentForWrappedCalendarEvent = (wrappedCalendarEvent) => {
  if (!wrappedCalendarEvent) {
    return '';
  }
  /* All day events are at start of day UTC time so need to add offset to get right day and time in this timezone */
  const startTime = wrappedCalendarEvent.allDay ? wrappedCalendarEvent.startTime + TIMEZONEOFFSET_MILLISECONDS : wrappedCalendarEvent.startTime;
  return makeMilestoneClipboardContent(startTime, wrappedCalendarEvent.allDay, wrappedCalendarEvent.whatDescription);
}


// This created with defaults.  The provider sets the real values using value prop.
const CalendarContext = createContext({
  isCalendarReady: false,
  wrappedCalendarEventsList: [],
  toggleMilestoneScreenCalendarEvent: () => { },
  toggleCalendarScreenCalendarEvent: () => { },
  getIsMilestoneInCalendar: () => { },
  removeFunTimesCalendarEventsAsync: () => { },
  getMilestoneOnCalendarColorStyle: () => { },
  getMilestoneNotOnCalendarColorStyle: () => { },
  getMilestoneOnCalendarCardStyle: () => { },
  getMilestoneNotOnCalendarCardStyle: () => { },
});

/**
 * Provides a way to see attributes about the device.
 */
function MyCalendarProvider(props) {

  [calendarId, setCalendarId] = useState(null);
  [calendarMilestoneEventsMap, setCalendarMilestoneEventsMap] = useState(null);
  [wrappedCalendarEventsList, setWrappedCalendarEventsList] = useState([]);
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

  const getCalendarReadyAsync = async () => {
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
          logger.log('We found the calendar.', cal);
          break;
        }
      }
      logger.log('Here are all your calendars:', calendars);
      if (!calFound) {
        /* jmr- we should ask user and get permission before creating.  And, we should let them pick color.
        */

        logger.log("Didn't find calendar, so we'll create one.");
        theCalendarId = await createCalendarAsync();

      }
      setCalendarId(theCalendarId);

      // Get events
      await getCalendarEventsAsync(theCalendarId);
      setIsCalendarReady(true);
    } else {
      logger.warn("Don't have permission to use calendar.");
    }
  }

  /* We set state later asynchronously after query */
  useEffect(() => {
    getCalendarReadyAsync();
  }, []);


  /* Remove the calendar events by removing the calendar
    and recreating it.
   */
  async function removeFunTimesCalendarEventsAsync() {
    const calendars = await Calendar.getCalendarsAsync();
    const filtered = calendars.filter(each => each.title === CALENDAR_TITLE);
    logger.warn("Deleting calendar ");
    if (filtered.length) {
      await Calendar.deleteCalendarAsync(filtered[0].id);
      setIsCalendarReady(false);
      await getCalendarReadyAsync();
    }

  }

  function getIsMilestoneInCalendar(milestoneItem) {
    const milestoneKey = milestoneItem.key;
    return calendarMilestoneEventsMap && (calendarMilestoneEventsMap[milestoneKey] !== undefined);
  }



  async function getDefaultCalendarSourceAsync() {
    const calendars = await Calendar.getCalendarsAsync();
    const defaultCalendars = calendars.filter(each => each.source.name === 'Default');
    return defaultCalendars[0].source;
  }

  async function createCalendarAsync() {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSourceAsync()
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



  const getCalendarEventsAsync = async (theCalendarId) => {
    const endDate = new Date(nowTime + (howManyDaysAheadCalendar + 1) * numMillisecondsPerDay); // get one more day's worth just in case.
    const startDate = new Date(nowTime - (howManyDaysAgoCalendar + 1) * numMillisecondsPerDay);
    logger.log('Searching calendar ', theCalendarId, " between ", startDate.toLocaleDateString(), "and ", endDate.toLocaleDateString());
    const calendarEventObjects = await Calendar.getEventsAsync([theCalendarId], startDate, endDate);

    /* This would mean we only get events in the time span, not all events. But startDate and endDate are required.  This is ok though.
     Some older events won't show.  There shouldn't be any beyond endDate unless they changed time or created them on their own. */

    let tmpcalendarMilestoneEventsMap = {};
    let tmpwrappedCalendarEventsList = [];
    if (calendarEventObjects) {
      for (let calendarEvent of calendarEventObjects) {
        const milestoneKey = getMilestoneKeyFromCalendarNotes(calendarEvent.notes);
        if (milestoneKey) {
          tmpcalendarMilestoneEventsMap[milestoneKey] = calendarEvent.id;
        }
        logger.log("Calendar event is ", calendarEvent);

        // Make an object that wraps calendarEvent
        tmpwrappedCalendarEventsList.push(wrapCalendarEventObject(calendarEvent, true, milestoneKey));
      }
      tmpwrappedCalendarEventsList = tmpwrappedCalendarEventsList.sort(wrappedCalendarEventListSorter);
    }

    setCalendarMilestoneEventsMap(tmpcalendarMilestoneEventsMap);
    setWrappedCalendarEventsList(tmpwrappedCalendarEventsList);

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
    if (notes) {
      const lineWithKeyRegex = /^=== id:(.+) ===$/; // This matches what we did in getCalendarNotesLineWithMilestoneKey
      const lines = notes.split("\n");
      for (let line of lines) {
        const m = line.match(lineWithKeyRegex);
        if (m) {
          // ,[0] is whole match.  [1] is first group (and we have just one), which should be the key
          return m[1];
        }
      }
    }
    return undefined
  }

  /* Add it to calendar and change isOnCalendar. The id will change too. */
  const addCalendarEventToCalendarAsync = async (calendarEvent, milestoneKey) => {
    const newCalendarEvent = Object.assign({}, calendarEvent);
    delete newCalendarEvent.id;
    const eventId = await Calendar.createEventAsync(calendarId, newCalendarEvent);
    newCalendarEvent.id = eventId;

    /* This is a little faster than calling 
      await getCalendarEventsAsync(calendarId);
      to repopulate and sort the list and recreate the map. */
    const mapEntry = {};
    mapEntry[milestoneKey] = eventId;
    const newMap = Object.assign({}, calendarMilestoneEventsMap, mapEntry);
    setCalendarMilestoneEventsMap(newMap);

    const newWrappedCalendarEvent = wrapCalendarEventObject(newCalendarEvent, true, milestoneKey);
    logger.warn("New wrapped calendar event is ", newWrappedCalendarEvent);


    /* find where to insert/replace the newWrappedCalendarEvent to efficiently
      have a new sorted list */
    let newWrappedCalendarEventsList = [];
    let hasBeenAdded = false;
    for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {
      if (hasBeenAdded) {
        // We've dealt with the new one, just add the rest
        newWrappedCalendarEventsList.push(wrappedCalendarEventsList[idx]);
      } else {

        if (newWrappedCalendarEvent.milestoneKey === wrappedCalendarEventsList[idx].milestoneKey) {
          /* We need to replace this one with the new one
            Don't just look at startTime being equal, because there can be more than one
            milestone with the same startTime and we want both on the calendar. */
          newWrappedCalendarEventsList.push(newWrappedCalendarEvent);
          hasBeenAdded = true;
        } else {
          // This is not a replacement
          if (newWrappedCalendarEvent.startTime <= wrappedCalendarEventsList[idx].startTime) {
            // Add the new before we put 
            newWrappedCalendarEventsList.push(newWrappedCalendarEvent);
            hasBeenAdded = true;
          }
          newWrappedCalendarEventsList.push(wrappedCalendarEventsList[idx]);
        }
      }
    }
    if (!hasBeenAdded) {
      // It goes at the end
      newWrappedCalendarEventsList.push(newWrappedCalendarEvent);
    }
    setWrappedCalendarEventsList(newWrappedCalendarEventsList);

  }

  /* Remove from calendarMilestoneEventsMap and mark the wrappedCalendarEvent isOnCalendar as false.
    This is more performant than taking it off the calendar and calling 
    await getCalendarEventsAsync(calendarId);
    to repopulate and sort the list and recreate the map.
    Additionally, leaving it in wrappedCalendarEventsList allows the user to still see what they just 
    took off and to add it back.
  */
  const removeCalendarEventFromCalendar = (calendarEventId, milestoneKey) => {
    /* milestoneKey is passed in separately because it might be undefined if the
      user created their own calendar event without the app on this calendar.
      We can handle seeing those and toggling them.
      */

    if (milestoneKey) {
      const newMap = Object.assign({}, calendarMilestoneEventsMap);
      delete newMap[milestoneKey];
      setCalendarMilestoneEventsMap(newMap);
    }

    if (calendarEventId) {
      Calendar.deleteEventAsync(calendarEventId, { futureEvents: true });

      // Mark its isOnCalendar as false, but keep it in the list
      let newWrappedCalendarEventsList = [];

      for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {

        let newWrappedCalendarEvent;
        if (wrappedCalendarEventsList[idx].id === calendarEventId) {
          newWrappedCalendarEvent = Object.assign({}, wrappedCalendarEventsList[idx], { isOnCalendar: false });
        } else {
          newWrappedCalendarEvent = wrappedCalendarEventsList[idx];
        }
        newWrappedCalendarEventsList.push(newWrappedCalendarEvent);
      }
      setWrappedCalendarEventsList(newWrappedCalendarEventsList);
    }

  }



  const toggleMilestoneScreenCalendarEvent = (milestoneItem) => {

    const milestoneKey = milestoneItem.key;
    const calendarEventId = calendarMilestoneEventsMap[milestoneKey];
    if (calendarEventId) {
      removeCalendarEventFromCalendar(calendarEventId, milestoneKey);
    } else {

      /* On Android, allDay events need to be set to midnight and timezone utc.
       Otherwise the start and/or end date might be wrong.
       It can even look right on the calendar, then if you edit the entry and look at the dates it has a different date and is wrong.
       
       I don't know if ios behaves this way though.  It needs tested.
       */

      const milestoneKey = milestoneItem.key;
      // Set to UTC midnight for allDay events. Android needs it that way.
      const allDay = getIsMilestoneFullDay(milestoneItem);

      const start = allDay ? new Date(milestoneItem.time).setUTCHours(0, 0, 0, 0) : (new Date(milestoneItem.time));
      // for allDay, set end 24 hours later.  Otherwise end is start.
      const end = allDay ? new Date(milestoneItem.time + 24 * 60 * 60000).setUTCHours(0, 0, 0, 0) : start;

      // 9am on the day of event if all day, else 2 hours before
      const offsetMinutes = allDay ? 9 * 60 : -120;

      const verboseDesc = getMilestoneVerboseDescription(milestoneItem);



      const newCalendarEvent = {
        alarms: [{ relativeOffset: offsetMinutes, method: Calendar.AlarmMethod.ALERT }],
        notes: verboseDesc + "\n\nThis event was created by the Fun Times app." + getCalendarNotesLineWithMilestoneKey(milestoneItem),
        title: verboseDesc,
        startDate: start,
        endDate: end,
        allDay: allDay,
        timeZone: allDay ? "UTC" : Localization.timezone, // string, required on Android
        endTimeZone: null,
      };
      addCalendarEventToCalendarAsync(newCalendarEvent, milestoneKey);
    }
  }

  const toggleCalendarScreenCalendarEvent = (wrappedCalendarEvent) => {

    const milestoneKey = wrappedCalendarEvent.milestoneKey; // this might not exist (if they added stuff to the calendar)
    const calendarEventId = wrappedCalendarEvent.id;
    if (wrappedCalendarEvent.isOnCalendar) {
      removeCalendarEventFromCalendar(calendarEventId, milestoneKey);
    } else {
      addCalendarEventToCalendarAsync(wrappedCalendarEvent.calendarEvent, milestoneKey);
    }
  }


  return (
    <CalendarContext.Provider value={{
      isCalendarReady: isCalendarReady,
      wrappedCalendarEventsList: wrappedCalendarEventsList,
      toggleMilestoneScreenCalendarEvent: toggleMilestoneScreenCalendarEvent,
      toggleCalendarScreenCalendarEvent: toggleCalendarScreenCalendarEvent,
      getIsMilestoneInCalendar: getIsMilestoneInCalendar,
      removeFunTimesCalendarEventsAsync: removeFunTimesCalendarEventsAsync,
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
