import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Settings from '../components/Settings'

function More(props) {
  return (<View style={styles.container} >
    <Settings />
  </View>
  );
}

export default More;


const styles = StyleSheet.create({
  container: {
  },
});
