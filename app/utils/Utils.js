import React, { Component } from 'react';

import { Decimal } from 'decimal.js-light';

/**
 * Most of the code in here is for finding interesting milestones.
 * It was quick proof of concept code, needing refactoring.
 * The new code will look for more things, do more tagging,
 * and consider number of items found and not just a range to
 * look in.
 * Since there became a need to use Decimal for accuracy,
 * it may be helpful to have typescript code that
 * does the calculations.
 */



/**
 * Find numbers with all the same digit, like 22222 or 777.
 * Returns array of interesting numbers found.
 * 
 * @param {Decimal} start - start of range to look for interesting number within
 * @param {Decimal} end - end of range to look for interesting number within
 */
function findRepdigitsInRange(start, end) {
  const found = [];
  if (end.lt(111)) {
    // Not interesting enough if only 2 digits
    return [];
  }

  const startlength = Math.log(start.toNumber()) * Math.LOG10E + 1 | 0;
  const manyones = '11111111111111111111111111111111111111111111111111111111111111111111111';

  // Needs to be at least 3 to be interesting
  let repones = Number(manyones.slice(0, Math.max(3, startlength)));
  let repdigit = repones;
  while (end.gte(repdigit)) {
    if (start.lte(repdigit)) {
      found.push(repdigit);
    }
    console.log("repdigit is ", repdigit);
    if (String(repdigit).charAt(0) === '9') {
      // Go to the next repdigit by getting more ones (e.g. from 9999 to 11111)
      repones = Number(String(repones) + '1');
      repdigit = repones;
    } else {
      // Go to the next repdigit (e.g. from 2222 to 3333)
      repdigit = repdigit + repones;
    }
  }
  console.log("Interesting repdigits within the range ", start, end, " are: ", found);

  return found;
}


/**
 * Find interesting numbers like 1234567, 54321, or 543210
 * (They count up starting with 1, or count down to 1,
 *  or count down to 0)
 * Returns array of interesting numbers found.
 * 
 * @param {Decimal} start - start of range to look for interesting number within
 * @param {Decimal} end - end of range to look for interesting number within
 */
function findConsecutivesInRange(start, end) {
  const found = [];
  if (end.lt(123)) {
    // Not interesting enough if only 2 digits
    return [];
  }

  const startlength = Math.log(start.toNumber()) * Math.LOG10E + 1 | 0;
  const endlength = Math.log(end) * Math.LOG10E + 1 | 0;
  const goingdown = '9876543210';
  const goingup = '123456789';

  for (var len = Math.max(3, startlength); len <= Math.min(endlength, 10); len++) {
    let interesting;

    if (len <= 9) {
      /* These are counting up from 1 */
      interesting = Number(goingup.slice(0, len));
      if (start.lte(interesting) && end.gte(interesting)) {
        found.push(interesting);
      }

      /* These are counting down, ending in 1 */
      interesting = Number(goingdown.slice(9 - len, 9));
      console.log("interesting ", interesting);
      if (start.lte(interesting) && end.gte(interesting)) {
        found.push(interesting);
      }
    }
    if (len >= 4) {
      /* These are counting down, ending in 0
        210 isn't very interesting, so needs
        to be at least 3210 (4 in length) */
      interesting = Number(goingdown.slice(10 - len, 10));
      console.log("interesting ", interesting);
      if (start.lte(interesting) && end.gte(interesting)) {
        found.push(interesting);
      }
    }

    console.log("Interesting countup/countdown within the range ", start, end, " are: ", found);

  }
  return found;
}


/**
 * Find interesting numbers that mostly end in zeros
 * (like 12000 or 34000000) that when multiplied by num
 * are within the range.
 * If num is 1, it might find interesting numbers like 12000, 13000, 14000, etc.
 * If num is pi, it might find 20000 and 21000 if pi*20000 and pi*21000 are within the range.
 * 
 * @param {Number or Decimal} num - A factor that when multiplied by an interesting number is in the range
 * @param {Decimal} start - start of range to look for interesting number within
 * @param {Decimal} end - end of range to look for interesting number within
 */
function findInterestingFactorsInRange(num, start, end) {
  if (num <= 0) {
    return [];
  }

  const factors = [];
  const startFactor = Math.ceil(start.div(num).toNumber());
  const endFactor = Math.floor(end.div(num).toNumber());
  if (startFactor <= endFactor) {
    const length = Math.log(startFactor) * Math.LOG10E + 1 | 0;
    if (length === 0) {
      return [];
    }
    const increment = (length >= 4) ? Math.pow(10, length - 2) : Math.pow(10, length - 1);

    for (let interesting = increment * (Math.ceil((new Decimal(startFactor)).div(increment))); interesting <= endFactor; interesting = interesting + increment) {
      factors.push(interesting);
    }
  }
  console.log("Interesting factors that combine with ", num, " within the range ", start, end, " are: ", factors);
  return factors;
}

