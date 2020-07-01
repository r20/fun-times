import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { View } from 'react-native'

import MyDivider from '../components/MyDivider'
import MyThemeContext from '../context/MyThemeContext';

const wrapperStyle = {
    position: 'relative',
};

/* A divider to go between past and future events */
export default function (props) {

    const myThemeContext = useContext(MyThemeContext);

    const lineStyle = {
        position: 'absolute',
        height: 1,
        left: 0,
        right: 0,
        backgroundColor: myThemeContext.colors.text,
    };
    const dotStyle = {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4, // half of height and width
        top: -4,
        left: -7,
        backgroundColor: myThemeContext.colors.text,
    };

    return (<View style={wrapperStyle} >
        <View style={dotStyle} ></View>
        <MyDivider style={lineStyle} />
    </View>);
}