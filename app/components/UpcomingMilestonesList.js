import React, { useState, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, FlatList, TouchableOpacity, Clipboard } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useScrollToTop } from '@react-navigation/native'

import { getDisplayStringDateTimeForEvent, getDisplayStringDateTimeForEpoch } from '../utils/Utils'
import CalendarContext, {
  howManyDaysAheadCalendar, howManyDaysAgoCalendar,
  getIsMilestoneAllDay, makeMilestoneClipboardContentForMilestone,
  getMilestoneVerboseDescription
} from '../context/CalendarContext'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import MyCard, { MyCardHeader, MyCardBodyText, MY_CARD_MARGIN } from '../components/MyCard'
import { shouldShowMilestoneForNumberType } from '../utils/milestones'
import ClipboardCopyable from '../components/ClipboardCopyable'
import AppSettingsContext from '../context/AppSettingsContext'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import MyText, { MyTextLarge } from './MyText'
import MyCalendarDivider from './MyCalendarDivider'

// This is only used to differentiate between old and new events, so no need to update
const nowTime = (new Date()).getTime();

// This is height without margin
const ITEM_HEIGHT = 72;
const heightWithMargin = ITEM_HEIGHT + 2 * MY_CARD_MARGIN;
const myCardHeightStyle = { height: ITEM_HEIGHT };


/* To optimize and improve FlatList performance, use fixed height
  items */
const getItemLayout = (data, index) => {
  return { length: heightWithMargin, offset: heightWithMargin * index, index };
};


