
import { Decimal } from 'decimal.js-light';

import * as logger from './logger'
import { numberWithCommas } from './Utils'
import { maxNumberOfYearsAway } from '../components/EventDateTimePicker'

/*
  This file has useful functions for finding interesting times.

  TBD - See https://www.janko.at/Humor/Wissenschaft/Runde%20Zahlen.htm
  about round numbers.
  Maybe we'll have categories for types of numbers people may be interested in
  e.g. physicists, mathematicians, electricians, etc.
*/




/**
 * Find numbers with all the same digit, like 22222 or 777.
 * Must be at least 3 digits.
 * Returns array of interesting numbers found.
 * 
 * @param {Number} start - start of range to look for interesting numbers within
 * @param {Number} end - end of range to look for interesting numbers within
 */
function findRepdigitsInRange(start, end) {
  const found = [];
  if (end < 111) {
    // Not interesting enough if only 2 digits
    return [];
  }

  const startlength = Math.log(start) * Math.LOG10E + 1 | 0;
  const manyones = '11111111111111111111111111111111111111111111111111111111111111111111111';

  // Needs to be at least 3 to be interesting
  let repones = Number(manyones.slice(0, Math.max(3, startlength)));
  let repdigit = repones;
  while (end >= repdigit) {
    if (start <= repdigit) {
      found.push(repdigit);
    }
    logger.log("repdigit is ", repdigit);
    if (String(repdigit).charAt(0) === '9') {
      // Go to the next repdigit by getting more ones (e.g. from 9999 to 11111)
      repones = Number(String(repones) + '1');
      repdigit = repones;
    } else {
      // Go to the next repdigit (e.g. from 2222 to 3333)
      repdigit = repdigit + repones;
    }
  }
  return found;
}


/**
 * Find interesting numbers like 1234567, 54321, or 543210
 * (They count up starting with 1, or count down to 1,
 *  or count down to 0)
 * Returns array of interesting numbers found.
 * 
 * @param {Number} start - start of range to look for interesting numbers within
 * @param {Number} end - end of range to look for interesting numbers within
 */
function findConsecutivesInRange(start, end) {
  const found = [];
  if (end < 123) {
    // Not interesting enough if only 2 digits
    return [];
  }

  const startlength = Math.log(start) * Math.LOG10E + 1 | 0;
  const endlength = Math.log(end) * Math.LOG10E + 1 | 0;
  const goingdown = '9876543210';
  const goingup = '123456789';

  for (var len = Math.max(3, startlength); len <= Math.min(endlength, 10); len++) {
    let interesting;

    if (len <= 9) {
      /* These are counting up from 1 */
      interesting = Number(goingup.slice(0, len));
      if (start <= interesting && end >= interesting) {
        found.push(interesting);
      }

      /* These are counting down, ending in 1 */
      interesting = Number(goingdown.slice(9 - len, 9));
      if (start <= interesting && end >= interesting) {
        found.push(interesting);
      }
    }
    if (len >= 4) {
      /* These are counting down, ending in 0
        210 isn't very interesting, so needs
        to be at least 3210 (4 in length) */
      interesting = Number(goingdown.slice(10 - len, 10));
      if (start <= interesting && end >= interesting) {
        found.push(interesting);
      }
    }
  }
  return found;
}


/**
 * Find interesting numbers that mostly end in zeros (round factors)
 * (like 2000 or 4000000) that when multiplied by the multiplier parameter.
 * are within the range.
 * For example,
 * If multiplier is 1, it might find  1000, 2000, 3000, etc.
 * If multiplier is pi, it might find pi*20000 and pi*21000 
 * 
 * Returns an array of interesting numbers that when multiplied by multiplier are within the range.
 * 
 * @param {Number|Decimal} multiplier - A factor that when multiplied by an interesting number is in the range
 * @param {Decimal} start - start of range to look for interesting numbers within
 * @param {Decimal} end - end of range to look for interesting numbers within
 */
