import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Text } from 'react-native'
import MyThemeContext from '../context/MyThemeContext'
import * as logger from '../utils/logger'


function addPropsStyle(defaultStyle, style) {
    if (style && Array.isArray(style)) {
        if (style[0]) {
            // Checking because some times [null] or [undefined] is passed in as style
            return Object.assign({}, defaultStyle, ...style);
        } else {
            return defaultStyle;
        }
    } else {
        return Object.assign({}, defaultStyle, style);
    }
}


/* This was created in case need to style all dividers
(such as based on dark/light theme).  We can just do styling here. */
const MyText = (props) => {
    const myThemeContext = useContext(MyThemeContext);
    const { style, ...otherProps } = props;
    let textStyle = addPropsStyle({
        color: myThemeContext.colors.text,
        fontSize: myThemeContext.FONT_SIZE_MEDIUM,
    }, style);
    return (<Text style={textStyle} {...otherProps} >{props.children}</Text>);
}
export default MyText;


export const MyTextLarge = (props) => {
    const myThemeContext = useContext(MyThemeContext);
    const { style, ...otherProps } = props;
    let textStyle = addPropsStyle({
        color: myThemeContext.colors.text,
        fontSize: myThemeContext.FONT_SIZE_LARGE,
    }, style);

    return (<Text style={textStyle} {...otherProps}>{props.children}</Text>);
}


export const MyTextSmall = (props) => {
    const myThemeContext = useContext(MyThemeContext);
    const { style, ...otherProps } = props;
    let textStyle = addPropsStyle({
        color: myThemeContext.colors.text,
        fontSize: myThemeContext.FONT_SIZE_SMALL,
    }, style);

    return (<Text style={textStyle} {...otherProps}>{props.children}</Text>);
}


export const MyTextXLarge = (props) => {
    const myThemeContext = useContext(MyThemeContext);
    const { style, ...otherProps } = props;
    let textStyle = addPropsStyle({
        color: myThemeContext.colors.text,
        fontSize: myThemeContext.FONT_SIZE_XLARGE,
    }, style);

    return (<Text style={textStyle} {...otherProps}>{props.children}</Text>);
}

export const MyCalendarText = (props) => {
    const myThemeContext = useContext(MyThemeContext);
    const { style, ...otherProps } = props;
    let textStyle = addPropsStyle({
        fontSize: myThemeContext.FONT_SIZE_MEDIUM,
        color: myThemeContext.colors.calendarContrast,
        backgroundColor: myThemeContext.colors.calendar,
    }, style);

    return (<Text style={textStyle} {...otherProps}>{props.children}</Text>);
}


export const MyCalendarTextLarge = (props) => {
    const myThemeContext = useContext(MyThemeContext);
    const { style, ...otherProps } = props;
    let textStyle = addPropsStyle({
        fontSize: myThemeContext.FONT_SIZE_LARGE,
        color: myThemeContext.colors.calendarContrast,
        backgroundColor: myThemeContext.colors.calendar,
    }, style);

    return (<Text style={textStyle} {...otherProps}>{props.children}</Text>);
}