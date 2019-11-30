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
 */
export function findInterestingDates(event, nowTime, futureDistanceDays) {

    const eventMoment = moment(event.epochMillis);
    const nowMoment = moment(nowTime);
    const futureMoment = nowMoment.clone().add(futureDistanceDays, 'days');
    const isEventInFuture = (event.epochMillis > nowTime);

    const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
    var interestingList = [];
    for (let idx = 0; idx < units.length; idx++) {
        const unit = units[idx];
        let start, end;
        const spanBetweenNowAndEvent = Math.abs(nowMoment.diff(eventMoment, unit));
        const spanBetweenFutureAndEvent = Math.abs(futureMoment.diff(eventMoment, unit));
        console.log(" spanBetweenNowAndEvent ", spanBetweenNowAndEvent);
        console.log(" spanBetweenFutureAndEvent ", spanBetweenFutureAndEvent);
        if (isEventInFuture) {
            start = futureMoment.isBefore(eventMoment) ? spanBetweenFutureAndEvent : 0;
            end = spanBetweenNowAndEvent;
        } else {
            start = spanBetweenNowAndEvent;
            end = spanBetweenFutureAndEvent;
        }

        console.log(" Unit ", unit, start, end);
        for (var i = 0; i < sortedInterestingNumbers.length; i++) {
            const info = sortedInterestingNumbers[i];
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
    return interestingList;

}