import React, { createContext } from 'react'
import { AsyncStorage } from 'react-native'
import moment from 'moment-timezone'

import { standardEventsData } from '../utils/standardEventsData'
import { cloneEvent } from '../utils/Event'
import * as logger from '../utils/logger'

/* This is an array of custom events */
const STORAGE_KEY_CUSTOM_EVENTS_ARRAY = '@save_custom_events_array';
/* This is an object with standard event keys as keys and true/false as value 
  depending on whether selected */
const STORAGE_KEY_STANDARD_EVENTS_KEY_TO_SELECTED_MAP = '@save_standard_events_key_to_selected_map';

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

// These are created with defaults.  The provider sets the real values using value prop.
const EventListContext = createContext({
  allEvents: [],
  customEvents: [],
  standardEvents: [],
  addCustomEvent: async () => { },
  removeCustomEvent: async () => { },
  updateCustomEvents: async () => { },
  toggleEventSelected: () => { },
  removeAllCustomEvents: async () => { },
  isEventSelected: isEventSelected,
  getCustomEventWithTitle: () => { return null; },
});

/**
 * Provides a way to see events of interest, including a way to 
 * add and remove custom events.
 * Uses AsyncStorage to track things.
 */
export class EventListProvider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allEvents: [],
      customEvents: [],
      standardEventsSelectedMap: {},
      standardEvents: [],
    };
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
    let standardEvents = standardEventsData || [];
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
    customEvents = customEvents.sort((a, b) => {
      return b.epochMillis - a.epochMillis;
    });
    standardEvents = standardEvents.sort((a, b) => {
      return b.epochMillis - a.epochMillis;
    });
    let allEvents = customEvents.concat(standardEvents);
    allEvents = allEvents.sort((a, b) => {
      return b.epochMillis - a.epochMillis;
    });

    this.setState({ allEvents, customEvents, standardEvents });
  }


  /**
   * Sorts and updates events, saving to storage
   * and doing setState on the events.
   */
  updateCustomEvents = async (newEvents) => {
    try {
      if (Array.isArray(newEvents)) {
        let newEventsSorted = newEvents.sort((a, b) => {
          return b.epochMillis - a.epochMillis;
        });
        await this.saveCustomEvents(newEventsSorted);

        let newAllEvents = newEventsSorted.concat(this.state.standardEvents);
        newAllEvents = newAllEvents.sort((a, b) => {
          return b.epochMillis - a.epochMillis;
        });
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
   * Add a newly created event to the array (and saves it as well).
   * Events should have unique titles. If there's already an event
   * with the same title, this will replace it.
   */
  addCustomEvent = async (newEvent) => {
    try {
      // Make sure there's not an event by that title already
      var filtered = this.state.customEvents.filter(function (value, index, arr) {
        return (value.title !== newEvent.title);
      });
      filtered.push(newEvent);
      await this.updateCustomEvents(filtered);
    } catch (err) {
      logger.warn("Error adding custom event", err);
    }
  }


  /**
   * Removes the specified event from storage and from the customEvents array,
   * based on its title.
   */
  removeCustomEvent = async (eventToRemove) => {
    try {
      if (eventToRemove && eventToRemove.title) {
        var filtered = this.state.customEvents.filter(function (value, index, arr) {
          return (value.title !== eventToRemove.title);
        });
        if (filtered.length !== this.state.customEvents.length) {
          await this.updateCustomEvents(filtered);
        } else {
          // we didn't find the array to remove
          logger.log("We didn't find a custom event to remove: ", eventToRemove.title);
        }
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
   */
  removeAllCustomEvents = async () => {
    try {
      await this.updateCustomEvents([]);
    } catch (e) {
      logger.log('Failed to remove custom events.');
    }
  }


  /**
   * Finds event according to oldEvent's title and replaces it
   * with the newEvent.
   * Updates state and updates async storage as needed.
   */
  modifyEvent = (oldEvent, newEvent) => {
    try {
      if (newEvent && newEvent.title && oldEvent && oldEvent.title) {
        // Take out the old version
        let newArray = [];
        if (oldEvent.isCustom) {
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
          newArray = this.state.standardEvents.filter(function (value, index, arr) {
            return (value.title !== oldEvent.title);
          });

          if (newArray.length !== this.state.standardEvents.length) {
            // Add in the new version of the event
            newArray.push(newEvent);

            newArray = newArray.sort((a, b) => {
              return b.epochMillis - a.epochMillis;
            });
            let allEvents = this.state.customEvents.concat(newArray);
            allEvents = allEvents.sort((a, b) => {
              return b.epochMillis - a.epochMillis;
            });

            // Update state
            this.setState({ allEvents, standardEvents: newArray });
            // Update async storage if needed
            this._updateAsyncStorageStandardEventsMapIfSelectionChange(oldEvent, newEvent);

          } else {
            // we didn't find the array to remove
            logger.log("We didn't find event to modify: ", oldEvent.title, newEvent.title);
          }
        }

      } else {
        logger.log("Custom Event to modify doesn't look right");
      }
    } catch (e) {
      logger.warn("Failed to modify custom event.");
      logger.log("Error from failing to modify custom event: ", e);
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
            selectedStandardKeysMap[newEvent.key] = true;
            await this.saveSelectedStandardEventsMap(selectedStandardKeysMap);
          } else {
            if (selectedStandardKeysMap[newEvent.key]) {
              /* Instead of deleting the key, we still want it in there and set to false
              so that if it's on by default we can know the user chose to turn it off. */
              selectedStandardKeysMap[newEvent.key] = false;
              await this.saveSelectedStandardEventsMap(selectedStandardKeysMap);
            } else {
              logger.log("Event was already deselected.");
            }
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
      <EventListContext.Provider value={{
        ...this.state,
        removeAllCustomEvents: this.removeAllCustomEvents,
        addCustomEvent: this.addCustomEvent,
        removeCustomEvent: this.removeCustomEvent,
        toggleEventSelected: this.toggleEventSelected,
        isEventSelected: isEventSelected,
        getCustomEventWithTitle: this.getCustomEventWithTitle,
      }}>
        {this.props.children}
      </EventListContext.Provider>
    );
  }
}

/** 
 * A HOC to add eventListContext as a prop
 */
export const withEventListContext = ChildComponent => props => (
  <EventListContext.Consumer>
    {
      context => <ChildComponent {...props} eventListContext={context} />
    }
  </EventListContext.Consumer>
);
