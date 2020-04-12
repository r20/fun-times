import React from 'react'
import PropTypes from 'prop-types'
import theme, { getEventStyle } from '../style/theme'
import { Divider } from 'react-native-elements'


/* This was created in case need to style all dividers
(such as based on dark/light theme).  We can just do styling here. */
export default function (props) {
    return (<Divider {...props} />);
}