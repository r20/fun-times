import React, { createContext } from 'react'
import { AsyncStorage } from 'react-native'
import moment from 'moment-timezone'

import { standardEventsData } from '../utils/standardEventsData'
import { cloneEvent } from '../utils/Event'
import * as logger from '../utils/logger'

import { createMilestones } from '../utils/milestones'
import { howManyDaysAheadCalendar, howManyDaysAgoCalendar } from './CalendarContext'
import { INTERESTING_TYPES, INTERESTING_CONSTANTS } from '../utils/interestingNumbersFinder'

/* This is an array of custom events */
const STORAGE_KEY_CUSTOM_EVENTS_ARRAY = '@save_custom_events_array';
/* This is an object with standard event keys as keys and true/false as value 
  depending on whether selected */
const STORAGE_KEY_STANDARD_EVENTS_KEY_TO_SELECTED_MAP = '@save_standard_events_key_to_selected_map';

const maxNumPastMilestonesPerEvent = 2; // jmr - where to keep this?

// jmr - where should we put this for milestone creation??
const nowTime = (new Date()).getTime();


/**
 * Returns a momentjs object for the event based on its epochMillis time.
 */
export function getMomentFromEvent(event) {
  const { title, epochMillis } = event;
  return moment(epochMillis);
}

function isEventSelected(event) {
  return (event && event.selected);
}

function eventSorter(a, b) {
  return a.epochMillis - b.epochMillis;

}

function milestoneSorter(a, b) {
  return a.time - b.time;
}

// These are created with defaults.  The provider sets the real values using value prop.
const EventsAndMilestonesContext = createContext({
  allEvents: [],
  allMilestones: [],
  customEvents: [],
  standardEvents: [],
  getEventWithTitle: () => { },
  addCustomEvent: () => { }, //jmr - change title of several of thee methods to have "AndMiletones", e.g. addCustomEventAndMilestones
  modifyEvent: () => { },
  removeCustomEvent: () => { },
  toggleEventSelected: () => { },
  removeAllCustomEvents: () => { },
  isEventSelected: isEventSelected,
  getCustomEventWithTitle: () => { return null; },
});



/**
 * Provides a way to see events of interest, including a way to 
 * add and remove custom events.
 * Uses AsyncStorage to track things.
 */