/**
 * Find binary numbers starting with 1 then all zeros.
 * (i.e. 2^N)
 * 
 * Returns array of interesting numbers found.
 * 
 * @param {Decimal} start - start of range to look for interesting number within
 * @param {Decimal} end - end of range to look for interesting number within
 */
function findBinariesWithOneOneInRange(start, end) {
  const found = [];
  const nums = [];
  const base = 2
  let exponent = 2;
  let num = Math.pow(base, exponent);
  while (end.gte(num)) {
    if (start.lte(num)) {
      found.push(exponent);
      nums.push(num);
    }
    exponent = exponent + 1;
    num = Math.pow(base, exponent);
  }

  console.log("Interesting binaries within the range ", start, end, " are: ", found, nums);

  return found;
}


/**
 * Find "super powers" (n^n) within the range.
 * E.g. 2^2, 3^3, 4^4, etc.
 * 
 * Returns array of interesting numbers found.
 * 
 * @param {Decimal} start - start of range to look for interesting number within
 * @param {Decimal} end - end of range to look for interesting number within
 */
function findSuperPowersInRange(start, end) {
  const found = [];
  const nums = [];
  let baseAndExpo = 4;
  let num = Math.pow(baseAndExpo, baseAndExpo);
  while (end.gte(num)) {
    if (start.lte(num)) {
      found.push(baseAndExpo);
      nums.push(num);
    }
    baseAndExpo = baseAndExpo + 1;
    num = Math.pow(baseAndExpo, baseAndExpo);
  }

  const othersToTry = [PI_DECIMAL];
  for (var idx = 0; idx < othersToTry.length; idx++) {
    num = Math.pow(othersToTry[idx].toNumber(), othersToTry[idx].toNumber());
    if (start.lte(num) && end.gte(num)) {
      found.push(othersToTry[idx].toNumber());
      nums.push(num);
    }
  }
  console.log("Interesting super powers within the range ", start, end, " are: ", found, nums);

  return found;
}


/**
 * fromMillisToUnit and fromUnitToMillis
 * don't account for leap years or leap seconds.
 * They along with most other code in here will be replaced.
 */


/**
 * Converts the milliseconds to the unit specified and 
 * retrns it as a Decimal type.
 * 
 * @param {String} unit - string representing time units (e.g. minutes, seconds, etc.)
 * @param {Number} milliseconds
 */
function fromMillisToUnit(unit, milliseconds) {
  const millis = new Decimal(milliseconds);
  if (unit === 'seconds') {
    return millis.div(1000);
  } else if (unit === 'minutes') {
    return millis.div(1000).div(60);
  } else if (unit === 'hours') {
    return millis.div(1000).div(60).div(60);
  } else if (unit === 'days') {
    return millis.div(1000).div(60).div(60).div(24);
  } else if (unit === 'months') {
    return millis.div(1000).div(60).div(60).div(24).div(30.4375);
  } else if (unit === 'years') {
    return millis.div(1000).div(60).div(60).div(24).div(365.25);
  }
}

/**
 * Converts the numberInUnits based on unit to milliseconds.
 * 
 * @param {String} unit - string representing time units (e.g. minutes, seconds, etc.)
 * @param {Number} numberInUnits - number to be converted.
 */
function fromUnitToMillis(unit, numberInUnits) {
  let num = new Decimal(numberInUnits);
  let ans;
  if (unit === 'seconds') {
    ans = num.times(1000);
  } else if (unit === 'minutes') {
    ans = num.times(1000).times(60);
  } else if (unit === 'hours') {
    ans = num.times(1000).times(60).times(60);
  } else if (unit === 'days') {
    ans = num.times(1000).times(60).times(60).times(24);
  } else if (unit === 'months') {
    ans = num.times(1000).times(60).times(60).times(24).times(30.5);
  } else if (unit === 'years') {
    ans = num.times(1000).times(60).times(60).times(24).times(365.25);
  }
  return Math.round(ans.toNumber());
}


