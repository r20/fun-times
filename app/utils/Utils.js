import React, { Component } from 'react'
import moment from 'moment-timezone'

import { Decimal } from 'decimal.js-light'
import * as logger from '../utils/logger'

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
export function fromMillisToUnit(unit, milliseconds) {
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
export function fromUnitToMillis(unit, numberInUnits) {
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


/**
 * Returns string for showing number and if specified the units.
 * 
 * E.g. 12345.67 is changed to "12,345.67"
 * Really big numbers or numbers less than .01 are shown in exponential format
 * 
 * decimal - (Decimal|Number)
 * showDecimals - optional, whether to show what's after the decimal (if not showing it in exponential format)
 * units - (String), optional
 */
export const numberToFormattedString = (number, showDecimals, units) => {
  const dec = new Decimal(number);  // create new because this may be number, but even if Decimal we may change precision for display
  const exponentialPlaces = 7;
  const unitsWithSpace = units ? " " + units : '';

  if (dec.eq(0)) {
    return "0";
  } else if (dec.lt(.001) || dec.gte(1000000000000)) {
    if (showDecimals) {
      return dec.toExponential(exponentialPlaces) + unitsWithSpace;
    } else {
      return dec.toExponential(0) + unitsWithSpace;
    }
  } else if (dec.isInteger()) {
    // Add commas
    return (dec.toString()).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else if (dec.lt(1)) {
    return dec.toString() + unitsWithSpace;
  } else {
    // It is > 1 and < the big number above and is NOT an integer

    var parts = dec.toString().split(".");
    if (!showDecimals) {
      // There won't be a decimal here (because of setting precision) but we still want to work with parts array later so do split.
      parts = dec.toPrecision(parts[0].length).split(".");
    } else if (parts[0].length > exponentialPlaces) {
      // just show whole part if it's this big
      // There won't be a decimal here (because of setting precision) but we still want to work with parts array later so do split.
      parts = dec.toPrecision(parts[0].length).split(".");
    } else {
      parts = dec.toPrecision(exponentialPlaces).split(".");
    }

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".") + unitsWithSpace;
  }
}



/**
 * Return nicely formatted string for the date object
 * date - Date object
 */
export function getDisplayStringForDate(date) {
  if (date && typeof date === "object") {
    //   ** If change, this also change getDisplayStringDateTimeForEpoch **
    return moment(date).format('YYYY-MM-DD');
  }
  logger.warn("Something is wrong with the date", date);
  return '????-??-??';
}

/**
 * Return nicely formatted string for the date object
 * date - Date object
 */
export function getDisplayStringForTime(date) {
  if (date && typeof date === "object") {
    /* Would be nice to know if device is using 24 hour format
      and display accordingly, but that was difficult. 
      
      // 'h:mm:ssa'for am/pm else do 'H:mm:ss' for 24 hr
      moment(date).format('h:mm:ssa') 
      */
    //   ** If change, this also change getDisplayStringDateTimeForEpoch **
    return moment(date).format('h:mm:ssa');
  }

  logger.log("Something is wrong with the time", date);
  return '????';
}

export function capitalize(s) {
  if (typeof s !== 'string') {
    return s;
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
}


export function getDisplayStringDateTimeForEvent(event) {

  if (event) {
    return getDisplayStringDateTimeForEpoch(event.epochMillis, event.isAllDay);
  }
  logger.log("Something is wrong with the event");
  return '????-??-?? ????';
}

export function getDisplayStringDateTimeForEpoch(epochMillis, noShowTimeOfDay = true) {
  try {
    const date = new Date(epochMillis);
    if (noShowTimeOfDay) {
      return getDisplayStringForDate(date);
    } else {
      // If change this, also change getDisplayStringForDate and/or getDisplayStringForTime
      return moment(date).format('YYYY-MM-DD h:mm:ssa');
    }

  } catch (err) {
    logger.warn("Error while getting display date", epochMillis, err);
  }

  return '????-??-?? ????';
}