export default function UpcomingMilestonesList(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const appSettingsContext = useContext(AppSettingsContext);
  const calendarContext = useContext(CalendarContext);

  // Store which events we want milestones for
  const eventTitleMap = {};
  const numMilestonesPerEventMap = {};
  for (let idx = 0; idx < props.events.length; idx++) {
    eventTitleMap[props.events[idx].title] = true;
    numMilestonesPerEventMap[props.events[idx].title] = 0;
  }

  /* Memoize for performance using allMilestones which is already sorted
  */
  let specials = useMemo(() => {
    return eventsAndMilestonesContext.allMilestones.filter(function (milestone, index, arr) {
      if (milestone.event && eventTitleMap[milestone.event.title]) {
        // yes this milestone is for one of the events

        /* New settings were added to determine whether math/science constants should be
          shown for custom and standard events separately. Check for that here instead of in shouldShowMilestoneForNumberType */
        if (milestone.numberCode) {
          // This is for a math/science constant
          if (milestone.event.isCustom && !appSettingsContext.settingsUseMathAndScienceConstantsForCustomEvents) {
            // This math/science constant but setting is off to show them for custom events
            return false;
          }
          if (!milestone.event.isCustom && !appSettingsContext.settingsUseMathAndScienceConstantsForStandardEvents) {
            // This math/science constant but setting is off to show them for standard events
            return false;
          }
        }
        if (shouldShowMilestoneForNumberType(milestone, appSettingsContext.numberTypeUseMap)) {
          // Yes we should show this type of milestone
          if (!props.maxNumMilestonesPerEvent) {
            // No max was specified
            return true;
          } else if (numMilestonesPerEventMap[milestone.event.title] < props.maxNumMilestonesPerEvent) {
            // A max limit was specified, and we haven't shown too many yet
            numMilestonesPerEventMap[milestone.event.title] = numMilestonesPerEventMap[milestone.event.title] + 1;
            return true;
          }
        }
      }
      return false;
    });
  }, [eventsAndMilestonesContext.allMilestones, props.events, props.maxNumMilestonesPerEvent, appSettingsContext.numberTypeUseMap]);


  const isEmpty = specials.length === 0;


  /* Find how many old events, and if there are at least 11 new */

  let oldCount = 0;
  let newCount = 0; for (let idx = 0; idx < specials.length; idx++) {
    if (specials[idx].time >= nowTime) {
      newCount++;
      if (newCount > 11) {
        // We've seen enough
        break;
      }
    } else {
      oldCount++;
    }
  }

  /* This is added conditionally, because if there aren't many items it causes things to be un-rendered
  after changing the max num per event.  There should be more shown, and they are not. 
   This prop to FlatList also needs getItemLayout */
  const initialScrollIndexOnlyIfMany = (newCount > 7 && oldCount > 1) ? { initialScrollIndex: oldCount } : {};

  const initialNumToRender = 12;

  const colorStyle = calendarContext.milestoneColorStyle;
  const cardStyle = calendarContext.milestoneCardStyle;

  let inPast = true;
  let firstNotInPastKey = null;

  // TBD - Could use useMemo for this if they did lots of scrolling back and forth
  const renderItem = ({ item, index, separators }) => {

    const noShowTimeOfDay = getIsMilestoneAllDay(item);
    const specialDisplayDateTime = getDisplayStringDateTimeForEpoch(item.time, noShowTimeOfDay);

    const desc = getMilestoneVerboseDescription(item);

    const isOnCalendar = calendarContext.getIsMilestoneInCalendar(item);
    const btnType = isOnCalendar ? "calendar-check" : "calendar-blank";
    const opacityStyle = !isOnCalendar ? styles.lessOpacity : styles.fullOpacity;
    // jmr - change styles on calendar screen too (and opacity).  Use commmon code??

    /* Finding first item not in past so we can have divider */
    if (inPast && item.time >= nowTime) {
      inPast = false;
      firstNotInPastKey = item.key;
    }

    /* We only want between past and future divider if it's not first item (so we also look at index)*/
    return (<React.Fragment>{(firstNotInPastKey === item.key) && index > 0 && <MyCalendarDivider />}
      <MyCard style={[styles.card, cardStyle, myCardHeightStyle]}>
        <View style={[styles.myCardTextWrapper, opacityStyle]}>

          <ClipboardCopyable onPressGetContentFunction={() => {
            return makeMilestoneClipboardContentForMilestone(item);
          }}>
            <MyCardHeader style={colorStyle}>{specialDisplayDateTime}</MyCardHeader>
            <MyCardBodyText style={colorStyle}>{desc}</MyCardBodyText>
          </ClipboardCopyable>
        </View>
        {calendarContext.isCalendarReady &&
          <View style={opacityStyle}>
            <TouchableOpacity onPress={() => calendarContext.toggleMilestoneScreenCalendarEvent(item)} style={styles.calendarButton}>
              <MaterialCommunityIcons name={btnType} size={18} style={colorStyle} />
            </TouchableOpacity>
          </View>
        }
      </MyCard>
    </React.Fragment>);
  }

  return (
    <React.Fragment>
      {!isEmpty &&
        <FlatList
          ref={ref}
          data={specials}
          ListHeaderComponent={props.listHeaderComponent}
          contentContainerStyle={styles.contentContainerStyle}
          renderItem={renderItem}
          initialNumToRender={initialNumToRender}
          getItemLayout={getItemLayout}
          {...initialScrollIndexOnlyIfMany}
        />
      }
      {isEmpty &&
        <React.Fragment>
          {props.showHeaderIfListEmpty && <View style={styles.contentContainerStyle}>{props.listHeaderComponent}</View>}
          <View style={styles.container} ><MyTextLarge style={styles.emptyText}>{i18n.t('emptyMilestoneMessage', { someValue: howManyDaysAheadCalendar })}</MyTextLarge></View>
        </React.Fragment>
      }
    </React.Fragment>
  );

}


UpcomingMilestonesList.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  listHeaderComponent: PropTypes.element,
  showHeaderIfListEmpty: PropTypes.bool, // still show header even if list is empty
  maxNumMilestonesPerEvent: PropTypes.number, // If > 0 only show up to this many milestones per event
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  contentContainerStyle: {
    padding: 15,
  },
  myCardTextWrapper: {
    flex: 1,
  },
  lessOpacity: {
    opacity: 0.5,
  },
  fullOpacity: {
    opacity: 1,
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    padding: 15,
  },
  calendarButton: {
    // padding is so touching close to it works too
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 5, // Not seen, but that's ok
  },
  card: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
