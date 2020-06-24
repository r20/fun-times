import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, ScrollView, Switch, Alert } from 'react-native'

import CalendarContext from '../../context/CalendarContext'
import * as Utils from '../../utils/Utils'
import * as logger from '../../utils/logger'
import i18n from '../../i18n/i18n'
import MyPrimaryButton from '../../components/MyPrimaryButton'

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

  /*  
      TBD - Should add these:
      Alert settings for new calendar entries
      All day (9am day of)
      non all day ( 2 hours before, unless it's in middle of night)

      // 9am on the day of event if all day, else 2 hours before
      const offsetMinutes = allDay ? 9 * 60 : -120;

      */

  return (
    <React.Fragment>
      <View style={styles.container}>
        <MyPrimaryButton onPress={onRequestRemoveCalendar} title={i18n.t("removeCalendarEntriesButton")} />
      </View>
    </React.Fragment>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 0,
    marginTop: 30, // Until more calendar settings added, add some space so the remove button isn't so close
  },
});

export default CalendarSettings;


