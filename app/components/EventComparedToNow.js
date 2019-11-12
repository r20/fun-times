import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'

import { getDateFromEvent } from '../context/EventListContext'
import * as JSDate from '../utils/jsDate'
import * as Utils from '../utils/Utils'
import i18n from '../i18n/i18n'
import { EventCardBodyText } from './EventCard'


export default function EventComparedToNow(props) {
  const date = getDateFromEvent(props.event);
  const now = new Date();

  const timeUnits = [
    { jsDateKey: 'm', lKey: 'months', defaultSigdig: 2 },
    { jsDateKey: 'w', lKey: 'weeks', defaultSigdig: 2 },
    { jsDateKey: 'd', lKey: 'days', defaultSigdig: 3 },
    { jsDateKey: 'h', lKey: 'hours', defaultSigdig: 3 },
    { jsDateKey: 'n', lKey: 'minutes', defaultSigdig: 3 },
    { jsDateKey: 's', lKey: 'seconds', defaultSigdig: 3 },
  ];

  return (<React.Fragment>
    {
      timeUnits.map((tu) => {
        const n = JSDate.datediff(tu.jsDateKey, date, now);
        return <EventCardBodyText key={tu.lKey} event={props.event}>{i18n.t(tu.lKey, { someValue: Utils.numberWithCommas(n) })}</EventCardBodyText>
      })
    }
  </React.Fragment>
  );
}

EventComparedToNow.propTypes = {
  event: PropTypes.object.isRequired,
};

