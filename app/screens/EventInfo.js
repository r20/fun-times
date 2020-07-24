import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native'
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'

import EventSelectedStar from '../components/EventSelectedStar'
import EventComparedToNow from '../components/EventComparedToNow'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import { getDisplayStringDateTimeForEvent } from '../utils/Utils'
import i18n from '../i18n/i18n'
import MyCard, { MyCardHeader } from '../components/MyCard'
import * as logger from '../utils/logger'
import MyText, { MyTextLarge, MyTextXLarge } from '../components/MyText'
import MyThemeContext from '../context/MyThemeContext'

function EventInfo(props) {

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const myThemeContext = useContext(MyThemeContext);

  const route = useRoute();
  const navigation = useNavigation();

  /* The passed in event param can get stale.
    If something about the event changes (such as selected)
    we need to get the current event object (not what was passed
      when first navigated to this screen)
  */
  const passedEvent = route.params?.event ?? '';
  // Use the current version of the event object
  const event = eventsAndMilestonesContext.getEventWithTitle(passedEvent.title);
  if (!event) {
    return null;
  }

  const onPressEditItem = () => {
    navigation.navigate("EditEvent", { oldEvent: event });
  }

  const onRequestRemove = () => {

    Alert.alert(
      i18n.t('eventRemoveTitle'),
      i18n.t('eventRemoveConfirmation', { someValue: event.title }),
      [
        {
          text: i18n.t('cancel'),
          onPress: () => {
            logger.log('Cancel Pressed')
          },
          style: 'cancel',
        },
        {
          text: i18n.t('ok'), onPress: () => {
            logger.log('OK Pressed');
            eventsAndMilestonesContext.removeCustomEventAndMilestones(event);
            navigation.navigate("EventsScreen");

          }
        },
      ],
      // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
      { cancelable: true }
    );

  }
  /* We get event from route.  An attribute on the event may change, and
  we want to re-render */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return !event.isCustom ? (
          <EventSelectedStar event={event} containerStyle={styles.headerButton} />
        ) : (
            <View style={styles.headerRightComponent}>
              <TouchableOpacity onPress={onRequestRemove} style={styles.headerButton}>
                <FontAwesome name="trash-o" size={30} style={{ color: myThemeContext.colors.primary }} />
              </TouchableOpacity>
              <EventSelectedStar event={event} containerStyle={styles.headerButton} />
              <TouchableOpacity onPress={onPressEditItem} style={styles.headerButton}>
                <MaterialIcons name="edit" size={30} style={{ color: myThemeContext.colors.primary }} />
              </TouchableOpacity>
            </View>
          );
      },
    });
  }, [navigation, event, myThemeContext]);


  const now = new Date();
  const nowMillis = now.getTime();
  const i18nKeyNow = (nowMillis > event.epochMillis) ? "timeSinceEventTitle" : "timeUntilEventTitle";
  const cardHeaderTitleNow = i18n.t(i18nKeyNow, { someValue: getDisplayStringDateTimeForEvent(event) });

  const i18nKeyUpcoming = (nowMillis > event.epochMillis) ? "upcomingPastEventMilestoneTitle" : "upcomingFutureEventCountdownTitle";
  const cardHeaderTitleUpcoming = i18n.t(i18nKeyUpcoming, { someValue: getDisplayStringDateTimeForEvent(event) });


  const upcomingMilestoneListHeader = (
    <React.Fragment>
      <MyCard >
        <MyCardHeader >{cardHeaderTitleNow}</MyCardHeader>
        <EventComparedToNow event={event} />
      </MyCard>

      <MyTextLarge style={styles.upcomingHeader}>{cardHeaderTitleUpcoming}</MyTextLarge>
    </React.Fragment>
  );



  /* TBD - if event is within N days (see other code that sets that limit and get it from there),
    then should there be a message "Event within N days" ??
    Use i18n
    TBD - if title is really long, looks bad in EventInfo screen */
  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}><MyTextXLarge style={styles.title}>{event.title}</MyTextXLarge></View>
      <UpcomingMilestonesList listHeaderComponent={upcomingMilestoneListHeader}
        showHeaderIfListEmpty={true} events={[event]} />
    </View>
  );

}

export default EventInfo;

EventInfo.propTypes = {
  navigation: PropTypes.object.isRequired,
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleWrapper: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    paddingTop: 15, // If we make body and header same with no border, we'd change this
    paddingHorizontal: 10,
  },
  headerRightComponent: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerButton: {
    // padding is so touching close to it works too
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  upcomingHeader: {
    padding: 10,
    marginTop: 20,
  },
});
