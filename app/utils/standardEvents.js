import moment from 'moment-timezone'
import Event, { TAGS } from '../utils/Event'


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
    As an alternative, this has lots of holidays, but I don't see how to use keywords for searching.
    https://github.com/commenthol/date-holidays

*/


const events = [
    new Event({
        title: "Christmas", // What user might see (later need to localize)
        key: "Christmas", // Each holiday needs unique key.  Specify key if different than title.
        epochMillis: moment("2020-12-25 0:00", 'YYYY-MM-DD HH:mm').valueOf(), // Day and/or time it starts
        keywords: ['christmas', 'x-mas', 'xmas'], // Have these all lower case
        useTimeOfDay: false, // If a certain time and not the whole day is significant
        color: "red",
        /* An array of numbers that are meaningful to the event that should be used to calculate special
        milestone times.  The numbers in the date of the event should automatically be included. No need to set those.
        */
        specialNumbers: undefined,
        tag: [TAGS.HOLIDAY, TAGS.RELIGION],
    }),
    new Event({
        title: "Easter",
        key: "Easter",
        epochMillis: moment("2020-04-12 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        color: "purple",
        tag: [TAGS.HOLIDAY, TAGS.RELIGION],
    }),
    new Event({
        title: "New Year's Day",
        key: "New Year's Day",
        isSelectedByDefault: true,
        epochMillis: moment().startOf('year').add(1, 'years').valueOf(),
        //        epochMillis: moment("2020-01-01 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        useTimeOfDay: true,
        color: "silver",
        tag: [TAGS.HOLIDAY],
    }),
    new Event({
        title: "Super Bowl LIV",
        key: "Super Bowl",
        isSelectedByDefault: true,
        epochMillis: moment.tz("2020-02-02 18:30", 'YYYY-MM-DD HH:mm', 'America/New_York').valueOf(),
        color: "brown",
        specialNumbers: [54],
        tag: [TAGS.SPORTS],
    }),
    new Event({
        title: "March Madness Tournament Begins",
        key: "March Madness Tournament Begins",
        isSelectedByDefault: true,
        epochMillis: moment("2020-03-17 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        useTimeOfDay: false,
        color: "orange",
        specialNumbers: [64, 68],
        tag: [TAGS.SPORTS],
    }),
    new Event({
        title: "March Madness Final Four",
        key: "March Madness Final Four",
        isSelectedByDefault: true,
        epochMillis: moment("2020-04-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        useTimeOfDay: false,
        color: "orange",
        specialNumbers: [4, 64, 68],
        tag: [TAGS.SPORTS],
    }),
    new Event({
        title: "Thanksgiving",
        key: "Thanksgiving",
        isSelectedByDefault: false,
        epochMillis: moment("2020-11-26 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        color: "brown",
        tag: [TAGS.HOLIDAY],
    }),
    new Event({
        title: "US Independence Day",
        key: "US Independence Day",
        isSelectedByDefault: false,
        epochMillis: moment("2020-07-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        color: "red",
        tag: [TAGS.HOLIDAY],
    }),
    new Event({
        title: "Pi Day",
        key: "Pi Day",
        isSelectedByDefault: false,
        epochMillis: moment("2020-03-14 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        color: "orange",
        specialNumbers: undefined, // TBD: How should we tell it to use pi??
        tag: [TAGS.QUIRKY],
    }),
    new Event({
        title: "May the Fourth (Star Wars Day)",
        key: "Star Wars Day",
        isSelectedByDefault: false,
        epochMillis: moment("2020-05-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        color: "black",
        tag: [TAGS.QUIRKY],
    }),
    new Event({
        title: "US Presidential Election",
        key: "US Presidential Election",
        isSelectedByDefault: true,
        epochMillis: moment("2020-11-03 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        color: "red",
        specialNumbers: [46], // A new president would be the 46th
        tag: [TAGS.QUIRKY],
    }),
];

events.sort((a, b) => {
    return b.epochMillis - a.epochMillis;
});

export const standardEvents = events;

