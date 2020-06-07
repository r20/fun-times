import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View, Platform } from 'react-native'
import { Header, ButtonGroup } from 'react-native-elements'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import StandardEvents from '../screens/StandardEvents'
import CustomEvents from '../screens/CustomEvents'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    color: theme.PRIMARY_TEXT_COLOR,
    fontSize: theme.FONT_SIZE_XLARGE
  },
});

const headerCenterComponent = <Text style={styles.header}>{i18n.t('headerEventsTitle')}</Text>


function EventsScreen(props) {

  const [selectedIndex, setSelectedIndex] = useState(0);

  // jmr barSyle may need to change based on theme


  const buttons = [i18n.t('custom'), i18n.t('standard')];
  return (

    <View style={styles.container}>
      <Header statusBarProps={{ barStyle: 'dark-content', translucent: true, backgroundColor: 'transparent' }}
        containerStyle={Platform.select({
          android: Platform.Version <= 20 ? { paddingTop: 0, height: 56 } : {},
        })}
        backgroundColor={theme.PRIMARY_BACKGROUND_COLOR}
        centerComponent={headerCenterComponent}
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


