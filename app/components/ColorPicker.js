import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { FlatGrid } from 'react-native-super-grid'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import {getContrastFontColor} from '../style/theme'


/**
 * Offers a grid of the colors for selection.
 * This wouldn't really work if white or close to white was among colors to select.
 * Could add a border for that case if wanted to support it.
 */
function ColorPicker(props) {

    const [selectedColor, setSelectedColor] = useState(props.selectedColor);

    const renderItem = ({ item }) => {
        const fontColor = getContrastFontColor(item);
        return (
            <TouchableOpacity
                style={[styles.circle, { backgroundColor: item }]}
                onPress={() => {
                    setSelectedColor(item);
                    props.onSelect(item);
                }}>
                {selectedColor === item &&
                    <MaterialCommunityIcons name="check" style={{ color: fontColor, fontSize: 24 }} />}
            </TouchableOpacity>
        )
    };

    return (
        <FlatGrid
            itemDimension={70}
            items={props.colors}
            renderItem={renderItem}
        />
    );

}

ColorPicker.propTypes = {
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedColor: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default ColorPicker;


const styles = StyleSheet.create({
    circle: {
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
