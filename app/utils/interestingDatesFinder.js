import { Decimal } from 'decimal.js-light';
import * as logger from './logger'
import moment from 'moment-timezone'
import { interestingNumbersFinder } from './interestingNumbersFinder'
import { sortedInterestingNumbers } from './interestingNumbers'
import * as Utils from './Utils'

/**
 * This function calls others to get the interesting milestones.
 * Returns an array of objects that contain interesting info
 * to be used to report interesting milestone dates.
 * The objects have
 *  event: the event that was passed in to generate the array
 *  unit: (e.g. minutes, seconds, etc.)
 *  tags: array(e.g. [ "Super power", "pi"]
 *  description: A partial description of what was found (doesn't have unit)
 *  time: in epoch milliseconds  
 * 
 * @param {Object} event - object with info about the event, like epochMillis
 * @param {Number} nowTime - in epoch milliseconds
 * @param {Number} futureDistanceDays - number of days in future to look for interesting numbers
 * @param {Number} tooCloseDays - number of days within the event to ignore interesting dates
 *                        (because looking close to the event, e.g. 4 days, causes LOTS of interesting times)
 */
export function findInterestingDates(event, nowTime, futureDistanceDays, tooCloseDays) {

    const eventMoment = moment(event.epochMillis);
    const nowMoment = moment(nowTime);
    const futureMoment = nowMoment.clone().add(futureDistanceDays, 'days');
    const tooCloseMillis = tooCloseDays ? tooCloseDays * 24 * 3600 * 1000 : 0;
    const isEventInFuture = (event.epochMillis > nowTime);

    const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
    var interestingList = [];
    for (let idx = 0; idx < units.length; idx++) {
        const unit = units[idx];
        let start, end;
        const spanBetweenNowAndEvent = Math.abs(nowMoment.diff(eventMoment, unit));
        const spanBetweenFutureAndEvent = Math.abs(futureMoment.diff(eventMoment, unit));
        logger.log(" spanBetweenNowAndEvent ", spanBetweenNowAndEvent);
        logger.log(" spanBetweenFutureAndEvent ", spanBetweenFutureAndEvent);
        if (isEventInFuture) {
            start = futureMoment.isBefore(eventMoment) ? spanBetweenFutureAndEvent : 0;
            end = spanBetweenNowAndEvent;
        } else {
            start = spanBetweenNowAndEvent;
            end = spanBetweenFutureAndEvent;
        }

        logger.log(" Unit ", unit, start, end);
        for (var i = 0; i < sortedInterestingNumbers.length; i++) {
            const info = sortedInterestingNumbers[i];
            if (info.tags.indexOf('pi') >= 0 && event.tags.indexOf('pi') < 0) {
                /* jmr - need to decide which types of interesting numbers to show
                And if don't usually show all of these, then pi shouldn't be in the sortedInterestingNumbers
                to begin with. We could have some standard ones in one array, and then have other arrays to concat
                in according to tags or keywords or whtever mechanism is used. 
                Also note that having tags on the info and tags on event could be somewhat confusing since they're
                not the same thing. */
                // Don't use pi numbers unless event has pi tag
                continue;
            }
            if (info.number > end) {
                // Since they're sorted, if we get one > end we're done with this loop
                break;
            }
            let interestingTime;
            if (isEventInFuture) {
                interestingTime = eventMoment.clone().subtract(info.number, unit).valueOf();
            } else {
                interestingTime = eventMoment.clone().add(info.number, unit).valueOf();
            }
            if (info.number >= start && info.number <= end) {
                if (interestingTime > nowTime) {
                    /* InterestingTime needs to be in the future.
                    E.g. An interesting time of 10 years ahead of a past event
                    might be eariler this year but in past.  Don't show it.  */
                    if (interestingTime < event.epochMillis - tooCloseMillis || interestingTime > event.epochMillis + tooCloseMillis) {
                        /* The interestingTime can't be too close to the event.
                        Must be less than the event - tooCloseMillis,
                        or greater than event+tooCloseMillis
                        */
                        let interestingInfo = {
                            event: event,
                            unit: unit,
                            tags: info.tags,
                            description: info.descriptor,
                            time: interestingTime,
                        };
                        interestingList.push(interestingInfo);
                    }
                }
            }
        }
    }
    return interestingList;

}