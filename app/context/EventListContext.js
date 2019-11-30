import React, { createContext } from 'react'
import { AsyncStorage } from 'react-native'
import moment from 'moment-timezone'

import { standardEvents } from '../utils/standardEvents'

/* This is an array of custom events */
const STORAGE_KEY_CUSTOM_EVENTS_ARRAY = '@save_custom_events_array';
/* This is an object with standard event keys as keys and true as value if it's selected */
const STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT = '@save_selected_standard_event_keys_object';

/**
 * Returns a Date object for the event based on its epochMillis time.
 */
export function getDateFromEvent(event) {
  const { title, epochMillis } = event;
  return new Date(epochMillis);
}

/**
 * Returns a momentjs object for the event based on its epochMillis time.
 */
export function getMomentFromEvent(event) {
  const { title, epochMillis } = event;
  return moment(epochMillis);
}

// These are created with defaults.  The provider sets the real values using value prop.
const EventListContext = createContext({
  allEvents: [],
  customEvents: [],
  selectedStandardEvents: [],
  addCustomEvent: async () => { },
  removeCustomEvent: async () => { },
  updateCustomEvents: async () => { },
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
      allEvents: [],
      customEvents: [],
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
      console.warn("Failed to load customEvents.");
      console.log("Error from failing to load customEvents: ", e);
    }
    let selectedStandardEvents = [];
    try {
      let selectedStandardKeysMap = await AsyncStorage.getItem(STORAGE_KEY_SELECTED_STANDARD_EVENT_KEYS_OBJECT);
      selectedStandardKeysMap = JSON.parse(selectedStandardKeysMap);
      if (!selectedStandardKeysMap) {
        /* Since map is falsey (not even {}), this is probably first time using app.
           Get the standard events that should be selected by default and select them */
        selectedStandardEvents = [];

        for (let idx = 0; idx < standardEvents.length; idx++) {
          const std = standardEvents[idx];
          if (std.isSelectedByDefault) {
            selectedStandardEvents.push(std);
          }
        }
        // Save them
        this.saveSelectedStandardEventKeys(selectedStandardEvents);

      } else {
        for (let idx = 0; idx < standardEvents.length; idx++) {
          const std = standardEvents[idx];
          if (selectedStandardKeysMap[std.key]) {
            selectedStandardEvents.push(std);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load selectedStandardEvents.");
      console.log("Error from failing to load selectedStandardEvents: ", e);
    }
    let allEvents = customEvents.concat(selectedStandardEvents); // change to those selected
    allEvents = allEvents.sort((a, b) => {
      return b.epochMillis - a.epochMillis;
    });

    this.setState({ customEvents, allEvents, selectedStandardEvents });
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

        console.log('Custom Events updated!');
      } else {
        console.log("Custom Events didn't look like array so not saved:", newEvents);
      }
    } catch (e) {
      console.warn("Failed to save custom events.");
      console.log("Error from failing to update custom events: ", e);
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
      console.warn("Error adding custom event", err);
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
          console.log("We didn't find a custom event to remove: ", eventToRemove.title);
        }
      } else {
        console.log("Custom Event to remove doesn't look right");
      }
    } catch (e) {
      console.warn("Failed to remove custom event.");
      console.log("Error from failing to add custom event: ", e);
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
      console.log('Failed to remove custom events.');
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
    /* Make allEvents, customEvents, selectedStandardEvents arrays (via state)
      and some of the functions available to consumers
      via the value attribute.
    */
    return (
      <EventListContext.Provider value={{
        ...this.state,
        updateCustomEvents: this.updateCustomEvents,
        removeAllCustomEvents: this.removeAllCustomEvents,
        addCustomEvent: this.addCustomEvent,
        removeCustomEvent: this.removeCustomEvent,
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
