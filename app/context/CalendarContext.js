import React, { useState, useEffect, createContext } from 'react'
import * as Calendar from 'expo-calendar'
import * as Localization from 'expo-localization'

import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import { getDisplayStringDateTimeForEvent } from '../utils/Utils'


export const howManyDaysAheadToCalendar = 365; // How far ahead should we calendar things


const CALENDAR_TITLE = 'Fun Times Milestones Calendar';

// This created with defaults.  The provider sets the real values using value prop.
const CalendarContext = createContext({
  isCalendarReady: false,
  toggleCalendarMilestoneEvent: () => { },
  getMilestoneVerboseDescription: () => { },
  getIsMilestoneInCalendar: () => { },
  removeFunTimesCalendar: () => { },
});


/* jmr - For now, this is just for debug.
If do this, then things don't work because we assume after we create calendar it exists.
 But, it would need re-created.
 */
async function removeFunTimesCalendar() {
  const calendars = await Calendar.getCalendarsAsync();
  const filtered = calendars.filter(each => each.title === CALENDAR_TITLE);
  logger.warn("Deleting calendar ");
  if (filtered.length) {
    await Calendar.deleteCalendarAsync(filtered[0].id);
  }

}

/**
 * Provides a way to see attributes about the device.
 */
function MyCalendarProvider(props) {

  [havePermission, setHavePermission] = useState(false);
  [calendarId, setCalendarId] = useState(null);
  [calendarMilestoneEventsMap, setCalendarMilestoneEventsMap] = useState(null);
  [isCalendarReady, setIsCalendarReady] = useState(false);


  useEffect(() => {

    (async () => {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        setHavePermission(true);

        // Get calendar
        const calendars = await Calendar.getCalendarsAsync();
        let calFound = false;
        let theCalendarId = null;
        for (let cal of calendars) {
          if (cal.title === CALENDAR_TITLE) {
            calFound = true;
            theCalendarId = cal.id;

            logger.warn('We found the calendar.', cal.id);
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
          tmpcalendarMilestoneEventsMap[calendarEvent.title] = calendarEvent.id;
        }
        setCalendarMilestoneEventsMap(tmpcalendarMilestoneEventsMap);
        setIsCalendarReady(true)

      } else {
        logger.warn("Don't have permission to use calendar.");
      }
    })();
  }, []);



  function getIsMilestoneInCalendar(milestoneItem) {
    const milestoneKey = getMilestoneEventKey(milestoneItem);
    return calendarMilestoneEventsMap && calendarMilestoneEventsMap[milestoneKey];

  }

  function getMilestoneEventKey(milestoneItem) {

    /* 
    This is similar to key used in UpcomingMilestonesList.  But it doesn't need to be same.
    Combination of event title and time
    would NOT be unique if a time had more than one representation
    that was interesting. So, description is also added.
    */
    const theKey = 'key_' + milestoneItem.event.title + "_" + milestoneItem.time + "_" + milestoneItem.description
    return theKey;
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
    const newCalendarId = await Calendar.createCalendarAsync({
      title: CALENDAR_TITLE,
      color: 'blue', // jmr - should use app color, or let user pick
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
    const endDate = new Date(nowDate.getTime() + (howManyDaysAheadToCalendar + 1) * 24 * 600000); // get one more day's worth just in case.
    const calendarEventObjects = await Calendar.getEventsAsync([theCalendarId], nowDate, endDate);

    return calendarEventObjects;
  }

  logger.log("Localization.timezone is ", Localization.timezone);


  const createCalendarMilestoneEntry = async (milestoneItem) => {

    /* On Android, allday events need to be set to midnight and timezone utc.
     Otherwise the start and/or end date might be wrong.
     It can even look right on the calendar, then if you edit the entry and look at the dates it has a different date and is wrong.
     
     I don't know if ios behaves this way though.  It needs tested.
     */


    const milestoneKey = getMilestoneEventKey(milestoneItem);
    // Set to UTC midnight for allday events. Android needs it that way.
    const start = milestoneItem.event.isFullDay ? new Date(milestoneItem.time).setUTCHours(0, 0, 0, 0) : new Date(milestoneItem.time);
    const tz = milestoneItem.event.isFullDay ? "UTC" : Localization.timezone;

    const end = start;

    // 8am on the day of event if full day, else 2 hours before
    const offsetMinutes = milestoneItem.event.isFullDay ? 8 * 60 : -120;


    const verboseDesc = getMilestoneVerboseDescription(milestoneItem);

    const eventId = await Calendar.createEventAsync(calendarId, {
      alarms: [{ relativeOffset: offsetMinutes }],
      notes: verboseDesc + "\nThis event was created by the Fun Times app.",
      title: verboseDesc,
      startDate: start,
      endDate: end,
      allDay: milestoneItem.event.isFullDay,
      timeZone: tz, // string, required on Android
    });
    const mapEntry = {};
    mapEntry[milestoneKey] = eventId;
    const newMap = Object.assign({}, calendarMilestoneEventsMap, mapEntry);
    setCalendarMilestoneEventsMap(newMap);
  }

  const removeCalendarMilestonEntry = (milestoneItem) => {
    const milestoneKey = getMilestoneEventKey(milestoneItem);
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

    const milestoneKey = getMilestoneEventKey(milestoneItem);
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
    }}>
      {props.children}
    </CalendarContext.Provider>
  );

}

export const CalendarProvider = MyCalendarProvider;

export default CalendarContext;
