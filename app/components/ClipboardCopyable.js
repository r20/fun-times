import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { TouchableOpacity, Clipboard } from 'react-native'
import i18n from '../i18n/i18n'
import Toast from 'react-native-root-toast'

import * as logger from '../utils/logger'
import MyThemeContext from '../context/MyThemeContext';


/**
 * Component to put content on a clipboard when touched, and provide a copied to clipboard message
 */

const ClipboardCopyable = (props) => {

    const myThemeContext = useContext(MyThemeContext);

    const copiedMessage = i18n.t('copiedToClipboard');

    const onCopy = () => {
        let content = props.content;
        if (props.onPressGetContentFunction) {
            content = props.onPressGetContentFunction();
        }
        Clipboard.setString(content);
        Toast.show(copiedMessage, {
            backgroundColor: myThemeContext.colors.background,
            textColor: myThemeContext.colors.text,
            position: -60,
        });
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
