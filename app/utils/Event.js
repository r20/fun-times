
import * as logger from '../utils/logger'

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
        color
        keywords
        useTimeOfDay
        isCustom
        specialNumbers // TBD - need to figure out how to implement this.  Thisis other numbers (besides what's in date) that are significant. E.g. Super Bowl LX would have 60 as special 
        tag
    */
    constructor(options = {}) {
        // Take the this object, add in some defaults, then add in passed in options (which may override defaults)
        Object.assign(this, {
            tag: [],
            specialNumbers: [],
            keywords: [],
        }, options);
        // If key not specified, set it to title
        this.key = options.key || options.title;

        /* These are required */
        if (!options.title || !options.epochMillis || !options.color) {
            logger.error("Required options to Event constructor not specified! ", options);
        }
    }
}


export function cloneEvent(event) {
    /* Since not storing Date in objet or anything too unusual, we can do deep clone with stringify */
    return JSON.parse(JSON.stringify(event));
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


export function getEventDisplayDate(event) {

    if (event) {
        return getDisplayDateForEpoch(event.epochMillis, event.useTimeOfDay);
    }
    logger.log("Something is wrong with the event");
    return '????/??/??';
}

export function getDisplayDateForEpoch(epochMillis, useTimeOfDay = false) {
    try {
        const date = new Date(epochMillis);
        if (useTimeOfDay) {
            return date.toLocaleDateString() + " " + date.toLocaleTimeString();
        } else {
            return date.toLocaleDateString();
        }

    } catch (err) {
        logger.warn("Error while getting display date", err);
    }

    return '????/??/??';
}