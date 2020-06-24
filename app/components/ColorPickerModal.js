import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Modal, Dimensions } from 'react-native'

import ColorPicker from './ColorPicker'
import * as Utils from '../utils/Utils'
import MyThemeContext from '../context/MyThemeContext'

export default function ColorPickerModal(props) {

    const myThemeContext = useContext(MyThemeContext);

    const screenWidth = Dimensions.get('window').width;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#0004',
            alignItems: 'center',
            justifyContent: 'center',
        },
        card: {
            width: screenWidth - 40,
            backgroundColor: myThemeContext.colors.background, // TBD - is this even needed?
        },
    });

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <ColorPicker
                        colors={props.colors}
                        selectedColor={props.selectedColor}
                        onSelect={props.onSelect}
                    />
                </View>
            </View>
        </Modal>
    );
}

ColorPickerModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedColor: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};


