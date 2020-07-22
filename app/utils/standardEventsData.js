
import moment from 'moment-timezone'
import * as Localization from 'expo-localization'

import Event, { TAGS } from './Event'
import * as logger from '../utils/logger'


/* TBD - Need an easy way for users to see list of new events added to this list,
especially the ones that will be on by default. */

/* Some of the times depend on the user's time zone (e.g. New Year's Day)
    and some do not (e.g. start of Super Bowl).
    Creating with moment.tz() helps with that.
    TBD: Some (or all) of these are only interesting in future. If in past, ignore.
    TBD: Some I should calculate the next one programatically (e.g. Christmas)
    TBD: Some custom events need recognized both past and maybe also the upcoming (e.g. birthday)

    Perhaps in future look in to using moment-holiday
    And add own custom holidays to that.
    (An updated version that works with webpack is https://github.com/datadyne-marketing/moment-holiday)
    NOTE: I looked and you can run a method to get a list of holidays, but it just returns
    the dates not the keywords like the name of the holiday.  Not sure if it's possible to get those
    or not.  It was taking too much time so I decided I'll figure it out later.

    As an alternative, this has lots of holidays, but I don't see how to use keywords for searching.
    https://github.com/commenthol/date-holidays

*/

const events = [];

const nowMoment = moment(new Date());

/* If theMoment is in past, set it to the future by modifying the year (which may or may not be this year) */
function getNextMomentForDate(theMoment) {
    let futureMoment = theMoment.clone();
    while (futureMoment.isBefore(nowMoment, "minute")) {
        futureMoment = futureMoment.year(futureMoment.year() + 1);
    }
    return futureMoment;
}

events.push(new Event({
    title: "Christmas 🎄", // What user might see (later need to localize)
    key: "Christmas", // Each holiday needs unique key.  Specify key if different than title.
    isSelectedByDefault: false,
    epochMillis: getNextMomentForDate(moment("2019-12-25 0:00", 'YYYY-MM-DD HH:mm')).valueOf(), // Day and/or time it starts
    ignoreIfPast: true, // don't use this if it's past. (Eventually I'll update code above to do next one)
    keywords: ['christmas', 'x-mas', 'xmas'], // Have these all lower case
    isAllDay: true, // If event is whole day, not a specific time
    color: "red",
    tags: [TAGS.HOLIDAY, TAGS.RELIGION],
    useDateAndTimeInMilestones: true,
    useManualEntryInMilestones: false,
    manualEntryNumbers: [],
}));
events.push(new Event({
    title: "New Year's Day 🎉",
    key: "New Year's Day",
    isSelectedByDefault: true,
    // If don't clone it will modify nowMoment and mess up other calculations
    epochMillis: nowMoment.clone().tz(Localization.timezone).startOf('year').add(1, 'years').valueOf(),
    isAllDay: false,
    color: "silver",
    tags: [TAGS.HOLIDAY],
    useDateAndTimeInMilestones: true,
    useManualEntryInMilestones: false,
    manualEntryNumbers: [],
}));
events.push(new Event({
    title: "Pi Day 🥧",
    key: "Pi Day",
    isSelectedByDefault: false,
    epochMillis: getNextMomentForDate(moment("2005-03-14 1:59:25", 'YYYY-MM-DD HH:mm:ss', Localization.timezone)).valueOf(),
    ignoreIfPast: true,
    isAllDay: false, // True if want to calculate times to 1:59:25
    color: "orange",
    tags: [TAGS.QUIRKY, 'pi'],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: true,
    manualEntryNumbers: [], // Not using 3.14 because it would likely create duplicate entry
}));
events.push(new Event({
    title: "US Independence Day 🇺🇸",
    key: "US Independence Day",
    isSelectedByDefault: false,
    epochMillis: getNextMomentForDate(moment("2020-07-04 0:00", 'YYYY-MM-DD HH:mm')).valueOf(),
    ignoreIfPast: true,
    color: "red",
    tags: [TAGS.HOLIDAY],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: false,
    manualEntryNumbers: [],
}));
events.push(new Event({
    title: "US Independence Day 1776 🦅",
    key: "US Independence Day 1776",
    isSelectedByDefault: false,
    epochMillis: moment("1776-07-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: false,
    color: "red",
    tags: [TAGS.HOLIDAY],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: false,
    manualEntryNumbers: [],
}));
events.push(new Event({
    title: "May the Fourth (Star Wars Day)",
    key: "Star Wars Day",
    isSelectedByDefault: false,
    epochMillis: getNextMomentForDate(moment("2020-05-04 0:00", 'YYYY-MM-DD HH:mm')).valueOf(),
    ignoreIfPast: true,
    color: "black",
    tags: [TAGS.QUIRKY],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: false,
    manualEntryNumbers: [],
}));

// These need updated by hand each year (for now)
events.push(new Event({
    title: "Super Bowl LV 🏈",
    key: "Super Bowl",
    isSelectedByDefault: true,
    isAllDay: false,
    epochMillis: moment.tz("2021-02-07 18:30", 'YYYY-MM-DD HH:mm', 'America/New_York').valueOf(),
    ignoreIfPast: true,
    color: "brown",
    tags: [TAGS.SPORTS],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: true,
    manualEntryNumbers: [55],
}));
events.push(new Event({
    title: "Easter 🐇⛪",
    key: "Easter",
    isSelectedByDefault: false,
    epochMillis: moment("2021-04-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "purple",
    tags: [TAGS.HOLIDAY, TAGS.RELIGION],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: false,
    manualEntryNumbers: [],
}));
events.push(new Event({
    title: "March Madness Tournament Begins 🏀",
    key: "March Madness Tournament Begins",
    isSelectedByDefault: true,
    epochMillis: moment("2021-03-16 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "orange",
    tags: [TAGS.SPORTS],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: true,
    manualEntryNumbers: [64],
}));
events.push(new Event({
    title: "March Madness Final Four 🏀🏆",
    key: "March Madness Final Four",
    isSelectedByDefault: false,
    epochMillis: moment("2021-04-03 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "orange",
    tags: [TAGS.SPORTS],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: true,
    manualEntryNumbers: [4, 64, 68],
}));
events.push(new Event({
    title: "Thanksgiving 🦃",
    key: "Thanksgiving",
    isSelectedByDefault: false,
    epochMillis: moment("2020-11-26 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "brown",
    tags: [TAGS.HOLIDAY],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: false,
    manualEntryNumbers: [],
}));

events.push(new Event({
    title: "US Presidential Election 🗳️",
    key: "US Presidential Election",
    isSelectedByDefault: true,
    epochMillis: moment("2020-11-03 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "red",
    tags: [TAGS.QUIRKY],
    useDateAndTimeInMilestones: false,
    useManualEntryInMilestones: true,
    manualEntryNumbers: [2020, 46], // A new president would be the 46th
}));

/*
October 23, denoted 10/23 in the US, is recognized by some as Mole Day.[24] It is an informal holiday in honor of the unit among chemists. 
The date is derived from the Avogadro number, which is approximately 6.022×1023. It starts at 6:02 a.m. and ends at 6:02 p.m. 
Alternatively, some chemists celebrate June 2 (06/02), June 22 (6/22), or 6 February (06.02), a reference to the 6.02 or 6.022 part of the constant
*/


export const standardEventsData = events;

