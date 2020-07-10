import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import Constants from 'expo-constants';
import {
  StyleSheet, View, ScrollView, TouchableWithoutFeedback, Keyboard, Alert, Platform, TouchableHighlight
} from 'react-native'

import { useScrollToTop } from '@react-navigation/native'
import Accordion from 'react-native-collapsible/Accordion'
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import GeneralSettings from './GeneralSettings'
import MilestonTypesSettings from './MilestoneTypesSettings'
import CalendarSettings from './CalendarSettings'

import * as logger from '../../utils/logger'
import MyDivider from '../../components/MyDivider'
import i18n from '../../i18n/i18n'
import MyText, { MyTextLarge } from '../MyText'
import MyThemeContext from '../../context/MyThemeContext';

function Settings(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const myThemeContext = useContext(MyThemeContext);

  const [activeSections, setActiveSections] = useState([]);


  const styles = StyleSheet.create({
    container: {
      flex: 0,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingHorizontal: 20,
    },
    settingsSectionHeaderText: {
      color: myThemeContext.colors.primary,
      paddingVertical: 10,
    },
    divider: {
      marginVertical: 10,
      height: 1,
    },
  });

  const SECTIONS = [
    {
      title: (<MyTextLarge style={styles.settingsSectionHeaderText}>{i18n.t("settingsMilestoneNumberTypes")}</MyTextLarge>),
      content: <MilestonTypesSettings />,
    },
    {
      title: <MyTextLarge style={styles.settingsSectionHeaderText}>{i18n.t("settingsCalendar")}</MyTextLarge>,
      content: <CalendarSettings />,
    },
  ];


  const _renderSectionTile = section => {
    // Put a divider above each section
    return <MyDivider style={styles.divider} />
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
          <GeneralSettings />
          <Accordion
            expandMultiple={true}
            touchableComponent={(props) => <TouchableHighlight {...props} />}
            underlayColor={myThemeContext.colors.background}
            sections={SECTIONS}
            activeSections={activeSections}
            renderSectionTitle={_renderSectionTile}
            renderHeader={_renderHeader}
            renderContent={_renderContent}
            onChange={setActiveSections}
          />

          <MyDivider style={styles.divider} />
          <MyTextLarge style={styles.settingsSectionHeaderText}>{i18n.t("settingsAbout")}</MyTextLarge>
          <MyText >{i18n.t("settingsVersion", { someValue: Constants.manifest.version })}</MyText>
        </ScrollView>
      </React.Fragment>
    </TouchableWithoutFeedback>
  );
}

export default Settings;
