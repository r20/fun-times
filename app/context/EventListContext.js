import React, { createContext } from 'react'
import { AsyncStorage } from 'react-native'
import moment from 'moment-timezone'

import { standardEvents } from '../utils/standardEvents'
import { cloneEvent } from '../utils/Event'
import * as logger from '../utils/logger'

/* This is an array of custom events */
const STORAGE_KEY_CUSTOM_EVENTS_ARRAY = '@save_custom_events_array';
/* This is an object with standard event keys as keys and true as value if it's selected */
const STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT = '@save_selected_standard_event_keys_object';

/**
 * Returns a momentjs object for the event based on its epochMillis time.
 */
export function getMomentFromEvent(event) {
  const { title, epochMillis } = event;
  return moment(epochMillis);
}

// These are created with defaults.  The provider sets the real values using value prop.
const EventListContext = createContext({
  allSelectedEvents: [],
  customEvents: [],
  selectedStandardEvents: [],
  addCustomEvent: async () => { },
  removeCustomEvent: async () => { },
  updateCustomEvents: async () => { },
  selectCustomEvent: async () => { },
  deselectCustomEvent: async () => { },
  selectStandardEvent: async () => { },
  deselectStandardEvent: async () => { },
  removeAllCustomEvents: async () => { },
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
      allSelectedEvents: [],
      customEvents: [],
      selectedCustomEvents: [],
      standardEvents: standardEvents,
      selectedStandardEvents: [],
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
    let selectedStandardEvents = [];
    try {
      let selectedStandardKeysMap = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT);
      selectedStandardKeysMap = JSON.parse(selectedStandardKeysMap);

      if (!selectedStandardKeysMap) {
        /* Since map is falsey (not even {}), this is probably first time using app. */
        selectedStandardKeysMap = {};
      }

      let aStandardEventWasSelectedByDefault = false;
      for (let idx = 0; idx < standardEvents.length; idx++) {
        const std = standardEvents[idx];
        if (selectedStandardKeysMap[std.key] === true) {
          selectedStandardEvents.push(std);
        } else if (selectedStandardKeysMap[std.key] === undefined && std.isSelectedByDefault) {
          /* If selectedStandardKeysMap[std.key] is false, they've chosen to NOT have this
              standard event selected anymore. Leave it that way. */
          selectedStandardEvents.push(std);
          aStandardEventWasSelectedByDefault = true;
        }
      }
      if (aStandardEventWasSelectedByDefault) {
        // Save them
        this.saveSelectedStandardEventKeys(selectedStandardEvents);
      }

    } catch (e) {
      logger.warn("Failed to load selectedStandardEvents.");
      logger.log("Error from failing to load selectedStandardEvents: ", e);
    }

    let selectedCustomEvents = [];
    for (let idx = 0; idx < customEvents.length; idx++) {
      const custom = customEvents[idx];
      if (custom.selected) {
        selectedCustomEvents.push(custom);
      }
    }

    let allSelectedEvents = selectedCustomEvents.concat(selectedStandardEvents); // change to those selected
    allSelectedEvents = allSelectedEvents.sort((a, b) => {
      return b.epochMillis - a.epochMillis;
    });

    this.setState({ allSelectedEvents, customEvents, selectedCustomEvents, standardEvents, selectedStandardEvents });
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
        let newAllEvents = newEventsSorted.concat(this.state.selectedStandardEvents);
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
   * Finds event accoring to oldEvent's title and replaces it
   * with the newEvent.
   */
  modifyCustomEvent = async (oldEvent, newEvent) => {
    try {
      if (newEvent && newEvent.title && oldEvent && oldEvent.title) {
        // Take out the old version
        let filtered = this.state.customEvents.filter(function (value, index, arr) {
          return (value.title !== oldEvent.title);
        });

        if (filtered.length !== this.state.customEvents.length) {
          // Add in the new version of the event
          filtered.push(newEvent);
          await this.updateCustomEvents(filtered);

        } else {
          // we didn't find the array to remove
          logger.log("We didn't find a custom event to modify: ", oldEvent.title, newEvent.title);
        }
      } else {
        logger.log("Custom Event to modify doesn't look right");
      }
    } catch (e) {
      logger.warn("Failed to modify custom event.");
      logger.log("Error from failing to modify custom event: ", e);
    }
  }

  /**
   * Marks event with selected = true
   */
  selectCustomEvent = async (event) => {
    let newEvent = cloneEvent(event);
    newEvent.selected = true;
    await this.modifyCustomEvent(event, newEvent);
  }

  /**
   * Marks event with selected = false
   */
  deselectCustomEvent = async (event) => {
    let newEvent = cloneEvent(event);
    newEvent.selected = false;
    await this.modifyCustomEvent(event, newEvent);
  }

  selectStandardEvent = async (event) => {
    try {
      if (event && event.key) {
        let selectedStandardKeysMap = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT);
        selectedStandardKeysMap = JSON.parse(selectedStandardKeysMap);

        if (!selectedStandardKeysMap) {
          /* Since map is falsey (not even {}), this is probably first time using app. */
          selectedStandardKeysMap = {};
        }
        selectedStandardKeysMap[event.key] = true;
        await AsyncStorage.setItem(STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT, JSON.stringify(selectedStandardKeysMap));

      } else {
        logger.warn("Event to select is malformed.");
        logger.log("Event to select is malformed: ", event);
      }
    } catch (err) {
      logger.warn("Failed to select event.");
      logger.log("Error from failing to select standard event: ", err);
    }
  }


  deselectStandardEvent = async (event) => {
    try {
      if (event && event.key) {
        let selectedStandardKeysMap = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT);
        selectedStandardKeysMap = JSON.parse(selectedStandardKeysMap);

        if (selectedStandardKeysMap && selectedStandardKeysMap[event.key]) {
          delete selectedStandardKeysMap[event.key];
          await AsyncStorage.setItem(STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT, JSON.stringify(selectedStandardKeysMap));
        } else {
          logger.log("Event was already deselected.");
        }
      } else {
        logger.warn("Event to dedeselect is malformed.");
        logger.log("Event to select is malformed: ", event);
      }
    } catch (err) {
      logger.warn("Failed to deselect event.");
      logger.log("Error from failing to deselect standard event: ", err);
    }
  }

  /**
   * Save the keys of selected standard events.
   */
  saveSelectedStandardEventKeys = async (selectedStandardEventsArray) => {
    let map = {};
    for (let idx = 0; idx < selectedStandardEventsArray.length; idx++) {
      map[selectedStandardEventsArray[idx].key] = true;
    }
    await AsyncStorage.setItem(STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT, JSON.stringify(map));
  }

  /**
   * Save the custom events array using AsyncStorage
   */
  saveCustomEvents = async (events) => {
    await AsyncStorage.setItem(STORAGE_KEY_CUSTOM_EVENTS_ARRAY, JSON.stringify(events));
  }

  render() {
    /* Make allSelectedEvents, customEvents, selectedCustomEvents, standardEvents,
      selectedStandardEvents arrays (via state) and some of the functions available to consumers
      via the value attribute.
    */
    return (
      <EventListContext.Provider value={{
        ...this.state,
        removeAllCustomEvents: this.removeAllCustomEvents,
        addCustomEvent: this.addCustomEvent,
        removeCustomEvent: this.removeCustomEvent,
        selectCustomEvent: this.selectCustomEvent,
        deselectCustomEvent: this.deselectCustomEvent,
        selectStandardEvent: this.selectStandardEvent,
        deselectStandardEvent: this.deselectStandardEvent,
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