function findRoundFactorsInRange(multiplier, start, end) {

  const multiplierDecimal = new Decimal(multiplier);
  const startDecimal = new Decimal(start);
  const endDecimal = new Decimal(end);
  if (multiplierDecimal.lte(0)) {
    return [];
  }

  const factors = [];

  const startFactor = Math.ceil(startDecimal.div(multiplierDecimal).toNumber());
  const endFactor = Math.floor(endDecimal.div(multiplierDecimal).toNumber());
  if (startFactor <= endFactor) {
    let length = Math.log(startFactor) * Math.LOG10E + 1 | 0;

    length = Math.max(2, length);  // Needs to have some minimum amount of digits to be interesting
    let base = Math.pow(10, length - 1);

    let firstDigit = Math.ceil((new Decimal(startFactor)).div(base));
    let interesting = firstDigit * base;
    while (interesting <= endFactor) {
      factors.push(interesting);
      firstDigit++;

      /* We go from 10 to 100 by 10s, and 100 to 1000 by 100s
        then starting at 1000 (length 4) we allow 2 non zero
        digits (e.g. 8,000 9,000 10,000 11,000 12,000 ... ) */
      if (length < 4 && firstDigit > 9) {
        length++;
        base = base * 10;
        firstDigit = 1;

      } else if (length >= 4 && firstDigit > 99) {
        firstDigit = 1;
        base = base * 100;
      }
      interesting = firstDigit * base;
    }

  }
  return factors;
}

/**
 * Find integer exponents (expo) that are >=2 such that
 * the power (base^expo) is within the start and end range.
 * 
 * Returns array of the exponents
 * 
 * @param {Decimal|Number} base - Should be > 1
 * @param {Number} start - start of range to look for interesting exponents within
 * @param {Number} end - end of range to look for interesting exponents within
 */
function findExponentsForBaseSoPowerInRange(base, start, end) {
  const decimalBase = new Decimal(base);

  if (decimalBase.lt(2) || start > end) {
    return [];
  }

  const found = [];
  let exponent = 2;
  let powerDecimal = decimalBase.toPower(exponent);
  while (powerDecimal.lte(end)) {
    if (powerDecimal.gte(start)) {
      found.push(exponent);
    }
    exponent = exponent + 1;
    powerDecimal = decimalBase.toPower(exponent);
  }
  return found;
}


/**
 * Find "super powers" (n^n) where n is an integer >= 4 within the range.
 * E.g. 4^4, 5^5, 6^6, etc.
 * 
 * Returns array of interesting powers (the "n") found.
 * 
 * @param {Number} start - start of range to look for interesting powers within
 * @param {Number} end - end of range to look for interesting powers within
 */
function findSuperPowersInRange(start, end) {
  const found = [];
  let baseAndExpo = 4;
  let num = Math.pow(baseAndExpo, baseAndExpo);
  while (end >= num) {
    if (start <= num) {
      found.push(baseAndExpo);
    }
    baseAndExpo = baseAndExpo + 1;
    num = Math.pow(baseAndExpo, baseAndExpo);
  }

  return found;
}

/**
 * Returns true if power^power is within the range.
 * 
 * @param {Decimal|Number} power 
 * @param {Number} start - start of range
 * @param {Number} end - end of range
 */
function isSuperPowerInRange(power, start, end) {
  const powerDecimal = new Decimal(power);
  const superPowerDecimal = powerDecimal.toPower(powerDecimal);
  return superPowerDecimal.gte(start) && superPowerDecimal.lte(end);
}

export const interestingNumberTypes = {
  ROUND: 'round',
  SUPER_POWER: 'super power',
  BINARY: 'binary',
  COUNT: 'count',
  REPEATING_DIGITS: 'repeating digits',
  PI: 'pi',
}

/* jmr - instead of having these in the map,
I should have a function that can derive
interesting numbers from each list.
So, instead of just the round*pi I could have binary*pi and others too.
*/

