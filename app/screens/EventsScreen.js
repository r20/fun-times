import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, FlatList, View, Platform } from 'react-native'
import { ButtonGroup } from 'react-native-elements'

import i18n from '../i18n/i18n'
import StandardEvents from '../screens/StandardEvents'
import CustomEvents from '../screens/CustomEvents'
import MyText from '../components/MyText'
import MyThemeContext from '../context/MyThemeContext'
import MyScreenHeader from '../components/MyScreenHeader'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
});

function EventsScreen(props) {

  const myThemeContext = useContext(MyThemeContext);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const buttons = [i18n.t('custom'), i18n.t('standard')];
  return (

    <View style={styles.container}>

      <MyScreenHeader title={i18n.t('headerEventsTitle')} />
      <ButtonGroup
        onPress={setSelectedIndex}
        selectedIndex={selectedIndex}
        buttons={buttons}
        innerBorderStyle={{ width: 0 }}
        containerStyle={{ borderWidth: 0 }}
        selectedTextStyle={{
          color: myThemeContext.colors.primaryContrast,
          backgroundColor: myThemeContext.colors.primary,
        }}
        textStyle={{
          color: myThemeContext.colors.text,
          backgroundColor: myThemeContext.colors.background,
        }}
        buttonStyle={{
          backgroundColor: myThemeContext.colors.background,
        }}
        selectedButtonStyle={{
          backgroundColor: myThemeContext.colors.primary,
        }}
      />
      {selectedIndex ?
        <StandardEvents /> :
        <CustomEvents />
      }
    </View>
  );
}

export default EventsScreen;


