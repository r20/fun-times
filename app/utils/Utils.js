import React, { Component } from 'react';

import { Decimal } from 'decimal.js-light';

/* 

  Most of the code in here is for finding interesting milestones.
  It was quick proof of concept code, and needs refactored
  and cleaned up.

  TBD - Other interesting numbers to consider:
  prime numbers (prime time), although there may be too many
*/


function findMultiplesOfNumberInRange(num, start, end) {
  if (num <= 0) {
    return [];
  }

  const multiples = [];
  const startMultiple = Math.ceil(start.div(num).toNumber());
  const endMultiple = Math.floor(end.div(num).toNumber());
  if (startMultiple <= endMultiple) {
    // We want the interesting multiples between these
    const length = Math.log(startMultiple) * Math.LOG10E + 1 | 0;
    if (length === 0) {
      return [];
    }
    const increment = (length >= 4) ? Math.pow(10, length - 2) : Math.pow(10, length - 1);

    for (let interesting = increment * (Math.ceil((new Decimal(startMultiple)).div(increment))); interesting <= endMultiple; interesting = interesting + increment) {
      multiples.push(interesting);
    }
  }
  console.log("Interesting multiples of ", num, " within the range ", start, end, " are: ", multiples);
  return multiples;
}


/**
 * Find numbers like 22222 or 777 
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
      // Get more ones
      repones = Number(String(repones) + '1');
      repdigit = repones;
    } else {
      repdigit = repdigit + repones;
    }
  }
  console.log("Interesting repdigits within the range ", start, end, " are: ", found);

  return found;
}


/**
 * Find numbers like 1234567 or 54321 
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
      /* These are counting down, ending in 1
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
 * Find binary numbers starting with 1 then all zeros.
 * (i.e. 2^N)
 * TBD - could find other interesting binary patterns in another function.
 */
function findExponentsForBinariesInRange(start, end) {
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
 * TBD: During a refactor, this wasn't updated, and it's not used anymore.
 * It needs updated to use Decimal.
 * 
 * Using event date division, 1980/12/25 (6.6) * 10^n
 * Using event date subtraction, 1980-12-25 (1943) * 10^n
 * 
 * TBD - And this never got implemented:
 * Using event date, 1980 12 25 (year month day) or 25 12 1980 (day month year) or 12 25 1980 (month day year) * 10^n
 */
function findEventDateNumbersInRange(eventdate, start, end) {
  const found = [];
  const year = eventdate.getFullYear();
  const month = eventdate.getMonth() + 1; // +1 because it uses 0-11
  const day = eventdate.getDate();

  // Using event date division, 1980/12/25 (6.6)
  const withdivision = year / month / day;

  // Using event date subtraction, 1980-12-25 (1943)
  const withsubtraction = year - month - day;
  let tenpower = 0;
  let num = withsubtraction * Math.pow(10, tenpower);
  while (num <= end) {
    if (num >= start) {
      found.push(num);
    }
    tenpower = tenpower + 1;
    num = withsubtraction * Math.pow(10, tenpower);
  }

  tenpower = 0;
  num = withdivision * Math.pow(10, tenpower);
  while (num <= end) {
    if (num >= start) {
      found.push(num);
    }
    tenpower = tenpower + 1;
    num = withdivision * Math.pow(10, tenpower);
  }


  console.log("Interesting numbers using event date within the range ", start, end, " are: ", found);

  return found;
}


/*
  TBD - fromMillisToUnit and fromUnitToMillis
  need improved to account for leap years and leap seconds.
  To do so, need dates to be part of the function too.
  When update code to use moment.js or another library
  we can either fix or replace these.
*/

/**
 * Returns Decimal type of number in the units specified.
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
 * TBD - Other things to add:
 * 
 * Have a slice of pi (find a number within the digits of pi)
 * More variations using event date, like eventmonth^eventday
 * or eventmonth and eventday only (not year)
 * Have upcoming events.
 * Have predetermined holidays and special dates they can pick from 
 * (like Thanksgiving, Super Bowl, Pi Day, etc. )
 */

export function InterestingDatesFinder(event, nowTime, futureDistanceDays) {

  const eventTime = event.epochMillis;

  const futureTime = nowTime + fromUnitToMillis("days", futureDistanceDays);

  const eventToNow = nowTime - eventTime;
  const eventToFuture = futureTime - eventTime;

  const eventDate = new Date(eventTime);


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
      // TBD - need to account for special powers, like pi (to tell them it's pi)
      // And maybe I need to be able to group all pi things together.
    }

    if (unit !== "years") {
      somenums = findMultiplesOfNumberInRange(1, start, end);
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

      somenums = findMultiplesOfNumberInRange(mult, start, end);
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

    somenums = findExponentsForBinariesInRange(start, end);
    // TBD Need to maybe also show this in binary form??
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

export function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

/**
 * Return nicely formatted string for the date
 * according to locale.
 * If date doesn't look like Date object, just return date.
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