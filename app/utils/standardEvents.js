import moment from 'moment-timezone'

/* TBD - Need an easy way for users to see list of new events added to this list,
especially the ones that will be on by default. */

/**
 * Some of these CAN NOT have the milliseconds hardcoded beforehand, but need done
 * at run time on user's device because they depend on the user's time zone
 * (e.g. New Year's Day)
 */

/* title needs to be unique */
export const standardEvents = [

    {
        title: "Christmas",
        key: "Christmas",
        epochMillis: moment("2019-12-25 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        isExactTimeOfDay: false,
        color: "red",
        tag: ['holiday'],
    },
    {
        title: "New Year's Day",
        key: "New Year's Day",
        isSelectedByDefault: true,
        epochMillis: moment("2020-01-01 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        isExactTimeOfDay: true,
        color: "silver",
        tag: ['holiday'],
    },
    {
        title: "Super Bowl LV",
        key: "Super Bowl",
        isSelectedByDefault: true,
        epochMillis: moment.tz("2020-02-07 1:00", 'YYYY-MM-DD HH:mm', 'America/New_York').valueOf(),
        isExactTimeOfDay: false,
        color: "brown",
        tag: ['sports'],
    },
    {
        title: "March Madness Tournament Begins",
        key: "March Madness Tournament Begins",
        isSelectedByDefault: true,
        epochMillis: moment("2020-03-17 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        isExactTimeOfDay: false,
        color: "orange",
        tag: ['sports'],
    },
    {
        title: "March Madness Final Four",
        key: "March Madness Final Four",
        isSelectedByDefault: true,
        epochMillis: moment("2020-04-04 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        isExactTimeOfDay: false,
        color: "orange",
        tag: ['sports'],
    },
    {
        title: "General Conference",
        key: "General Conference",
        epochMillis: moment.tz("2020-04-03 10:00", 'YYYY-MM-DD HH:mm', 'America/Denver').valueOf(),
        isExactTimeOfDay: true,
        color: "purple",
        tag: ['churchofjesuschrist'],
    },
    {
        title: "Thanksgiving",
        key: "Thanksgiving",
        isSelectedByDefault: true,
        epochMillis: moment("2020-11-26 0:00", 'YYYY-MM-DD HH:mm').valueOf(),
        isExactTimeOfDay: false,
        color: "brown",
        tag: ['holiday'],
    },
];

standardEvents.sort((a, b) => {
    return b.epochMillis - a.epochMillis;
});