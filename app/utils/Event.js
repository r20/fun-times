
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
        color (not used anymore)
        keywords
        isFullDay
        isCustom
        ignoreIfPast // Only show this event if it is in the future
        selected // Whether the event is selected/visible in non-events screens
        isSelectedByDefault // For standard events
        tags
        useDateAndTimeInMilestones // Whether we use date/time in milestone calculations
        useManualEntryInMilestones
        manualEntryNumbers // Other numbers (besides what's in date) that are significant. E.g. [60] for Super Bowl LX

    */
    constructor(options = {}) {
        // Take the this object, add in some defaults, then add in passed in options (which may override defaults)
        Object.assign(this, {
            tags: [],
            isFullDay: true,
            specialNumbers: [],
            keywords: [],
            isSelectedByDefault: false,
            ignoreIfPast: true,
            useDateAndTimeInMilestones: true,
            useManualEntryInMilestones: false,
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

