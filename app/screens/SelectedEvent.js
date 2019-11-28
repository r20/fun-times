import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { moment } from 'moment'

import EventComparedToNow from '../components/EventComparedToNow'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import { getDateFromEvent, withEventListContext } from '../context/EventListContext'
import * as Utils from '../utils/Utils'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader } from '../components/EventCard'

function SelectedEvent(props) {

  const event = props.navigation.getParam("event", '');
  if (!event) {
    return null;
  }

  const onPressRemoveItem = () => {

    Alert.alert(
      'Remove Event ',
      "Do you want to remove event " + event.title + "?",
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK', onPress: () => {
            console.log('OK Pressed');
            props.eventListContext.removeEvent(event);
            // Go back to Events screen when push save
            props.navigation.navigate("Events");
          }
        },
      ],
      // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
      { cancelable: true }
    );

  }

  const date = getDateFromEvent(event);

  const now = new Date();
  const nowMillis = now.getTime();
  const i18nKey = (nowMillis > date.getTime()) ? "timeSinceEventTitle" : "timeUntilEventTitle";
  const cardHeaderTitle = i18n.t(i18nKey, { someValue: Utils.getDisplayStringForDate(date) });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <View style={{ alignSelf: 'flex-end', paddingBottom: 10, }}>
          <TouchableOpacity onPress={onPressRemoveItem} style={styles.deleteButton}>
            <FontAwesome name="trash" size={30} style={{ color: theme.TRASH_ICON_COLOR }} />
          </TouchableOpacity>
        </View>
        <EventCard event={event}>
          <EventCardHeader event={event}>{cardHeaderTitle}</EventCardHeader>
          <EventComparedToNow event={event} nowMillis={nowMillis} />
        </EventCard>

        <EventCard event={event}>
          <EventCardHeader event={event}>Upcoming Milestones</EventCardHeader>
          <UpcomingMilestonesList events={[event]} renderEventCardBodyTextOnly={true} />
        </EventCard>
      </ScrollView>
    </View>
  );

}

export default withEventListContext(SelectedEvent);

SelectedEvent.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteButton: {
    // padding is so touching close to it works too
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.TRASH_BACKGROUND_COLOR,
    borderRadius: 5,
  },
});