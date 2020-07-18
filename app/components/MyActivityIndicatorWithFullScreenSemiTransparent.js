import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, ActivityIndicator, Modal } from 'react-native'
import MyThemeContext from '../context/MyThemeContext'
import * as logger from '../utils/logger'




const MyActivityIndicatorWithFullScreenSemiTransparent = (props) => {
    
    const myThemeContext = useContext(MyThemeContext);

    const top = (props.top !== undefined) ? props.top : 95;

    const styles = StyleSheet.create({
        activityIndicator: {
            position: 'absolute',
            top: top,
            left: 0,
            right: 0,
            opacity: 1,
        },
        semiTransparentStyle: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            opacity: 0.7,
            backgroundColor: myThemeContext.colors.background,
        }
    });


    return (<Modal
        animationType="fade"
        transparent={true}
        visible={true}>
        <View style={styles.semiTransparentStyle} ></View>
        <ActivityIndicator style={styles.activityIndicator} size="large" animating={true} />
    </Modal>);
}


MyActivityIndicatorWithFullScreenSemiTransparent.propTypes = {
    top: PropTypes.number, // Amount of space from top of screen to show spinner.  Default is 95
};

export default MyActivityIndicatorWithFullScreenSemiTransparent;