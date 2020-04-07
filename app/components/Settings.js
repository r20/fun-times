import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, Text, View, ScrollView, Switch,
  TouchableWithoutFeedback, Keyboard, Alert, Platform
} from 'react-native'

import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import theme, { getContrastFontColor, colors, getRandomColor } from '../style/theme'

import EventListContext from '../context/EventListContext'
import * as Utils from '../utils/Utils'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'

function Settings(props) {


  /*
  Here's a list of things that could be done to improve app

  sharing dates (to send text, add to calendar, etc.)
  Limit types and number of milestones shown. Globally.
   Do they want to see seconds, minutes, hours, etc. binary, countdown, etc. ?
   Maybe show next N (e.g. 3) upcoming milestones for each event?? 
   And they could change N in settings.
  Headers for milestones list (by date, like Month YYYY)star (explain) what it's for.
  Sort by favorites?If Today things aren't clickable make them different
  color picker colors?
  Event groups, with color? (birthdays, holidays)
  */

  const eventListContext = useContext(EventListContext);

  const [myBool, setMyBool] = useState(false);

  const onSetMyBool = (isYes) => {
    setMyBool(isYes);

  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <React.Fragment>

        <ScrollView contentContainerStyle={styles.container}>
          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("fullDay")}</Text>
            <Switch
              value={myBool}
              onValueChange={isYes => {
                onSetMyBool(isYes);
              }}
            />
          </View>
        </ScrollView>
      </React.Fragment>
    </TouchableWithoutFeedback>
  );
}

export default Settings;

Settings.propTypes = {

}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    paddingRight: 45,
    paddingLeft: 45, // jmr - same as AddOrEditEvent. SHould put in common place?
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: 'yellow',
  },
  switchSelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'green',
  },
});

