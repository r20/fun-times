import { Decimal } from 'decimal.js-light';
import nanomemoize from 'nano-memoize'

import * as logger from './logger'
import moment from 'moment-timezone'
import { INTERESTING_TYPES, INTERESTING_CONSTANTS, getSortedInterestingNumbersMap } from './interestingNumbersFinder'
import { numberToFormattedString } from './Utils'

const EXTRA_NUMBER_TYPE_USE_EVENT_DATETIME = "numberTypeEventDatetime";
const EXTRA_NUMBER_TYPE_MANUAL_ENTRY = "numberTypeManualEntry";

/*
    Get a key for the milestone.
    Combination of event title and time would NOT be unique if a time had more than one representation
    that was interesting. Adding unit to that still isn't unique (e.g. 22 days and 3*pi days).
    So, add numberType also.
*/
export function getMilestoneKey(milestoneItem) {
    const theKey = "" + milestoneItem.time + "_" + milestoneItem.numberType + "_" + milestoneItem.unit + "_" + milestoneItem.event.title;
    return theKey;
}

/*
    Create milestone object (and set key using getMilestoneKey).
    event - event this milestone is created for
    unit - time unit (e.g. years)
    description - description of the number, used in other code as part of the full description of the milestone
            e.g. "4^4 (super power!) = 256"
    numberType - usually one of INTERESTING_TYPES, but could be custom too
    numberCode - used for constants to tell what the interesting number is in relation to the constant (e.g. exact, same digits, other multiple)
    time - in milliseconds
*/
function createMilestone(event, unit, description, numberType, numberCode, time) {

    const milestone = {
        event: event,
        unit: unit,
        description: String(description),
        numberType: numberType,
        numberCode: numberCode,
        time: time,
    };
    milestone.key = getMilestoneKey(milestone);
    return milestone;
}



export function shouldShowMilestoneForNumberType(milestone, numberTypeUseMap) {

    if (milestone.numberType === EXTRA_NUMBER_TYPE_USE_EVENT_DATETIME) {
        return milestone.event && milestone.event.useDateAndTimeInMilestones;
    } else if (milestone.numberType === EXTRA_NUMBER_TYPE_MANUAL_ENTRY) {
        return milestone.event && milestone.event.useManualEntryInMilestones;
    } else {
        const numberType = milestone.numberType;

        const numberTypeUse = numberTypeUseMap[numberType];

        if (numberTypeUse && milestone.numberCode) {
            /* This isn't just a boolean, there's a code to check.
                If the numberTypeUse setting is >= the code for this milestone, then show it */
            return numberTypeUse >= milestone.numberCode;
        }
        return numberTypeUse;
    }
}


const sortedInterestingNumbersMap = getSortedInterestingNumbersMap();
const numberTypes = Object.keys(sortedInterestingNumbersMap);


/**
 * Returns a map with numbers as they key and maps to an object that looks like:
 *  tags
 *  number
 *  descriptor
 *  event
 * (This is similar to the object in interestingNumbersFinder except it has an optional event tag with it.)
 * 
 * @param {*} epochTime (number): Epoch millisecond time to generate numbers from
 * @param {*} isFullDay (boolean): Determines whether numbers generated include hour and minute
 * @param {*} event     (Object): optional. If passed as input parm, it's an attribute on the object returned.
 */
