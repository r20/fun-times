import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FlatList, StyleSheet, View } from 'react-native'

import { withEventListContext } from '../context/EventListContext'

import EventListItem from './EventListItem'

class EventList extends Component {

  selectEvent = (event) => {
    // Passed param will be accessible via props.navigation.getParam()
    this.props.navigation.navigate("SelectedEvent", { event: event });
  }

  render() {

    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{ padding: 15 }}
          data={this.props.eventListContext.events}
          keyExtractor={item => item.title}
          renderItem={({ item }) =>
            <EventListItem event={item} onPressSelectEvent={() => { this.selectEvent(item) }} />
          }
        />
      </View>
    );
  }
}

export default withEventListContext(EventList);

EventList.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});