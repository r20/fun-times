import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import Constants from 'expo-constants';
import {
  StyleSheet, Text, View, ScrollView, Switch,
  TouchableWithoutFeedback, Keyboard, Alert, Platform, Button
} from 'react-native'
import { Slider } from 'react-native-elements'
import { useScrollToTop } from '@react-navigation/native'
import Accordion from 'react-native-collapsible/Accordion'
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import styles from './settingsStyles'
import theme, { getContrastFontColor, colors, getRandomColor } from '../../style/theme'

import MilestonTypesSettings from './MilestoneTypesSettings'
import CalendarSettings from './CalendarSettings'

import * as logger from '../../utils/logger'
import Divider from '../../components/Divider'
import i18n from '../../i18n/i18n'


function Settings(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  /*
  jmr:  Here's a list of things that could be done to improve app

  sharing dates (to send text, add to calendar, etc.)

  Headers for milestones list (by date, like Month YYYY)
  star (explain) what it's for.
  Sort by favorites? If Today things aren't clickable make them different

  Event groups, with color? (birthdays, holidays)
  */

  [activeSections, setActiveSections] = useState([]);

  const SECTIONS = [
    {
      title: (<Text style={styles.settingsSectionHeaderText}>{i18n.t("settingsMilestoneNumberTypes")}</Text>),
      content: <MilestonTypesSettings />,
    },
    {
      title: <Text style={styles.settingsSectionHeaderText}>{i18n.t("settingsCalendar")}</Text>,
      content: <CalendarSettings />,
    },
  ];


  const _renderSectionTile = section => {
    // Put a divider above each section
    return <Divider style={styles.divider} />
  }

  const _renderHeader = section => {
    return section.title || null;
  };

  const _renderContent = section => {
    return section.content || null;
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <React.Fragment>

        <ScrollView ref={ref} contentContainerStyle={styles.container}>
          <Accordion
            expandMultiple={true}
            underlayColor={theme.PRIMARY_BACKGROUND_COLOR}
            sections={SECTIONS}
            activeSections={activeSections}
            renderSectionTitle={_renderSectionTile}
            renderHeader={_renderHeader}
            renderContent={_renderContent}
            onChange={setActiveSections}
          />

          <Divider style={styles.divider} />
          <Text style={styles.settingsSectionHeaderText}>{i18n.t("settingsAbout")}</Text>
          <Text style={styles.settingsText}>{i18n.t("settingsVersion", { someValue: Constants.manifest.version })}</Text>
        </ScrollView>
      </React.Fragment>
    </TouchableWithoutFeedback>
  );
}

export default Settings;