export class EventsAndMilestonesContextProvider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allMilestones: [],
      allEvents: [],
      customEvents: [],
      standardEventsSelectedMap: {},
      standardEvents: [],
    };
  }

  /* 
  jmr - i could remove this whole function until needed
  If make a code change that would break old stored events, put stuff in this function
    to upgrade them. 
    TODO - I could change code to store the event object version (or code version) and
    look at its version compared to current version and do update only if needed. */
  updateCustomEventsForAppUpdate = (customEvents) => {
    try {
      let needsSaved = false;
      for (var idx = 0; idx < customEvents.length; idx++) {
        const event = customEvents[idx];
        if (!event.tags) {
          needsSaved = true;
          event.tags = [];
        }
      }

      if (needsSaved) {
        this.saveCustomEvents(customEvents);
      }
    } catch (e) {
      logger.warn("Failed to do version upgrade for customEvents.");
      logger.log("Error from failing version upgrade of customEvents: ", e);
    }
    return customEvents;
  }

  async componentDidMount() {
    let customEvents = [];
    try {
      customEvents = await AsyncStorage.getItem(STORAGE_KEY_CUSTOM_EVENTS_ARRAY);
      customEvents = JSON.parse(customEvents);
      if (!customEvents) {
        customEvents = [];
      }
    } catch (e) {
      logger.warn("Failed to load customEvents.");
      logger.log("Error from failing to load customEvents: ", e);
    }

    const nowMillis = (new Date()).getTime();
    let standardEvents = standardEventsData || [];
    standardEvents = standardEvents.filter((val, idx) => {
      // If it's only important as a future event, then only include it if it's in the future
      if (val.ignoreIfPast && val.epochMillis < nowMillis) {
        return false;
      } else {
        return true;
      }
    });


    try {
      let standardEventsSelectedMap = await AsyncStorage.getItem(STORAGE_KEY_STANDARD_EVENTS_KEY_TO_SELECTED_MAP);
      standardEventsSelectedMap = JSON.parse(standardEventsSelectedMap);

      if (!standardEventsSelectedMap) {
        /* Since map is falsey (not even {}), this is probably first time using app. */
        standardEventsSelectedMap = {};
      }

      let aStandardEventWasSelectedByDefault = false;
      for (let idx = 0; idx < standardEvents.length; idx++) {
        const std = standardEvents[idx];
        if (standardEventsSelectedMap[std.key] === true) {
          std.selected = true;
        } else if (standardEventsSelectedMap[std.key] === undefined && std.isSelectedByDefault) {
          /* If standardEventsSelectedMap[std.key] is false, they've chosen to NOT have this
              standard event selected anymore. Leave it that way. */
          std.selected = true;
          aStandardEventWasSelectedByDefault = true;
        }
      }
      if (aStandardEventWasSelectedByDefault) {
        // Save them
        await this.saveSelectedStandardEventsMap(standardEventsSelectedMap);
      }

    } catch (e) {
      logger.warn("Failed to load or process selected standard events map.");
      logger.log("Error from failing to load selected standard events map: ", e);
    }

    // Generate milestones for all events
    let allMilestones = [];
    customEvents = this.updateCustomEventsForAppUpdate(customEvents);
    for (let event of customEvents) {
      allMilestones = allMilestones.concat(this.getMilestonesForEvent(event));

    }
    for (let event of standardEvents) {
      allMilestones = allMilestones.concat(this.getMilestonesForEvent(event));
    }

    // Sort everything
    allMilestones = allMilestones.sort(milestoneSorter);
    customEvents = customEvents.sort(eventSorter);
    standardEvents.sort(eventSorter);
    let allEvents = customEvents.concat(standardEvents);
    allEvents = allEvents.sort(eventSorter);

    this.setState({ allEvents, customEvents, standardEvents, allMilestones });
  }

  getMilestonesForEvent = (event) => {

     let milestonesForEvent = createMilestones(event, nowTime, howManyDaysAgoCalendar, howManyDaysAheadCalendar, maxNumPastMilestonesPerEvent );

    return milestonesForEvent;

  }

  /**
   * Sorts and updates events, saving to storage
   * and doing setState on the events.
   * 
   */
  updateCustomEvents = (newEvents) => {
    try {
      if (Array.isArray(newEvents)) {
        let newEventsSorted = newEvents.sort(eventSorter);
        this.saveCustomEvents(newEventsSorted);

        let newAllEvents = newEventsSorted.concat(this.state.standardEvents);
        newAllEvents = newAllEvents.sort(eventSorter);
        this.setState({ customEvents: newEventsSorted, allEvents: newAllEvents });

        logger.log('Custom Events updated!');
      } else {
        logger.log("Custom Events didn't look like array so not saved:", newEvents);
      }
    } catch (e) {
      logger.warn("Failed to save custom events.");
      logger.log("Error from failing to update custom events: ", e);
    }
  }

  /**
   * Add a newly created event and creats milestones for it.
   * Events should have unique titles. If there's already an event
   * with the same title, this will replace it.
   */
  addCustomEvent = (newEvent) => {
    try {
      // Make sure there's not an event by that title already
      var filtered = this.state.customEvents.filter(function (value, index, arr) {
        return (value.title !== newEvent.title);
      });
      filtered.push(newEvent);
      this.updateCustomEvents(filtered);

      this.replaceOrAddMilestonesForEvent(newEvent);


    } catch (err) {
      logger.warn("Error adding custom event", err);
    }
  }

  removeMilestonesForEvent = (event) => {
    if (event) {
      this.setState((prevState) => {
        let filtered = prevState.allMilestones.filter(function (value, index, arr) {
          return (value.event && value.event.title !== event.title);
        });
        // After filtering, they should still be sorted
        return { allMilestones: filtered };
      })
    }
  }

  replaceOrAddMilestonesForEvent = (event) => {
    if (event) {
      this.setState((prevState) => {
        // Remove old ones if there are any in there
        let filtered = prevState.allMilestones.filter(function (value, index, arr) {
          return (value.event && value.event.title !== event.title);
        });
        // Add new ones
        const newMilestones = this.getMilestonesForEvent(event);
        let milestones = filtered.concat(newMilestones);

        // Sort them after new ones added
        milestones = milestones.sort(milestoneSorter);
        return { allMilestones: milestones };
      })
    }
  }



  /**
   * Removes the specified event from storage and from the customEvents array,
   * based on its title.
   */
  removeCustomEvent = (eventToRemove) => {
    try {
      if (eventToRemove && eventToRemove.title) {
        var filtered = this.state.customEvents.filter(function (value, index, arr) {
          return (value.title !== eventToRemove.title);
        });
        if (filtered.length !== this.state.customEvents.length) {
          this.updateCustomEvents(filtered);
        } else {
          // we didn't find the array to remove
          logger.log("We didn't find a custom event to remove: ", eventToRemove.title);
        }
        this.removeMilestonesForEvent(eventToRemove);
      } else {
        logger.log("Custom Event to remove doesn't look right");
      }
    } catch (e) {
      logger.warn("Failed to remove custom event.");
      logger.log("Error from failing to add custom event: ", e);
    }
  }


  /**
   * Return a custom event that has a matching title.
   * Return null if there are none.
   */
  getCustomEventWithTitle = (title) => {
    var filtered = this.state.customEvents.filter(function (value, index, arr) {
      return (value.title === title);
    });
    if (filtered.length) {
      return filtered[0];
    } else {
      return null;
    }
  }

  /**
   * Remove all custom events.
   * 
   * jmr -if keep this, it needs to modify the milestones too
   * We could iterate through standard events and make new miletones for those only
   */
  removeAllCustomEvents = () => {
    try {
      this.updateCustomEvents([]);
    } catch (e) {
      logger.log('Failed to remove custom events.');
    }
  }

  getEventWithTitle = (title) => {
    for (let event of this.state.allEvents) {
      if (event.title === title) {
        // We found an event with a matching title
        return event;
      }
    }
    return null;
  }

  /**
   * Finds event according to oldEvent's title and replaces it
   * with the newEvent.
   * Updates state including milestones and updates async storage as needed.
   */
  modifyEvent = (oldEvent, newEvent) => {
    try {

      if (newEvent && newEvent.title && oldEvent && oldEvent.title) {
        let newArray = [];
        if (oldEvent.isCustom) {
          // Take out the old version
          newArray = this.state.customEvents.filter(function (value, index, arr) {
            return (value.title !== oldEvent.title);
          });
          if (newArray.length !== this.state.customEvents.length) {
            // Add in the new version of the event
            newArray.push(newEvent);
            // This will update state and async storage
            this.updateCustomEvents(newArray);

          } else {
            // we didn't find the array to remove
            logger.log("We didn't find a custom event to modify: ", oldEvent.title, newEvent.title);
          }
        } else {
          // Take out the old version
          newArray = this.state.standardEvents.filter(function (value, index, arr) {
            return (value.title !== oldEvent.title);
          });

          if (newArray.length !== this.state.standardEvents.length) {
            // Add in the new version of the event
            newArray.push(newEvent);

            newArray = newArray.sort(eventSorter);
            let allEvents = this.state.customEvents.concat(newArray);
            allEvents = allEvents.sort(eventSorter);

            // Update state
            this.setState({ allEvents, standardEvents: newArray });
            // Update async storage if needed
            this._updateAsyncStorageStandardEventsMapIfSelectionChange(oldEvent, newEvent);

          } else {
            // we didn't find the array to remove
            logger.log("We didn't find event to modify: ", oldEvent.title, newEvent.title);
          }
        }

        this.replaceOrAddMilestonesForEvent(newEvent);

      } else {
        logger.log("Event to modify doesn't look right");
      }
    } catch (e) {
      logger.warn("Failed to modify event.");
      logger.log("Error from failing to modify event: ", e);
    }
  }


  toggleEventSelected = (event) => {
    let newEvent = cloneEvent(event);
    newEvent.selected = !newEvent.selected;
    this.modifyEvent(event, newEvent);
  }

  _updateAsyncStorageStandardEventsMapIfSelectionChange = async (oldEvent, newEvent) => {
    if (newEvent && oldEvent && newEvent.selected !== oldEvent.selected) {
      try {
        if (newEvent && newEvent.key) {
          let selectedStandardKeysMap = await AsyncStorage.getItem(STORAGE_KEY_STANDARD_EVENTS_KEY_TO_SELECTED_MAP);
          selectedStandardKeysMap = JSON.parse(selectedStandardKeysMap);

          if (!selectedStandardKeysMap) {
            /* Since map is falsey (not even {}), this is probably first time using app. */
            selectedStandardKeysMap = {};
          }
          if (newEvent.selected) {
            logger.log("Event selected.");
            selectedStandardKeysMap[newEvent.key] = true;
            await this.saveSelectedStandardEventsMap(selectedStandardKeysMap);
          } else {
            /* Instead of deleting the key, we still want it in there and set to false
            so that if it's on by default we can know the user chose to turn it off. */
            logger.log("Event deselected.");
            selectedStandardKeysMap[newEvent.key] = false;
            await this.saveSelectedStandardEventsMap(selectedStandardKeysMap);
          }

        } else {
          logger.warn("Unexpected: Standard Event is malformed.");
          logger.log("Standard Event is malformed: ", newEvent);
        }
      } catch (err) {
        logger.warn("Failure while trying to save standard event selection data.");
        logger.log("Failure while trying to save standard event selection data. ", err);
      }
    } else {
      logger.log("newEvent doesn't need selected modified: ", oldEvent, newEvent);
    }
  }



  /**
   * Save the selected map for standard events.
   */
  saveSelectedStandardEventsMap = async (map) => {
    let mapToSave = map || {};
    await AsyncStorage.setItem(STORAGE_KEY_STANDARD_EVENTS_KEY_TO_SELECTED_MAP, JSON.stringify(mapToSave));
  }

  /**
   * Save the custom events array using AsyncStorage
   */
  saveCustomEvents = async (events) => {
    await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_EVENTS_ARRAY, JSON.stringify(events));
  }

  render() {
    /* Make allSelectedEvents, customEvents, standardEventsData arrays (via state) 
      and some of the functions available to consumers via the value attribute.
    */
    return (
      <EventsAndMilestonesContext.Provider value={{
        ...this.state,
        removeAllCustomEvents: this.removeAllCustomEvents,
        addCustomEvent: this.addCustomEvent,
        modifyEvent: this.modifyEvent,
        getEventWithTitle: this.getEventWithTitle,
        removeCustomEvent: this.removeCustomEvent,
        toggleEventSelected: this.toggleEventSelected,
        isEventSelected: isEventSelected,
        getCustomEventWithTitle: this.getCustomEventWithTitle,
      }}>
        {this.props.children}
      </EventsAndMilestonesContext.Provider>
    );
  }
}

export default EventsAndMilestonesContext;
