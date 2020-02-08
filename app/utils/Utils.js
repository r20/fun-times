import React, { Component } from 'react';

import { Decimal } from 'decimal.js-light';
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
    logger.warn("Error with date", err);
  }

  logger.log("Something is wrong with the date");
  return '????/??/??';
}

/**
 * Return nicely formatted string for the date
 * object according to locale.
 * date - Date object
 */
export function getDisplayStringForTime(date) {
  try {
    if (date && date.toLocaleTimeString) {
      /* Would be nice to know if device is using 24 hour format
    and display accordingly, but that was difficult. */
      return date.toLocaleTimeString();
    }
  } catch (err) {
    logger.warn("Error with date time", err);
  }

  logger.log("Something is wrong with the time");
  return '????';
}


export function getDisplayStringDateTimeForEvent(event) {

  if (event) {
      return getDisplayStringDateTimeForEpoch(event.epochMillis, event.isFullDay);
  }
  logger.log("Something is wrong with the event");
  return '????/??/??';
}

export function getDisplayStringDateTimeForEpoch(epochMillis, noShowTimeOfDay = true) {
  try {
      const date = new Date(epochMillis);
      if (noShowTimeOfDay) {
          return date.toLocaleDateString();
      } else {
          /* Would be nice to know if device is using 24 hour format
              and display accordingly, but that was difficult. */
          return date.toLocaleDateString() + " " + date.toLocaleTimeString();
      }

  } catch (err) {
      logger.warn("Error while getting display date", err);
  }

  return '????/??/??';
}