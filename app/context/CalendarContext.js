import React, { useState, useEffect, createContext, useContext, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import * as Calendar from 'expo-calendar'
import * as Localization from 'expo-localization'
import moment from 'moment-timezone'

import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import { getDisplayStringForDate, getDisplayStringForTime, getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import MyThemeContext from './MyThemeContext'

export const howManyDaysAheadCalendar = 365; // How far ahead should we calendar things

export const howManyDaysAgoCalendar = 3; // So user can see a little before today

export const numMillisecondsPerDay = 24 * 60 * 60000;

const CALENDAR_TITLE = 'Fun Times Milestones Calendar';


export const calendarNotificationDaytime = 2;
export const calendarNotificationNighttimeHoursPm = 8; // TBD - to localize this, do it differently so can use 24 hour clock
export const calendarNotificationAllDayHoursAm = 9;

// Assuming not changing timezones while app is open
const TIMEZONEOFFSET_MILLISECONDS = (new Date()).getTimezoneOffset() * 60000;


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


export function getIsMilestoneAllDay(milestoneItem) {
  return milestoneItem.event.isAllDay && (['hours', 'minutes', 'seconds'].indexOf(milestoneItem.unit) < 0);
}

/* 
  Get something to describe the milestone that can be copied to the clipboard.
  milestoneTime - milliseconds, when is the milestone
  isAllDay - boolean, true if milestone is considered all day
  description - what this milestone commemorates
  */
const makeMilestoneClipboardContent = (milestoneTime, isAllDay, description) => {

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
  const allDay = getIsMilestoneAllDay(milestoneItem);
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
  milestoneColorStyle: {},
  milestoneCardStyle: {},
  areAnyMilestonesOnCalendar: () => { },
  changeCalendarColorAsync: () => { },
});

/**
 * Provides a way to see attributes about the device.
 */
function MyCalendarProvider(props) {

  const myThemeContext = useContext(MyThemeContext);

  const initialColor = myThemeContext.colors.calendar;


  const [calendarId, setCalendarId] = useState(null);
  const [calendarMilestoneEventsMap, setCalendarMilestoneEventsMap] = useState(null);
  const [wrappedCalendarEventsList, setWrappedCalendarEventsList] = useState([]);
  const [isCalendarReady, setIsCalendarReady] = useState(false);


  /* Memoize these for performance */
  const milestoneColorStyle = useMemo(() => {
    const colorToUse = myThemeContext.colors.calendar;
    return {
      color: myThemeContext.getContrastFontColor(colorToUse),
      backgroundColor: colorToUse,
    }
  }, [myThemeContext.colors.calendar, myThemeContext.isThemeDark]);

  const milestoneCardStyle = useMemo(() => {
    const colorToUse = myThemeContext.colors.calendar;
    return {
      color: myThemeContext.getContrastFontColor(colorToUse),
      backgroundColor: colorToUse,
      borderColor: colorToUse,
      borderWidth: 0,
      borderStyle: 'solid',
    }
  }, [myThemeContext.colors.calendar, myThemeContext.isThemeDark]);


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
          myThemeContext.setCalendarColor(cal.color); // Set theme calendar color to what it is.  On ios user could change it on their calendar. Let's use it.
          logger.log('We found the calendar.', cal);
          break;
        }
      }
      logger.log('Here are all your calendars:', calendars);
      if (!calFound) {
        /* TBD - we should ask user and get permission before creating.  And, we should let them pick color,
          or change color later (by destroying and recreating for Android).
        */

        logger.log("Didn't find calendar, so we'll create one.");
        const colorToUse = initialColor;
        theCalendarId = await createCalendarAsync(colorToUse);

      }
      setCalendarId(theCalendarId);

      // Get events
      await getCalendarEventsAsync(theCalendarId);
      setIsCalendarReady(true);
    } else {
      logger.warn("We don't have permission to use calendar.");
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


  async function createCalendarAsync(hexcolor) {
    const defaultCalendarSource =
      Platform.OS === 'ios'
        ? await getDefaultCalendarSourceAsync()
        : { isLocalAccount: true, name: 'Fun Times Calendar' };

    const newCalendarId = await Calendar.createCalendarAsync({
      title: CALENDAR_TITLE,
      color: hexcolor,
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

  /* 
  Use this to change color on the device's calendar, and it 
  also sets the theme for the color shown in this app. 

 Android doesn't support calendar color change, so we
 replace the old calendar with a new one in the right color.

 Also note that the colors shown in the device calendar app
 are slightly different than what its passed.
 Maybe they have fixed colors and they use a closest match??
 I haven't investigated why.
  */
  const changeCalendarColorAsync = async (hexcolor) => {

    if (Platform.OS === 'ios') {
      // TBD - test this on ios
      await Calendar.updateCalendarAsync(calendarId, { color: hexcolor });
    } else {
      /* For Android change name of calendar, create a new one and add events, then delete old calendar.
        Note that if they've added additional personal things on the calendar this would blow them away. */

      // Change name of old calendar
      const oldCalendarId = calendarId;
      await Calendar.updateCalendarAsync(oldCalendarId, { title: "OLD " + CALENDAR_TITLE });

      // Create new
      const newCalendarId = await createCalendarAsync(hexcolor);

      // Add events to new calendar, makeing a new calendarMilestoneEventsMap and new wrappedCalendarEventsList
      const newWrappedCalendarEventsList = [];
      const newMap = Object.assign({}, calendarMilestoneEventsMap);

      for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {
        const wrappedCalendarEvent = wrappedCalendarEventsList[idx];
        const milestoneKey = wrappedCalendarEvent.milestoneKey; // this might not exist (if they added stuff to the calendar)
        if (wrappedCalendarEvent.isOnCalendar) {
          const newCalendarEvent = Object.assign({}, wrappedCalendarEvent.calendarEvent);
          delete newCalendarEvent.id;
          const eventId = await Calendar.createEventAsync(newCalendarId, newCalendarEvent);
          newCalendarEvent.id = eventId;
          const newWrappedCalendarEvent = wrapCalendarEventObject(newCalendarEvent, true, milestoneKey);
          if (milestoneKey) {
            newMap[milestoneKey] = eventId;
          }
          newWrappedCalendarEventsList.push(newWrappedCalendarEvent);
        } else {
          newWrappedCalendarEventsList.push(wrappedCalendarEvent);
        }
      }

      // Remove old
      await Calendar.deleteCalendarAsync(oldCalendarId);

      // Update states
      setCalendarMilestoneEventsMap(newMap);
      setCalendarId(newCalendarId);
      myThemeContext.setCalendarColor(hexcolor);
      setWrappedCalendarEventsList(newWrappedCalendarEventsList);
    }
  }

  /* Returns true if any milestones are on the calendar */
  const areAnyMilestonesOnCalendar = () => {
    for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {
      if (wrappedCalendarEventsList[idx].isOnCalendar) {
        return true;
      }
    }
    return false;
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
        logger.warn("Calendar event is ", calendarEvent);

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
    // jmr - Doesn't work with new release of expo and expo-calendar 8.2.1
    const eventId = await Calendar.createEventAsync(calendarId, newCalendarEvent);
    newCalendarEvent.id = eventId;

    /* This is a little faster than calling 
      await getCalendarEventsAsync(calendarId);
      to repopulate and sort the list and recreate the map. */
    const mapEntry = {};
    mapEntry[milestoneKey] = eventId;
    const newMap = Object.assign({}, calendarMilestoneEventsMap, mapEntry);

    const newWrappedCalendarEvent = wrapCalendarEventObject(newCalendarEvent, true, milestoneKey);
    logger.warn("New wrapped calendar event is ", newWrappedCalendarEvent);


    /* find where to insert/replace the newWrappedCalendarEvent to efficiently
      have a new sorted list */
    let newWrappedCalendarEventsList = [];
    let hasBeenAdded = false;
    for (let idx = 0; idx < wrappedCalendarEventsList.length; idx++) {
      logger.warn("wrappedCalendarEventsList[idx] is ", wrappedCalendarEventsList[idx]);

      if (hasBeenAdded) {
        // We've dealt with the new one, just add the rest
        newWrappedCalendarEventsList.push(wrappedCalendarEventsList[idx]);
      } else {

        if (newWrappedCalendarEvent.startTime === wrappedCalendarEventsList[idx].startTime &&
          newWrappedCalendarEvent.calendarEvent.title === wrappedCalendarEventsList[idx].calendarEvent.title &&
          newWrappedCalendarEvent.milestoneKey === wrappedCalendarEventsList[idx].milestoneKey) {
          /*  Don't just look at startTime being equal, because there can be more than one
            milestone with the same startTime and we want both on the calendar.
            Also, milestoneKey could be undefined (if they created their own calendar entries w/ the devices calendar app
             and see them in this app and are toggling them on/off)
             So we compare a few things. */

          /* This is an entry that was on the calendar and removed, and now we're adding it back.
            We need to replace this one with the new one.
            */
          newWrappedCalendarEventsList.push(newWrappedCalendarEvent);
          hasBeenAdded = true;
        } else {
          // Look to see if this is a new event and we're at the right idx position to add.
          if ((newWrappedCalendarEvent.startTime < wrappedCalendarEventsList[idx].startTime)
            || (newWrappedCalendarEvent.startTime === wrappedCalendarEventsList[idx].startTime &&
              idx === wrappedCalendarEventsList.length - 1)) {
            /* The startTime is before that at idx,
            or it's equal to that at idx and this is the last position 
            We do this instead of comparing startTime <= because if there are multiple events with the same
            startTime we want to add this at the end to make sure we don't miss out on a replacement. */
            // Add the new
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

    setCalendarMilestoneEventsMap(newMap);
    setWrappedCalendarEventsList(newWrappedCalendarEventsList);

  }

  /* Remove from calendarMilestoneEventsMap and mark the wrappedCalendarEvent isOnCalendar as false.
    This is more performant than taking it off the calendar and calling 
    await getCalendarEventsAsync(calendarId);
    to repopulate and sort the list and recreate the map.
    Additionally, leaving it in wrappedCalendarEventsList allows the user to still see what they just 
    took off and to add it back.
  */
  const removeCalendarEventFromCalendarAsync = async (calendarEventId, milestoneKey) => {
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
      await Calendar.deleteEventAsync(calendarEventId, { futureEvents: true });

    }

  }



  const toggleMilestoneScreenCalendarEvent = (milestoneItem) => {

    const milestoneKey = milestoneItem.key;
    const calendarEventId = calendarMilestoneEventsMap[milestoneKey];
    if (calendarEventId) {
      removeCalendarEventFromCalendarAsync(calendarEventId, milestoneKey);
    } else {

      /* On Android, allDay events need to be set to midnight and timezone utc.
       Otherwise the start and/or end date might be wrong.
       It can even look right on the calendar, then if you edit the entry and look at the dates it has a different date and is wrong.
       
       I don't know if ios behaves this way though.  It needs tested.
       */

      const milestoneKey = milestoneItem.key;
      // Set to UTC midnight for allDay events. Android needs it that way.
      const allDay = getIsMilestoneAllDay(milestoneItem);

      const start = allDay ? new Date(new Date(milestoneItem.time).setUTCHours(0, 0, 0, 0)) : (new Date(milestoneItem.time));
      // for allDay, set end 24 hours later.  Otherwise end is start.
      const end = allDay ? new Date(new Date(milestoneItem.time + 24 * 60 * 60000).setUTCHours(0, 0, 0, 0)) : start;

      /* Set different alert times depending on whether it's 
        all day, a day-time milestone, or a night-time milestone */
      let offsetMinutes = calendarNotificationAllDayHoursAm * 60; // All-day
      if (!allDay) {

        const timeMoment = moment(start);

        // find the notification time for the night before
        const nightBefore = moment(start).add(-1, 'days').hours(calendarNotificationNighttimeHoursPm + 12).minutes(0).seconds(0);
        const minutesBefore = timeMoment.diff(nightBefore, 'minutes');

        if (minutesBefore > (9 + 12 - calendarNotificationNighttimeHoursPm) * 60) {
          // compare time with 9am the next day.  If we're later than that, this is a day-time notification
          offsetMinutes = -60 * calendarNotificationDaytime;
        } else {
          // This is a night time notification, and we should do it the night before
          offsetMinutes = -1 * minutesBefore;
        }

      }

      const verboseDesc = getMilestoneVerboseDescription(milestoneItem);

      const newCalendarEvent = {
        alarms: [{ relativeOffset: offsetMinutes, method: Calendar.AlarmMethod.ALERT }],
        notes: verboseDesc + "\n\nThis event was created by the Fun Times app." + getCalendarNotesLineWithMilestoneKey(milestoneItem),
        title: verboseDesc,
        startDate: start,
        endDate: end,
        allDay: allDay,
        timeZone: allDay ? "UTC" : Localization.timezone, // string, required on Android
        endTimeZone: null, // string, Android but I could only get alarm to work if this is null
      };
      addCalendarEventToCalendarAsync(newCalendarEvent, milestoneKey);
    }
  }

  const toggleCalendarScreenCalendarEvent = (wrappedCalendarEvent) => {

    const milestoneKey = wrappedCalendarEvent.milestoneKey; // this might not exist (if they added stuff to the calendar)
    const calendarEventId = wrappedCalendarEvent.id;
    if (wrappedCalendarEvent.isOnCalendar) {
      removeCalendarEventFromCalendarAsync(calendarEventId, milestoneKey);
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
      milestoneColorStyle: milestoneColorStyle,
      milestoneCardStyle: milestoneCardStyle,
      changeCalendarColorAsync: changeCalendarColorAsync,
      areAnyMilestonesOnCalendar: areAnyMilestonesOnCalendar,
    }}>
      {props.children}
    </CalendarContext.Provider>
  );

}

export const CalendarProvider = MyCalendarProvider;

export default CalendarContext;
