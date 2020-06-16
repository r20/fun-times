import React from 'react'
import { StyleSheet, View } from 'react-native'

import Settings from '../components/settings/Settings'
import i18n from '../i18n/i18n'
import MyScreenHeader from '../components/MyScreenHeader'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});


function More(props) {
  return (<View style={styles.container} >
      <MyScreenHeader title={i18n.t('headerMoreTitle')} />
    <Settings />
  </View>
  );
}

export default More;