const PI_DECIMAL = new Decimal(3.141592653589);
const EULERS_DECIMAL = new Decimal(2.71828);
const PHI_DECIMAL = new Decimal(1.618033988749895);

const sortFunction = (a, b) => {
  return (a.number - b.number);
}


let sortedInterestingNumbersMap = {};

/**
 * Returns a map with interestingNumberTypes as keys and an array of interesting number
 * objects for that type as the value.
 * 
 * The objects have
 *  tags: array, e.g. [ "super power"] or ["pi"]
 *  descriptor: A partial description of what was found
 *  number: The number in and of itself might not seem interesting, and the descriptor and tags help explain its interest.
 */
export function getSortedInterestingNumbersMap() {

  if (sortedInterestingNumbersMap[interestingNumberTypes.ROUND]) {
    // We've already generated the interestingNumbersMap.  It only needs done once.
    return sortedInterestingNumbersMap;
  }

  const start = new Decimal(100);

  /* If an event was older than maxNumberOfYearsAway it'd mess us up.
  This could happen if a standard evnet was created that was older, or if maxNumberOfYearsAway
  changed, or if created an event then waited more than 10 years using the app. */
  const bigNumberOfSeconds = (maxNumberOfYearsAway + 10) * 366 * 24 * 3600
  const end = new Decimal(bigNumberOfSeconds);

  let somenums;
  let interestingList = [];


  somenums = findRoundFactorsInRange(1, start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: [interestingNumberTypes.ROUND],
      descriptor: numberWithCommas(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[interestingNumberTypes.ROUND] = interestingList;


  /* Need to also find super powers using oher numbers, like pi,
    and tag them with both super power and other tag */
  somenums = findSuperPowersInRange(start, end);
  interestingList = [];
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const power = somenums[sIdx];
    const num = Math.pow(power, power);
    var interestingInfo = {
      tags: [interestingNumberTypes.SUPER_POWER],
      descriptor: "Super power!! " + power + "^" + power + " (" + numberWithCommas(Math.pow(power, power)) + ")",
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[interestingNumberTypes.SUPER_POWER] = interestingList;

  const data = [
    {
      tag: interestingNumberTypes.PI,
      multDecimal: PI_DECIMAL
    },
    // {
    //   tag: "e (Euler's number)",
    //   multDecimal: EULERS_DECIMAL
    // },
    // {
    //   tag: "phi (golden number)",
    //   multDecimal: PHI_DECIMAL
    // },
  ];
  for (let dIdx = 0; dIdx < data.length; dIdx++) {
    const tag = data[dIdx].tag;
    const multDecimal = data[dIdx].multDecimal;

    interestingList = [];
    somenums = findRoundFactorsInRange(multDecimal, start, end);
    for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
      const factor = somenums[sIdx];

      const productDecimal = multDecimal.times(factor);

      let interestingInfo = {
        tags: [tag],
        descriptor: numberWithCommas(factor) + "*" + tag + " (" + numberWithCommas(productDecimal.toDecimalPlaces(0)) + ")",
        number: productDecimal.toNumber(),
      };
      interestingList.push(interestingInfo);
    }
    interestingList.sort(sortFunction);
    sortedInterestingNumbersMap[tag] = interestingList;

  }

  /**
   * If 2^expo is in range, it's an interesting binary number (starting with 1 and ending in all zeros)
   */
  interestingList = [];
  somenums = findExponentsForBaseSoPowerInRange(2, start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const expo = somenums[sIdx];
    const num = Math.pow(2,expo);
    let interestingInfo = {
      tags: [interestingNumberTypes.BINARY],
      descriptor: num.toString(2)+" binary (2^" + numberWithCommas(expo) + ", or " + numberWithCommas(Math.pow(2, expo)) + ")",
      number: Math.pow(2, expo),
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[interestingNumberTypes.BINARY] = interestingList;

  interestingList = [];
  somenums = findConsecutivesInRange(start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: [interestingNumberTypes.COUNT],
      descriptor: numberWithCommas(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[interestingNumberTypes.COUNT] = interestingList;

  interestingList = [];
  somenums = findRepdigitsInRange(start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: [interestingNumberTypes.REPEATING_DIGITS], // could tag with the digit
      descriptor: numberWithCommas(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[interestingNumberTypes.REPEATING_DIGITS] = interestingList;

  return sortedInterestingNumbersMap;
}


/**
 * This function calls others to get interesting numbers that
 * are within the start and end.
 * 
 * Returns an array of objects that contain info about the interesting numbers.
 * 
 * The objects have
 *  tags: array, e.g. [ "super power", "pi"]
 *  descriptor: A partial description of what was found
 *  number: The number within the range.  It in and of itself might not seem interesting, and the descriptor and tags help explain its interest.
 * 
 * @param {Number} start - start of range to look for interesting numbers within
 * @param {Number} end - end of range to look for interesting numbers within
 */
export function findInterestingNumbers(start, end) {

  var interestingList = [];

  let somenums;

  somenums = findRoundFactorsInRange(1, start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: ['round'],
      descriptor: numberWithCommas(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }

  /* Need to also find super powers using oher numbers, like pi,
    and tag them with both super power and other tag */
  somenums = findSuperPowersInRange(start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const power = somenums[sIdx];
    const num = Math.pow(power, power);
    var interestingInfo = {
      tags: ["super power"],
      descriptor: "Super power!! " + power + "^" + power + " (" + numberWithCommas(Math.pow(power, power)) + ")",
      number: num,
    };
    interestingList.push(interestingInfo);
  }

  const data = [
    {
      tag: 'pi',
      multDecimal: PI_DECIMAL
    },
    // {
    //   tag: "e (Euler's number)",
    //   multDecimal: EULERS_DECIMAL
    // },
    // {
    //   tag: "phi (golden number)",
    //   multDecimal: PHI_DECIMAL
    // },
  ];
  for (let dIdx = 0; dIdx < data.length; dIdx++) {
    const tag = data[dIdx].tag;
    const multDecimal = data[dIdx].multDecimal;


    somenums = findRoundFactorsInRange(multDecimal, start, end);
    for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
      const factor = somenums[sIdx];

      const productDecimal = multDecimal.times(factor);

      let interestingInfo = {
        tags: [tag],
        descriptor: numberWithCommas(factor) + "*" + tag + " (" + numberWithCommas(Decimal.round(productDecimal)) + ")",
        number: productDecimal.toNumber(),
      };
      interestingList.push(interestingInfo);
    }
  }

  /**
   * If 2^expo is in range, it's an interesting binary number (starting with 1 and ending in all zeros)
   */
  somenums = findExponentsForBaseSoPowerInRange(2, start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const expo = somenums[sIdx];
    let interestingInfo = {
      tags: ["binary"],
      descriptor: "Binary! 2^" + numberWithCommas(expo) + " (" + numberWithCommas(Math.pow(2, expo)) + ")",
      number: Math.pow(2, expo),
    };
    interestingList.push(interestingInfo);
  }

  somenums = findConsecutivesInRange(start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: ['count'],
      descriptor: numberWithCommas(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }

  somenums = findRepdigitsInRange(start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: ['repdigits'], // could tag with the digit
      descriptor: numberWithCommas(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }

  return interestingList;
}

/**
 * jmr - the interestingNumbers range end needs to be big enough.
 * Take out pi. Have that as its own list.
 * For each event, allow adding special numbers interested in,
 * including numbers in date by default.
 * (?? have slider for use specific numbers, then have specific numbers with checkbox and
 * have input(s) to let them put in more numbers and they have checkboxes by them )
 *
 * Since 1000 is interesting for days, but not minutes, need to handle that.
 * Perhaps have a min number for each unit?
 *
 * Do I need a sliding scale for showing more numbers?
 * If so, how will that work?
 * My birthday, for example, isn't showing anything.
 */
