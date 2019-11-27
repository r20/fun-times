import { Decimal } from 'decimal.js-light';
import * as logger from './logger'

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
 */
export function findInterestingDates(event, nowTime, futureDistanceDays) {

    const eventTime = event.epochMillis;
    const futureTime = nowTime + Utils.fromUnitToMillis("days", futureDistanceDays);
    const eventToNow = nowTime - eventTime; // elapsed time period between event and now
    const eventToFuture = futureTime - eventTime; // elapsed time period between event and futureDistanceDays

    const units = ['seconds', 'minutes', 'hours', 'days', 'months', 'years'];
    var interestingList = [];
    for (let idx = 0; idx < units.length; idx++) {
        const unit = units[idx];
        console.log(" Before getting start and end");
        var start = Utils.fromMillisToUnit(unit, eventToNow);
        var end = Utils.fromMillisToUnit(unit, eventToFuture);
        console.log(" After getting start and end");

        console.log(" Unit ", unit, start, end);
        for (var i = 0; i < sortedInterestingNumbers.length; i++) {
            const info = sortedInterestingNumbers[i];
            if (info.number > end) {
                // Since they're sorted, if we get one > end we're done with this loop
                break;
            }
            if (info.number >= start && info.number <= end) {
                let interestingInfo = {
                    event: event,
                    unit: unit,
                    tags: info.tags,
                    description: info.descriptor,
                    time: eventTime + Utils.fromUnitToMillis(unit, info.number),
                };
                interestingList.push(interestingInfo);
            }
        }
    }
    return interestingList;

}