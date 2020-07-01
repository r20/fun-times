import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Switch, Alert } from 'react-native'

import CalendarContext, { calendarNotificationDaytime, calendarNotificationNighttimeHoursPm, calendarNotificationAllDayHoursAm } from '../../context/CalendarContext'
import * as Utils from '../../utils/Utils'
import * as logger from '../../utils/logger'
import i18n from '../../i18n/i18n'
import MyPrimaryButton from '../../components/MyPrimaryButton'
import MyText from '../MyText'

function CalendarSettings(props) {

  const calendarContext = useContext(CalendarContext);

  const onRequestRemoveCalendar = () => {

    Alert.alert(
      i18n.t('calendarRemoveTitle'),
      i18n.t('calendarRemoveConfirmation'),
      [
        {
          text: i18n.t('cancel'),
          onPress: () => {
            logger.log('Cancel Pressed');
          },
          style: 'cancel',
        },
        {
          text: i18n.t('ok'), onPress: () => {
            logger.log('OK Pressed');
            calendarContext.removeFunTimesCalendarEventsAsync();
          }
        },
      ],
      // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
      { cancelable: true }
    );
  }

  /* TBD - I should have a button for removing all old calendar entries */

  return (
    <React.Fragment>
      <View style={styles.container}>
        <MyText>{i18n.t('calendarNotificationDaytime', { someValue: calendarNotificationDaytime })}</MyText>
        <MyText style={styles.space}>{i18n.t('calendarNotificationNighttime', { someValue: calendarNotificationNighttimeHoursPm })}</MyText>
        <MyText style={styles.space}>{i18n.t('calendarNotificationAllDay', { someValue: calendarNotificationAllDayHoursAm })}</MyText>
        <MyPrimaryButton containerStyle={styles.moreSpace} onPress={onRequestRemoveCalendar} title={i18n.t("removeCalendarEntriesButton")} />
      </View>
    </React.Fragment>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 0,
  },
  space: {
    marginTop: 10,
  },
  moreSpace: {
    marginTop: 20,
  },

});

export default CalendarSettings;


