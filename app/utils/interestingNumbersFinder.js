
import { Decimal } from 'decimal.js-light';

import i18n from '../i18n/i18n'
import * as logger from './logger'
import { numberToFormattedString, capitalize } from './Utils'


export const maxNumberOfYearsAway = 300; // If you ever change this, search for it's use and read about implications


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
 * Returns interesting numbers that when multiplied by decimalConstant are withing the specified range.
 * The interesting numbers are x*10^y where x is an integer 1-9.
 * (e.g. .01, .02, .03, .... 1, 2, 3, .... 100, 200, 300, etc.)
 * 
 * @param {Decimal} decimalConstant - A constant to look for multipliers for
 * @param {Number|Decimal} start - start of range to look for interesting numbers within
 * @param {Number|Decimal} end - end of range to look for interesting numbers within
 */
function findMultipliersForConstantInRange(decimalConstant, start, end) {

  let startFactorDecimal = (new Decimal(start)).div(decimalConstant);
  let endFactorDecimal = (new Decimal(end)).div(decimalConstant);

  // Not using floor or ceil. Divide and multiply by 10 to make sure we cover the full range.
  startFactorDecimal = startFactorDecimal.div(10);
  endFactorDecimal = endFactorDecimal.mul(10);

  const factors = [];
  let exponent = startFactorDecimal.exponent();
  let startsWithOneFactorDecimal = (new Decimal(10)).pow(exponent);
  while (decimalConstant.mul(startsWithOneFactorDecimal).lte(end)) {

    for (let num of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {

      const interestingCandidate = startsWithOneFactorDecimal.mul(num);
      let product = decimalConstant.mul(interestingCandidate);
      if (product.gte(start)) {
        if (product.gte(end)) {
          // We've gone too far. We're done.
          break;
        }
        factors.push(interestingCandidate.toNumber());
      }

      if (startsWithOneFactorDecimal.lt(1)) {
        /* Most of these aren't too interesting.  Just consider when it's a constantTenMultiple and has same digits.
        i.e. We will skip num 2-9 */
        break;
      }

    }
    startsWithOneFactorDecimal = startsWithOneFactorDecimal.mul(10);
  }

  return factors;
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
      if (interesting < 100) {
        // Count by 10s to 100
        interesting = interesting + 10;
      } else if (interesting < 1000) {
        // Count by 100s to 1,000
        interesting = interesting + 100;
      } else if (interesting < 10000) {
        // Count by 1,000s to 10,000
        interesting = interesting + 1000;
      } else if (interesting < 100000) {
        // Count by 10,000s to 100,000
        interesting = interesting + 10000;
      } else if (interesting < 1000000) {
        // count by 100,000s to 1,000,000
        interesting = interesting + 100000;
      } else if (interesting < 10000000) {
        // count by 1,000,000s to 10,000,000
        interesting = interesting + 1000000;
      } else {
        // count by 10,000,000s 
        interesting = interesting + 10000000;
      }
    }

  }

  return factors;
}



/**
 * Find numbers that use the digits from inputDecimal.
 * E.g. if inputDecimal was 98723.4, and start = 1 and end = 1,000
 * would return array of Decimal objects [Decimal(9.87324), Decimal(98.7324), Decimal(987.324)]
 * 
 * @param {Number} start - start of range to look for numbers
 * @param {Number} end - end of range
 */
