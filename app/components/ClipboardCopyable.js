import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, Clipboard } from 'react-native'
import theme, { getContrastFontColor } from '../style/theme'
import i18n from '../i18n/i18n'
import { ToastAndroid } from 'react-native'; // jmr - need to find something for ios

import * as logger from '../utils/logger'


/**
 * Components in this file provide a way for consistent styling of information
 * about an event.
 * EventCard can have an EventHeader and one or more EventCardBodyText components within it.
 */

const ClipboardCopyable = (props) => {

    const content = props.content;

    const copiedMessage = i18n.t('copiedToClipboard');

    onCopy = () => {
        logger.warn("jmr == copied ", content);
        Clipboard.setString(content);
        ToastAndroid.show(copiedMessage, ToastAndroid.SHORT);
    }

    return (
        <React.Fragment>
            <TouchableOpacity onPress={onCopy}>
                {props.children}
            </TouchableOpacity>
        </React.Fragment>
    );
}

ClipboardCopyable.propTypes = {
    content: PropTypes.string.isRequired,
};

export default ClipboardCopyable;