const PI_DECIMAL = new Decimal(3.141592653589);
const EULERS_DECIMAL = new Decimal(2.71828);
const PHI_DECIMAL = new Decimal(1.618033988749895);


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
export function InterestingDatesFinder(event, nowTime, futureDistanceDays) {

  const eventTime = event.epochMillis;
  const futureTime = nowTime + fromUnitToMillis("days", futureDistanceDays);
  const eventToNow = nowTime - eventTime; // elapsed time period between event and now
  const eventToFuture = futureTime - eventTime; // elapsed time period between event and futureDistanceDays

  const units = ['seconds', 'minutes', 'hours', 'days', 'months', 'years'];
  var somenums = [];
  var interestingList = [];
  for (let idx = 0; idx < units.length; idx++) {
    const unit = units[idx];
    console.log(" Before getting start and end");
    var start = fromMillisToUnit(unit, eventToNow);
    var end = fromMillisToUnit(unit, eventToFuture);
    console.log(" After getting start and end");

    console.log(" Unit ", unit, start, end);

    somenums = findSuperPowersInRange(start, end);

    for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
      const power = somenums[sIdx];
      var interestingInfo = {
        event: event,
        unit: unit,
        tags: ["Super power"],
        description: "Super power!! " + power + "^" + power + " (" + numberWithCommas(Math.pow(power, power)) + ")",
        time: eventTime + fromUnitToMillis(unit, Math.pow(power, power)),
      };
      interestingList.push(interestingInfo);
    }

    if (unit !== "years") {
      somenums = findInterestingFactorsInRange(1, start, end);
      for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
        const num = somenums[sIdx];
        var interestingInfo = {
          event: event,
          unit: unit,
          tags: [unit],
          description: numberWithCommas(num),
          time: eventTime + fromUnitToMillis(unit, num),
        };
        interestingList.push(interestingInfo);
        console.log(" The num and millis: ", num, fromUnitToMillis(unit, num));
      }
    }

    const data = [
      {
        tag: 'pi',
        mult: PI_DECIMAL
      },
      // {
      //   tag: "e (Euler's number)",
      //   mult: EULERS_DECIMAL
      // },
      // {
      //   tag: "phi (golden number)",
      //   mult: PHI_DECIMAL
      // },
    ];
    for (dIdx = 0; dIdx < data.length; dIdx++) {
      const tag = data[dIdx].tag;
      const mult = data[dIdx].mult;

      somenums = findInterestingFactorsInRange(mult, start, end);
      for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
        const num = somenums[sIdx];
        var interestingInfo = {
          event: event,
          unit: unit,
          tags: [tag, unit],
          description: numberWithCommas(num) + "*" + tag + " (" + numberWithCommas(Math.round(num * mult)) + ")",
          time: eventTime + fromUnitToMillis(unit, num * mult),
        };
        interestingList.push(interestingInfo);
      }
    }

    somenums = findBinariesWithOneOneInRange(start, end);
    for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
      const expo = somenums[sIdx];
      var interestingInfo = {
        event: event,
        unit: unit,
        tags: ["binary", unit],
        description: "Binary! 2^" + numberWithCommas(expo) + " (" + numberWithCommas(Math.pow(2, expo)) + ")",
        time: eventTime + fromUnitToMillis(unit, Math.pow(2, expo)),
      };
      interestingList.push(interestingInfo);
    }

    somenums = findConsecutivesInRange(start, end);
    for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
      const num = somenums[sIdx];
      var interestingInfo = {
        event: event,
        unit: unit,
        tags: [unit],
        description: numberWithCommas(num),
        time: eventTime + fromUnitToMillis(unit, num),
      };
      interestingList.push(interestingInfo);
    }

    somenums = findRepdigitsInRange(start, end);
    for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
      const num = somenums[sIdx];
      var interestingInfo = {
        event: event,
        unit: unit,
        tags: [unit], // could tag with the digit
        description: numberWithCommas(num),
        time: eventTime + fromUnitToMillis(unit, num),
      };
      interestingList.push(interestingInfo);
    }
  }
  return interestingList;

}

/**
 * Converts number (x) to a string with commas.
 * TBD - It would be nice to convert to a format
 * based on locale because not everyone is used
 * to commas.
 * 
 * E.g. 12345.67 is changed to "12,345.67"
 * x - number
 */
export function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/**
 * Return nicely formatted string for the date
 * object according to locale.
 * date - Date object
 */
export function getDisplayStringForDate(date) {
  try {
    if (date && date.toLocaleDateString) {
      return date.toLocaleDateString();
    }
  } catch (err) {
    console.warn("Error with date", err);
  }

  console.log("Something is wrong with the date");
  return '????/??/??';
}