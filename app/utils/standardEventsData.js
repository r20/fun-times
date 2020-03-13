
import moment from 'moment-timezone'

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


events.push(new Event({
    title: "Christmas", // What user might see (later need to localize)
    key: "Christmas", // Each holiday needs unique key.  Specify key if different than title.
    isSelectedByDefault: false,
    epochMillis: moment("2020-12-25 0:00", 'YYYY-MM-DD HH:mm').valueOf(), // Day and/or time it starts
    ignoreIfPast: true, // don't use this if it's past. (Eventually I'll update code above to do next one)
    keywords: ['christmas', 'x-mas', 'xmas'], // Have these all lower case
    isFullDay: true, // If event is whole day, not a specific time
    color: "red",
    /* An array of numbers that are meaningful to the event that should be used to calculate special
    milestone times.  The numbers in the date of the event should automatically be included. No need to set those.
    */
    specialNumbers: undefined,
    tags: [TAGS.HOLIDAY, TAGS.RELIGION],
}));
events.push(new Event({
    title: "Easter",
    key: "Easter",
    isSelectedByDefault: false,
    epochMillis: moment("2020-04-12 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "purple",
    tags: [TAGS.HOLIDAY, TAGS.RELIGION],
}));
events.push(new Event({
    title: "New Year's Day",
    key: "New Year's Day",
    isSelectedByDefault: true,
    epochMillis: moment().startOf('year').add(1, 'years').valueOf(),
    //        epochMillis: moment("2020-01-01 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    isFullDay: false,
    color: "silver",
    tags: [TAGS.HOLIDAY],
}));
events.push(new Event({
    title: "Super Bowl LIV",
    key: "Super Bowl",
    isSelectedByDefault: true,
    epochMillis: moment.tz("2020-02-02 18:30", 'YYYY-MM-DD HH:mm', 'America/New_York').valueOf(),
    ignoreIfPast: true,
    color: "brown",
    specialNumbers: [54],
    tags: [TAGS.SPORTS],
}));
events.push(new Event({
    title: "March Madness Tournament Begins",
    key: "March Madness Tournament Begins",
    isSelectedByDefault: true,
    epochMillis: moment("2020-03-17 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "orange",
    specialNumbers: [64, 68],
    tags: [TAGS.SPORTS],
}));
events.push(new Event({
    title: "March Madness Final Four",
    key: "March Madness Final Four",
    isSelectedByDefault: true,
    epochMillis: moment("2020-04-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "orange",
    specialNumbers: [4, 64, 68],
    tags: [TAGS.SPORTS],
}));
events.push(new Event({
    title: "Thanksgiving",
    key: "Thanksgiving",
    isSelectedByDefault: true,
    epochMillis: moment("2020-11-26 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "brown",
    tags: [TAGS.HOLIDAY],
}));
events.push(new Event({
    title: "US Independence Day",
    key: "US Independence Day",
    isSelectedByDefault: false,
    epochMillis: moment("2020-07-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "red",
    tags: [TAGS.HOLIDAY],
}));
events.push(new Event({
    title: "Pi Day",
    key: "Pi Day",
    isSelectedByDefault: false,
    epochMillis: moment("2020-03-14 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "orange",
    specialNumbers: undefined, // TBD: How should we tell it to use pi??
    tags: [TAGS.QUIRKY, 'pi'],
}));
events.push(new Event({
    title: "May the Fourth (Star Wars Day)",
    key: "Star Wars Day",
    isSelectedByDefault: false,
    epochMillis: moment("2020-05-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "black",
    tags: [TAGS.QUIRKY],
}));
events.push(new Event({
    title: "US Presidential Election",
    key: "US Presidential Election",
    isSelectedByDefault: true,
    epochMillis: moment("2020-11-03 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
    ignoreIfPast: true,
    color: "red",
    specialNumbers: [46], // A new president would be the 46th
    tags: [TAGS.QUIRKY],
}));



export const standardEventsData = events;

