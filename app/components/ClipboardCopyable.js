import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, Clipboard } from 'react-native'
import i18n from '../i18n/i18n'
import { ToastAndroid } from 'react-native'; // jmr - need to find something for ios

import * as logger from '../utils/logger'


/**
 * Components in this file provide a way for consistent styling of information
 * about an event.
 * EventCard can have an EventHeader and one or more EventCardBodyText components within it.
 */

const ClipboardCopyable = (props) => {

    const copiedMessage = i18n.t('copiedToClipboard');

    onCopy = () => {
        let content = props.content;
        if (props.onPressGetContentFunction) {
            content = props.onPressGetContentFunction();
        }
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

/* Should pass either content or a function to get content at onPress time */
ClipboardCopyable.propTypes = {
    content: PropTypes.string,
    onPressGetContentFunction: PropTypes.func,
};

export default ClipboardCopyable;