function findDecimalsWithDigitsInRange(start, end, inputDecimal) {
  const found = [];
  let decimal = inputDecimal;
  while (decimal.gt(start) && decimal.gt(1)) {
    decimal = decimal.div(10);
  }
  while (decimal.lte(end)) {
    if (decimal.gte(start)) {
      found.push(decimal);
    }
    decimal = decimal.mul(10);
  }
  return found;
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

export const INTERESTING_CONSTANTS = {
  pi: { defaultUse: 2, decimal: new Decimal(3.141592653589) },
  euler: { defaultUse: 0, defaultUse: 0, decimal: new Decimal(2.71828182845904523536) },
  phi: { defaultUse: 0, decimal: new Decimal(1.618033988749895) },
  pythagoras: { defaultUse: 0, decimal: new Decimal(1.4142135623730950488016887242) }, // square root of 2
  mole: { defaultUse: 0, decimal: (new Decimal(6.02214076)).mul((new Decimal(10)).toPower(23)), units: "mol-1" },
  rGas: { defaultUse: 0, decimal: new Decimal(8.31446261815324), units: "J⋅K−1⋅mol−1" },
  faraday: { defaultUse: 0, decimal: new Decimal(96485.3321233100184), units: "C⋅mol−1" }, //  (magnitude of electrical charge per mole of electrons)
  gravity: { defaultUse: 0, decimal: (new Decimal(6.67430)).mul((new Decimal(10)).toPower(-11)), units: "m3⋅kg−1⋅s−2" },
  speedOfLight: { defaultUse: 2, decimal: new Decimal(299792458), units: "m/s" },

}

let temp = {};
for (let key in INTERESTING_CONSTANTS) {
  temp[key] = key;
}

// Add these plus what's in the INTERESTING_CONSTANTS to get INTERESTING_TYPES
export const INTERESTING_TYPES = Object.assign(temp, {
  round: "round",
  count: "count",
  repDigits: "repDigits",
  superPower: "superPower",
  binary: "binary",
});



/**
 * Return string for showing the decimal constant, also showing units if it has them.
 * numKey - string (one of the keys in INTERESTING_CONSTANTS )
 */
export const getDecimalDisplayValueForKey = (numKey) => {
  const units = INTERESTING_CONSTANTS[numKey].units || '';
  return numberToFormattedString(INTERESTING_CONSTANTS[numKey].decimal, true, units);

}


const sortFunction = (a, b) => {
  return (a.number - b.number);
}

let sortedInterestingNumbersMap = {};

/**
 * Returns a map with INTERESTING_TYPES as keys and an array of interesting number
 * objects for that type as the value.
 * Returns numbers of all types regardless of whether they'll be used according to settings.
 * 
 * The objects have
 *  tags: array, e.g. [ "super power"] or ["pi"]
 *  descriptor: A partial description of what was found
 *  number: The number in and of itself might not seem interesting, and the descriptor and tags help explain its interest.
 */
export function getSortedInterestingNumbersMap() {

  if (sortedInterestingNumbersMap[INTERESTING_TYPES.round]) {
    // We've already generated the interestingNumbersMap.  It only needs done once.
    return sortedInterestingNumbersMap;
  }

  const start = new Decimal(100); // For our set types of numbers that apply to all events, must be at least this big to be interesting

  /* If an event was older than maxNumberOfYearsAway it'd mess us up.
  This could happen if a standard event was created that was older, or if maxNumberOfYearsAway
  changed, or if created an event then waited more than 10 years using the app. */
  const bigNumberOfSeconds = (maxNumberOfYearsAway + 10) * 366 * 24 * 3600
  const end = new Decimal(bigNumberOfSeconds);

  let somenums;
  let interestingList = [];


  somenums = findRoundFactorsInRange(1, start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: [INTERESTING_TYPES.round],
      descriptor: numberToFormattedString(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[INTERESTING_TYPES.round] = interestingList;


  /* For each of the constants, find interesting multiplier numbers.  */
  for (numberKey in INTERESTING_CONSTANTS) {

    const interestingList = [];
    const decimalConstant = INTERESTING_CONSTANTS[numberKey].decimal;
    /* Use 1 as start, not zero.  Or else numbers between 0 and 1 may have factors that
    when multiplied by the decimalConstant are < 1 and they aren't useful for anything */
    const factors = findMultipliersForConstantInRange(decimalConstant, 1, end);

    for (factor of factors) {

      const decimalInteresting = decimalConstant.mul(factor);

      let translationKey;
      let descriptor;
      if (factor === 1) {
        translationKey = "constantExact";
        descriptor = i18n.t(translationKey, {
          numberName: i18n.t("numberName" + capitalize(numberKey)),
          someValue: numberToFormattedString(decimalInteresting, true), // don't use units for descriptor
        });

      } else {
        translationKey = "constantOtherMultiple";
        descriptor = i18n.t(translationKey, {
          multiplier: numberToFormattedString(factor),
          numberName: i18n.t("numberName" + capitalize(numberKey)),
          someValue: numberToFormattedString(decimalInteresting, true), // don't use units for descriptor
        });
      }

      let interestingInfo = {
        tags: [numberKey, translationKey],
        descriptor: descriptor,
        number: decimalInteresting.toNumber(),
      };
      interestingList.push(interestingInfo);
    }
    interestingList.sort(sortFunction);
    sortedInterestingNumbersMap[numberKey] = interestingList;

  }

  /* Need to also find super powers using oher numbers, like pi,
    and tag them with both super power and other tag */
  somenums = findSuperPowersInRange(start, end);
  interestingList = [];
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const power = somenums[sIdx];
    const num = Math.pow(power, power);
    var interestingInfo = {
      tags: [INTERESTING_TYPES.superPower],
      descriptor: i18n.t('superPowerDescription', { powerValue: power, formattedNumber: numberToFormattedString(num) }),
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);

  sortedInterestingNumbersMap[INTERESTING_TYPES.superPower] = interestingList;


  /**
   * If 2^expo is in range, it's an interesting binary number (starting with 1 and ending in all zeros)
   */
  interestingList = [];
  somenums = findExponentsForBaseSoPowerInRange(2, start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const expo = somenums[sIdx];
    const num = Math.pow(2, expo);
    let interestingInfo = {
      tags: [INTERESTING_TYPES.binary],
      descriptor: num.toString(2) + " binary (2^" + numberToFormattedString(expo) + ", or " + numberToFormattedString(Math.pow(2, expo)) + ")",
      number: Math.pow(2, expo),
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[INTERESTING_TYPES.binary] = interestingList;

  interestingList = [];
  somenums = findConsecutivesInRange(start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: [INTERESTING_TYPES.count],
      descriptor: numberToFormattedString(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[INTERESTING_TYPES.count] = interestingList;

  interestingList = [];
  somenums = findRepdigitsInRange(start, end);
  for (let sIdx = 0; sIdx < somenums.length; sIdx++) {
    const num = somenums[sIdx];
    let interestingInfo = {
      tags: [INTERESTING_TYPES.repDigits],
      descriptor: numberToFormattedString(num),
      number: num,
    };
    interestingList.push(interestingInfo);
  }
  interestingList.sort(sortFunction);
  sortedInterestingNumbersMap[INTERESTING_TYPES.repDigits] = interestingList;

  return sortedInterestingNumbersMap;
}
