import { Decimal } from 'decimal.js-light';
import * as logger from './logger'
import moment from 'moment-timezone'
import { INTERESTING_TYPES, INTERESTING_CONSTANTS, getSortedInterestingNumbersMap } from './interestingNumbersFinder'
import * as Utils from './Utils'


/*
    Get a key for the milestone.
    Combination of event title and time would NOT be unique if a time had more than one representation
    that was interesting. Adding unit to that still isn't unique (e.g. 22 days and 3*pi days).
    So, add numtype also.
*/
export function getMilestoneKey(milestoneItem) {
    // jmr - if numtype is custom, remember there could be more than one custom numtype that results in a milestone at same time.
    // remember this when adding custom numtypes
    const theKey = "" + milestoneItem.time + "_" + milestoneItem.numtype + "_" + milestoneItem.unit + "_" + milestoneItem.event.title;
    return theKey;
}

/*
    Create milestone object (and set key using getMilestoneKey).
    time - milliseconds
    numtype - usually one of INTERESTING_TYPES, but could be custom too
*/
function createMilestone(event, unit, description, numtype, time) {
    //: "event", // At event time.  This isn't in the INTERESTING_TYPES
    const milestone = {
        event: event,
        unit: unit,
        description: description,
        numtype: numtype, // At event time.  This isn't in the INTERESTING_TYPES
        time: time,
    };
    milestone.key = getMilestoneKey(milestone);
    return milestone;
}

/**
 * This function calls others to get the interesting milestones.
 * Returns a sorted (by time) array of objects that contain interesting info
 * to be used to report interesting milestone dates.
 * The objects have
 *  event: the event that was passed in to generate the array
 *  unit: (e.g. minutes, seconds, etc.)
 *  description: A partial description of what was found (doesn't have unit)
 *  time: in epoch milliseconds  
 * 
 * @param {Object} event - object with info about the event, like epochMillis
 * @param {Number} nowTime - in epoch milliseconds
 * @param {Number} pastDays - number of days in past to look for interesting numbers (but limited to maxNumMilestonesPast)
 * @param {Number} futureDays - number of days in future to look for interesting numbers
 * @param {Number} maxNumMilestonesPast - Max number of past milestones to return (but must be within the pastDays)
 * @param {Number} maxNumMilestonesFuture - Max number of future milestones to return
 * @param {Object} appSettingsContext - has appSettingsContext.numberTypeUseMap and other settings to see which number types to use 
 */
