import React, { Component } from 'react';

import { Decimal } from 'decimal.js-light';
import * as Localization from 'expo-localization'
import i18n from 'i18n-js'
import * as Translations from '../i18n/Translations'

/**
 * Configure i18n to use our translations and set the locale
 */
i18n.fallbacks = true;
i18n.translations = { es: Translations.es, en: Translations.en };
i18n.locale = Localization.locale;

export default i18n;