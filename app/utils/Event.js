
import moment from 'moment-timezone'

import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'

/**
 * Using a simple class with attributes only (no methods)
 * because this is stored with async storage.
 */
export default class Event {

    /*
    The possible attributes are:
        title
        key
        epochMillis
        color (not used anymore)
        keywords
        isAllDay
        isCustom
        ignoreIfPast // Only show this event if it is in the future
        selected // Whether the event is selected/visible in non-events screens
        isSelectedByDefault // For standard events
        tags
        useDateAndTimeInMilestones // Whether we use date/time in milestone calculations
        useManualEntryInMilestones
        manualEntryNumbers // Other numbers (besides what's in date) that are significant. E.g. [60] for Super Bowl LX
        anniversaryNumber // These are NOT in any event list. Events with this are created and put in the event attribute of milestones to be able to find celebration times for upcoming anniversaries. This tells which number anniversary.

    */
    constructor(options = {}) {
        // Take the this object, add in some defaults, then add in passed in options (which may override defaults)
        Object.assign(this, {
            tags: [],
            isAllDay: true,
            specialNumbers: [],
            keywords: [],
            isSelectedByDefault: false,
            ignoreIfPast: true,
            useDateAndTimeInMilestones: true,
            useManualEntryInMilestones: false,
            anniversaryNumber: undefined,
            manualEntryNumbers: [],
        }, options);
        // If key not specified, set it to title
        this.key = options.key || options.title;

        /* These are required */
        if (!options.title || !options.epochMillis) {
            logger.error("Required options to Event constructor not specified! ", options);
        }
    }
}


export function cloneEvent(event) {
    /* Since not storing Date in object or anything too unusual, we can do deep clone with stringify */
    return JSON.parse(JSON.stringify(event));
}

const nowMoment = moment(new Date());

export function getNextAnniversaryMoment(theMoment) {
    let futureMoment = theMoment.clone();
    while (futureMoment.isBefore(nowMoment, "minute")) {
        futureMoment = futureMoment.year(futureMoment.year() + 1);
    }
    return futureMoment;
}


/* Make an event based off the input parameter event
    that has its year set so that it is within the next year.
    This is useful for finding the next anniversary of an event for example.
    We add the anniversary number to manualEntryNumbers, and set anniversaryNumber.
    And set useManualEntryInMilestones true */
export function makeDerivedAnniversaryEvent(event) {
    let clone = cloneEvent(event);
    let tempMoment = moment(event.epochMillis);
    let futureMoment = getNextAnniversaryMoment(tempMoment);

    /* So we can say there are 17 days until anniversary for 17th anniversary */
    let newManuals = clone.manualEntryNumbers || [];
    const anniversaryNumber = Math.abs(futureMoment.diff(tempMoment, 'years'));
    newManuals.push(anniversaryNumber);
    clone.manualEntryNumbers = newManuals;
    clone.useManualEntryInMilestones = true;
    clone.anniversaryNumber = anniversaryNumber; // Which anniversary is this event for

    clone.epochMillis = futureMoment.valueOf();
    return clone;

}

/**
 * The possible values of tags. (tbd, although later maybe user will need to tag their own custom events)
 * The isCustom is its own attribute, so no tag for that.
 */
export const TAGS = {
    HOLIDAY: "Holiday",
    RELIGION: "Religion",
    QUIRKY: "Quirky",
    SPORTS: "Sports",
};