export function findInterestingDates(event, nowTime, pastDays, futureDays, maxNumMilestonesPast, maxNumMilestonesFuture, appSettingsContext) {



    const sortedInterestingNumbersMap = getSortedInterestingNumbersMap();
    const numberTypes = Object.keys(sortedInterestingNumbersMap);

    const eventMoment = moment(event.epochMillis);
    const nowMoment = moment(nowTime);
    const futureMoment = nowMoment.clone().add(futureDays, 'days');
    const pastMoment = nowMoment.clone().subtract(pastDays, "days");
    const tooCloseDays = 4; // jmr - redo this ??
    const tooCloseMillis = tooCloseDays * 24 * 3600 * 1000;
    const isEventInFuture = (event.epochMillis > nowTime);

    var interestingList = [];
    // For upcoming events, show exact moment as a milestone
    if (isEventInFuture) {
        if (eventMoment.isBefore(futureMoment)) {
            interestingList.push(createMilestone(event, "seconds", "0", "event", event.epochMillis));
        }
    }

    const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
    for (let unitsIidx = 0; unitsIidx < units.length; unitsIidx++) {
        const unit = units[unitsIidx];
        let start, end;

        /* Create a helper function that is used in multiple places */
        const getInterestingInfoItem = (num, numtype, descriptor) => {

            if (num >= start && num <= end) {
                let interestingTime;

                if (Number.isInteger(num)) {
                    if (isEventInFuture) {
                        interestingTime = eventMoment.clone().subtract(num, unit).valueOf();
                    } else {
                        interestingTime = eventMoment.clone().add(num, unit).valueOf();
                    }
                } else {
                    /* Before I was handling decimals, I saw a case where 40,000,000,000 * G (2.669720 months)
                        and 50,000,000,000 * G (3.337150 months) were both at the same time (it added 3 months).
                        moment rounds decimals because adding dates is complex.
                        So instead, add/subtract the integer part normally with moment and the time units 
                        (to account for months of different lengths, daylight savings, leap year, etc.)
                        then convert the decimal part to ms and add/subtract that. */

                    let integerPart = Math.trunc(num);
                    let decimalPart = num % 1; // Since this is javascript, it may lose some precision but that's ok.

                    const ms = moment.duration(decimalPart, unit).asMilliseconds();

                    if (isEventInFuture) {
                        const tmpMoment = eventMoment.clone().subtract(integerPart, unit);
                        interestingTime = tmpMoment.clone().subtract(ms, "ms").valueOf();
                    } else {
                        const tmpMoment = eventMoment.clone().add(integerPart, unit);
                        interestingTime = tmpMoment.clone().add(ms, "ms").valueOf();

                    }
                }

                if (interestingTime >= pastMoment.valueOf()) {
                    /* InterestingTime needs to be after our pastMoment.
                    E.g. An interesting time of 10 years ahead of a past event
                    might be eariler this year but in past.  Don't show it.  */
                    if (interestingTime < event.epochMillis - tooCloseMillis || interestingTime > event.epochMillis + tooCloseMillis) {
                        /* The interestingTime can't be too close to the event.
                        Must be less than the event - tooCloseMillis,
                        or greater than event+tooCloseMillis
                        */
                        return createMilestone(event, unit, descriptor, numtype, interestingTime);
                    }
                }
            }
            return null;
        };

        const spanBetweenPastAndEvent = Math.abs(pastMoment.diff(eventMoment, unit));
        const spanBetweenFutureAndEvent = Math.abs(futureMoment.diff(eventMoment, unit));
        logger.log(" spanBetweenPastAndEvent ", spanBetweenPastAndEvent);
        logger.log(" spanBetweenFutureAndEvent ", spanBetweenFutureAndEvent);
        if (isEventInFuture) {
            start = futureMoment.isBefore(eventMoment) ? spanBetweenFutureAndEvent : 0;
            end = spanBetweenPastAndEvent;
        } else {
            start = spanBetweenPastAndEvent;
            end = spanBetweenFutureAndEvent;
        }

        logger.log(" Unit ", unit, start, end);

        if (unit === 'years') {
            // Add in aniversaries
            for (var yr = start; yr <= end; yr++) {
                const interestingInfo = getInterestingInfoItem(yr, INTERESTING_TYPES.round, yr);
                if (interestingInfo) {
                    interestingList.push(interestingInfo);
                }
            }
        }

        for (let numberTypesIdx = 0; numberTypesIdx < numberTypes.length; numberTypesIdx++) {

            const numberType = numberTypes[numberTypesIdx];

            const numberUse = appSettingsContext.numberTypeUseMap[numberType];
            if (!numberUse) {
                // We don't want to use this type of number at all
                continue;
            }
            const isConstant = INTERESTING_CONSTANTS[numberType] ? true : false;

            const sortedInterestingNumbers = sortedInterestingNumbersMap[numberType];
            //  logger.warn(" Number of interesting numbers for type ", numberType, sortedInterestingNumbers.length);

            for (var sortedListIndex = 0; sortedListIndex < sortedInterestingNumbers.length; sortedListIndex++) {
                const info = sortedInterestingNumbers[sortedListIndex];

                if (unit === "years" && Number.isInteger(info.number)) {
                    // We add in years already.  We only need to do years if it's not a non-integer like our constants
                    // jmr - what about event based numbers like 6/26 or 6.26 ??
                    continue;
                }

                if (isConstant) {
                    if (numberUse === 1 && info.tags.indexOf("constantExact") < 0) {
                        // This info isn't constantExact, so don't use it
                        continue;
                    } else if (numberUse === 2 && info.tags.indexOf("constantTenMultiple") < 0) {
                        // This info isn't constantTenMultiple, so don't use it
                        continue;
                    } else if (numberUse === 3 && info.tags.indexOf("constantOtherMultiple") < 0) {
                        // This info isn't constantOtherMultiple, so don't use it
                        continue;
                    }
                }

                /* jmr - need to add in dates using numbers particular to the event (e.g. 12/25) */

                if (unit === "minutes" && numberType === INTERESTING_TYPES.round) {
                    // Only show round numbers that are bigger
                    if (info.number % 10000 > 0) {
                        continue;
                    }
                } else if (unit === "seconds" && numberType === INTERESTING_TYPES.round) {
                    // Only show round numbers that are bigger
                    if (info.number % 1000000 > 0) {
                        continue;
                    }
                }

                if (info.number > end) {
                    // Since they're sorted, if we get one > end we're done with this loop
                    break;
                }

                const interestingInfo = getInterestingInfoItem(info.number, numberType, info.descriptor);
                if (interestingInfo) {
                    interestingList.push(interestingInfo);
                }

            }
        }
    }

    // Sort it
    interestingList = interestingList.sort((a, b) => { return (a.time - b.time); });

    /* Get the index where the current or future milestones happen
        Declare the variable before the for loop so it's in scope when we use it below
    */
    let afterPastIdx = 0;
    for (afterPastIdx = 0; afterPastIdx <= interestingList.length; afterPastIdx++) {
        if (interestingList[afterPastIdx].time >= nowTime) {
            break;
        }
    }

    // First, take out those in future at end of array
    if (maxNumMilestonesFuture) {
        interestingList.splice(afterPastIdx + maxNumMilestonesFuture);
    }

    // After taking out future at end, take out some from beginning if needed
    const numToRemove = afterPastIdx - maxNumMilestonesPast;
    if (numToRemove > 0) {
        interestingList.splice(0, numToRemove); // splice removes from original array
    }

    return interestingList;

}