export const getInterestingNumbersForEventTime = (epochTime, isFullDay, event) => {

    /* TBD - whether in here or another control, 
    I should use the next anniversary number in milestones.  
    E.g. if someone will be 22 years it could be good to show
    22 days until they are 22 years  
    Maybe it's an optional number for milestons calculations??
    
    */

    let theMoment = moment(epochTime);

    function makeInterestingInfo(num, descriptor, event) {
        return {
            tags: [EXTRA_NUMBER_TYPE_USE_EVENT_DATETIME],
            number: num,
            descriptor: descriptor,
            event: event
        };
    }


    /* Some of these might be unneeded for some months and days
    (e.g. MDYYYY and MMDYYYY and MDDYYYY could all be 10192020),
    but to get all possibilities we try everything and store it in a 
    map so duplicates are not present.
    */
    let numToInterestingInfo = {};

    let tmpDecimal;
    tmpDecimal = (new Decimal(parseInt(theMoment.format('YYYY')))).div(parseInt(theMoment.format('M'))).div(parseInt(theMoment.format('D')));
    numToInterestingInfo[tmpDecimal.valueOf()] = makeInterestingInfo(tmpDecimal.valueOf(), theMoment.format('YYYY/M/D') + '=' + numberToFormattedString(tmpDecimal.valueOf(), true), event);

    tmpDecimal = (new Decimal(parseInt(theMoment.format('M')))).div(parseInt(theMoment.format('D')));
    numToInterestingInfo[tmpDecimal.valueOf()] = makeInterestingInfo(tmpDecimal.valueOf(), theMoment.format('M/D') + '=' + numberToFormattedString(tmpDecimal.valueOf(), true), event);

    tmpDecimal = (new Decimal(parseInt(theMoment.format('D')))).div(parseInt(theMoment.format('M')));
    numToInterestingInfo[tmpDecimal.valueOf()] = makeInterestingInfo(tmpDecimal.valueOf(), theMoment.format('D/M') + '=' + numberToFormattedString(tmpDecimal.valueOf(), true), event);

    tmpDecimal = (new Decimal(parseInt(theMoment.format('YYYY')))).minus(parseInt(theMoment.format('M'))).minus(parseInt(theMoment.format('D')));
    numToInterestingInfo[tmpDecimal.valueOf()] = makeInterestingInfo(tmpDecimal.valueOf(), theMoment.format('YYYY-M-D') + '=' + numberToFormattedString(tmpDecimal.valueOf(), false), event);

    tmpDecimal = (new Decimal(parseFloat(theMoment.format('M.D'))));
    numToInterestingInfo[tmpDecimal.valueOf()] = makeInterestingInfo(tmpDecimal.valueOf(), tmpDecimal.valueOf(), event);

    tmpDecimal = (new Decimal(parseFloat(theMoment.format('D.M'))));
    numToInterestingInfo[tmpDecimal.valueOf()] = makeInterestingInfo(tmpDecimal.valueOf(), tmpDecimal.valueOf(), event);

    /* Order matters here.  The YYYYMD (with single M and single D) is put before MM and DD combinations
    so if the month or day is only one digit this format will be used and shown in the descriptor.
    Showing 6262001 (MDYYYY) is better than showing it as 6262001 (MMDDYYYY) for example.
    */
    const dateFormats = [
        'YYYYMMDD', 'YYYYMMD', 'YYYYMDD', 'YYYYMD',
        'MMDDYYYY', 'MDDYYYY', 'MMDYYYY', 'MDYYYY',
        'MMDDYY', 'MMDYY', 'MDDYY', 'MDYY',
        'DDMMYYYY', 'DMMYYYY', 'DDMYYYY', 'DMYYYY',
    ];
    for (let idx = 0; idx < dateFormats.length; idx++) {
        // Doing parseInt and then myInt.toString() will get rid of leading zero
        const dateFormat = dateFormats[idx];
        let myInt = parseInt(theMoment.format(dateFormat), 10);
        numToInterestingInfo[myInt] = makeInterestingInfo(myInt, myInt + " (" + dateFormat + ")", event);

        if (!isFullDay) {
            /* Use year, month, and day combinations with time combinations */
            myInt = parseInt(theMoment.format(dateFormat + 'hhmm'), 10);
            numToInterestingInfo[myInt] = makeInterestingInfo(myInt, myInt + " (" + dateFormat + "hhmm)", event);
            myInt = parseInt(theMoment.format(dateFormat + 'Hmm'), 10);
            numToInterestingInfo[myInt] = makeInterestingInfo(myInt, myInt + " (" + dateFormat + "Hmm)", event);
        }
    }

    const interestingNums = Object.values(numToInterestingInfo);
    return interestingNums;
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
 */
const unmemoizedCreateMilestones = (event, nowTime, pastDays, futureDays, maxNumMilestonesPast) => {

    const eventMoment = moment(event.epochMillis);
    const nowMoment = moment(nowTime);
    const futureMoment = nowMoment.clone().add(futureDays, 'days');
    const pastMoment = nowMoment.clone().subtract(pastDays, "days");
    const tooCloseDays = 4; // TBD - Do I still want this value?
    const tooCloseMillis = tooCloseDays * 24 * 3600 * 1000;
    const isEventInFuture = (event.epochMillis > nowTime);

    var milestoneList = [];
    /* For upcoming events, show exact moment as a milestone
        We'll call the type "event" */
    if (isEventInFuture) {
        if (eventMoment.isBefore(futureMoment)) {
            milestoneList.push(createMilestone(event, "seconds", "0", "event", undefined, event.epochMillis));
        }
    }

    /* Create a helper function that is used in multiple places */
    const createMilestoneIfNeeded = (unit, start, end, num, descriptor, numberType, numberCode) => {

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
                    return createMilestone(event, unit, descriptor, numberType, numberCode, interestingTime);
                }
            }
        }
        return null;
    };

    const eventDatetimeNumbers = getInterestingNumbersForEventTime(event.epochMillis, event.isFullDay, event);

    const units = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
    for (let unitsIidx = 0; unitsIidx < units.length; unitsIidx++) {
        const unit = units[unitsIidx];
        let start, end;

        const spanBetweenPastAndEvent = Math.abs(pastMoment.diff(eventMoment, unit));
        const spanBetweenFutureAndEvent = Math.abs(futureMoment.diff(eventMoment, unit));

        logger.log(" spanBetweenPastAndEvent ", event.title, unit, spanBetweenPastAndEvent);
        logger.log(" spanBetweenFutureAndEvent ", event.title, unit, spanBetweenFutureAndEvent);


        if (isEventInFuture) {
            start = futureMoment.isBefore(eventMoment) ? spanBetweenFutureAndEvent : 0;
            end = spanBetweenPastAndEvent;
        } else {
            start = spanBetweenPastAndEvent;
            end = spanBetweenFutureAndEvent;
        }

        logger.log(" Unit ", unit, start, end);

        /* Add in anniversaries */
        if (unit === 'years') {
            for (var yr = start; yr <= end; yr++) {
                const newMilestone = createMilestoneIfNeeded(unit, start, end, yr, yr, INTERESTING_TYPES.round, undefined);
                if (newMilestone) {
                    milestoneList.push(newMilestone);
                }
            }
        }


        /* Add in numbers that are based on the event date and time */
        /* TBD: Should this be global setting or event specific???  If event specific we could check here. 
         If global then always put them in here and the show* function will filter them */
        for (let jdx = 0; jdx < eventDatetimeNumbers.length; jdx++) {
            const info = eventDatetimeNumbers[jdx];
            const newMilestone = createMilestoneIfNeeded(unit, start, end, info.number, info.descriptor, EXTRA_NUMBER_TYPE_USE_EVENT_DATETIME, undefined);
            if (newMilestone) {
                milestoneList.push(newMilestone);
            }
        }

        /* Add in numbers entered manually for event */
        if (event.useManualEntryInMilestones && event.manualEntryNumbers) {
            for (let manIdx = 0; manIdx < event.manualEntryNumbers.length; manIdx++) {
                const manNumber = event.manualEntryNumbers[manIdx];
                const formattedManNumber = numberToFormattedString(manNumber, true);
                const newMilestone = createMilestoneIfNeeded(unit, start, end, manNumber, formattedManNumber, EXTRA_NUMBER_TYPE_MANUAL_ENTRY, undefined);
                if (newMilestone) {
                    milestoneList.push(newMilestone);
                }
            }
        }

        /* Add in numbers for other number types.  Do *NOT* look at the settings now and see if they are enabled.
        Add them all in and whether we show it or not is based on filtering with a show*function later.
        Adding and re-calculating and re-sorting when the settings change is too slow, so compute and have them
        on hand even if not turned on now. */
        for (let numberTypesIdx = 0; numberTypesIdx < numberTypes.length; numberTypesIdx++) {

            const numberType = numberTypes[numberTypesIdx];
            const sortedInterestingNumbers = sortedInterestingNumbersMap[numberType];

            for (var sortedListIndex = 0; sortedListIndex < sortedInterestingNumbers.length; sortedListIndex++) {
                const info = sortedInterestingNumbers[sortedListIndex];

                if (unit === "years" && Number.isInteger(info.number)) {
                    // We add in years already.  We only need to do years if it's not a non-integer like our constants
                    continue;
                }

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

                const isConstant = INTERESTING_CONSTANTS[numberType] ? true : false;
                let numberCode;
                if (isConstant) {
                    /* For constants we have a numberCode that lets us know
                        what this number was in relation to the constant */
                    if (info.tags.indexOf("constantOtherMultiple") >= 0) {
                        numberCode = 3;
                    } else if (info.tags.indexOf("constantTenMultiple") >= 0) {
                        numberCode = 2;
                    } else if (info.tags.indexOf("constantExact") >= 0) {
                        numberCode = 1;
                    }
                }

                const newMilestone = createMilestoneIfNeeded(unit, start, end, info.number, info.descriptor, numberType, numberCode);
                if (newMilestone) {
                    milestoneList.push(newMilestone);
                }

            }
        }
    }

    // Sort it
    milestoneList = milestoneList.sort((a, b) => { return (a.time - b.time); });

    /* Get the index where the current or future milestones happen
        Declare the variable before the for loop so it's in scope when we use it below
    */
    let afterPastIdx = 0;
    for (afterPastIdx = 0; afterPastIdx <= milestoneList.length; afterPastIdx++) {
        if (milestoneList[afterPastIdx].time >= nowTime) {
            break;
        }
    }

    // Take out some from beginning if needed
    const numToRemove = afterPastIdx - maxNumMilestonesPast;
    if (numToRemove > 0) {
        milestoneList.splice(0, numToRemove); // splice removes from original array
    }

    return milestoneList;

}
export const createMilestones = nanomemoize(unmemoizedCreateMilestones);
