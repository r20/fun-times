import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'
import { ButtonGroup } from 'react-native-elements'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import StandardEvents from '../screens/StandardEvents'
import CustomEvents from '../screens/CustomEvents'
import { withSingleScreenInStackNavigator } from '../navigation/NavUtils'


function EventsScreen(props) {

  const [selectedIndex, setSelectedIndex] = useState(0);

  const buttons = [i18n.t('custom'), i18n.t('standard')];
  return (
    <View style={styles.container}>

      <ButtonGroup
        onPress={setSelectedIndex}
        selectedIndex={selectedIndex}
        buttons={buttons}
      />
      {selectedIndex ?
        <StandardEvents /> :
        <CustomEvents />
      }
    </View>
  );
}

export default withSingleScreenInStackNavigator(EventsScreen, i18n.t("headerEventsTitle"));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
});
