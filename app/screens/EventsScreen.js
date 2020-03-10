import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'
import { ButtonGroup } from 'react-native-elements'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import StandardEvents from '../screens/StandardEvents'
import ScreenHeader, { ScreenHeaderTitle } from '../components/ScreenHeader'
import CustomEvents from '../screens/CustomEvents'

function EventsScreen(props) {

  const [selectedIndex, setSelectedIndex] = useState(0);

  const buttons = [i18n.t('custom'), i18n.t('standard')];
  return (

    <View style={styles.container}>
      <ScreenHeader
        centerComponent={<ScreenHeaderTitle>{i18n.t("headerEventsTitle")}</ScreenHeaderTitle>}
      />
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

export default EventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
});
