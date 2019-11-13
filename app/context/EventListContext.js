import React, { createContext } from 'react'
import { AsyncStorage } from 'react-native'

const STORAGE_KEY_EVENTS = '@save_events';

/**
 * Returns a Date object for the event based on its epochMillis time.
 */
export function getDateFromEvent(event) {
  const { title, epochMillis } = event;
  return new Date(epochMillis);
}

// These are created with defaults.  The provider sets the real values using value prop.
const EventListContext = createContext({
  events: [],
  addEvent: async () => { },
  removeEvent: async () => { },
  updateEvents: async () => { },
  removeAllEvents: async () => { },
  getEventWithTitle: () => { return null; },
});

/**
 * Provides a way to see, remove, add events.
 * The events are stored using AsyncStorage.
 * The events are held in state.events array.
 */
export class EventListProvider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      events: []
    };
  }

  async componentDidMount() {
    let events = [];
    try {
      events = await AsyncStorage.getItem(STORAGE_KEY_EVENTS);
      events = JSON.parse(events);
      if (!events) {
        events = [];
      }
    } catch (e) {
      console.warn("Failed to load events.");
      console.log("Error from failing to load events: ", e);
    }
    this.setState({ events });
  }

  /**
   * Sorts and updates events, saving to storage
   * and doing setState on the events.
   */
  updateEvents = async (newEvents) => {
    try {
      if (Array.isArray(newEvents)) {
        let newEventsSorted = newEvents.sort((a, b) => {
          return b.epochMillis - a.epochMillis;
        });
        await this.saveEvents(newEventsSorted);
        this.setState({ events: newEventsSorted });
        console.log('Events updated!');
      } else {
        console.log("Events didn't look like array so not saved:", newEvents);
      }
    } catch (e) {
      console.warn("Failed to save events.");
      console.log("Error from failing to update events: ", e);
    }
  }

  /**
   * Add a newly created event to the array (and saves it as well).
   * Events should have unique titles. If there's already an event
   * with the same title, this will replace it.
   */
  addEvent = async (newEvent) => {
    try {
      // Make sure there's not an event by that title already
      var filtered = this.state.events.filter(function (value, index, arr) {
        return (value.title !== newEvent.title);
      });
      filtered.push(newEvent);
      await this.updateEvents(filtered);
    } catch (err) {
      console.warn("Error adding event", err);
    }
  }


  /**
   * Removes the specified event from storage and from the events array,
   * based on its title.
   */
  removeEvent = async (eventToRemove) => {
    try {
      if (eventToRemove && eventToRemove.title) {
        var filtered = this.state.events.filter(function (value, index, arr) {
          return (value.title !== eventToRemove.title);
        });
        if (filtered.length !== this.state.events.length) {
          await this.updateEvents(filtered);
        } else {
          // we didn't find the array to remove
          console.log("We didn't find an event to remove: ", eventToRemove.title);
        }
      } else {
        console.log("Event to remove doesn't look right");
      }
    } catch (e) {
      console.warn("Failed to remove event.");
      console.log("Error from failing to add event: ", e);
    }
  }


  /**
   * Return an event that has a matching title.
   * Return null if there are none.
   */
  getEventWithTitle = (title) => {
    var filtered = this.state.events.filter(function (value, index, arr) {
      return (value.title === title);
    });
    if (filtered.length) {
      return filtered[0];
    } else {
      return null;
    }
  }

  /**
   * Remove all events.
   */
  removeAllEvents = async () => {
    try {
      await this.updateEvents([]);
    } catch (e) {
      console.log('Failed to remove events.');
    }
  }

  /**
   * Save the events array using AsyncStorage
   */
  saveEvents = async (events) => {
    await AsyncStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }

  render() {
    /* Make events array (via state)
      and some of the functions available to consumers
      via the value attribute.
    */
    return (
      <EventListContext.Provider value={{
        ...this.state,
        updateEvents: this.updateEvents,
        removeAllEvents: this.removeAllEvents,
        addEvent: this.addEvent,
        removeEvent: this.removeEvent,
        getEventWithTitle: this.getEventWithTitle,
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
