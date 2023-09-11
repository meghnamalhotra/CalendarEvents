import React, {useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {Agenda} from 'react-native-calendars';
import RNCalendarEvents from 'react-native-calendar-events';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {IMAGES} from '../constants';

const CalendarScreen = ({navigation}) => {
  const [items, setItems] = React.useState({});
  const [currentDate, setCurrentDate] = useState('');
  const [primaryCalendarId, setPrimaryCalendarId] = useState('');
  const navigateToEvent = useCallback(
    item => {
      (item?.date || currentDate) &&
        navigation.navigate('AddEvent', {
          date: item?.date ?? currentDate,
          primaryCalendarId,
        });
    },
    [primaryCalendarId, currentDate, navigation],
  );

  const deleteSelectedEvent = async id => {
    try {
      await RNCalendarEvents.removeEvent(id);
      fetchEvents();
    } catch (error) {
      Alert.alert('Calendar Events', error.toString(), [
        {text: 'OK', onPress: () => {}},
      ]);
    }
  };

  const detectCalendarIdByData = useCallback(data => {
    const calendarObj = data?.filter(item => item.isPrimary);
    setPrimaryCalendarId(calendarObj[0]?.id);
    return calendarObj[0]?.id;
  }, []);

  const fetchEvents = async () => {
    try {
      const calendarList = await RNCalendarEvents.findCalendars();
      const calendarId = detectCalendarIdByData(calendarList);
      if (calendarId) {
        const data = await RNCalendarEvents.fetchAllEvents(
          '2023-01-01T17:24:00.000Z',
          '2023-12-31T17:24:00.000Z',
          [calendarId],
        );
        const parsedData = data?.reduce((acc, item) => {
          const date = moment(item.startDate).format('YYYY-MM-DD');
          const startTime = moment(item.startDate).format('h:mm a');
          const endTime = moment(item.endDate).format('h:mm a');
          if (date in acc) {
            acc[date] = [
              ...acc[date],
              {
                title: item.title,
                location: item.location,
                startTime,
                endTime,
                date,
                id: item.id,
              },
            ];
          } else {
            acc[date] = [
              {
                title: item.title,
                location: item.location,
                startTime,
                endTime,
                index: 0,
                date,
                id: item.id,
              },
            ];
          }
          return acc;
        }, {});
        setTimeout(() => {
          setItems(parsedData);
        }, 1000);
      } else {
        Alert.alert('Calendar Events', 'Unable to sync with calendar', [
          {text: 'OK', onPress: () => {}},
        ]);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteEvent = useCallback(id => {
    Alert.alert(
      'Calendar Events',
      'Are you sure you want to delete the event?',
      [
        {text: 'OK', onPress: () => deleteSelectedEvent(id)},
        {text: 'Cancel', onPress: () => {}},
      ],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = item => {
    return (
      <View style={styles.mainView}>
        <TouchableOpacity
          onLongPress={() => deleteEvent(item.id)}
          activeOpacity={1}
          style={styles.item}>
          <Text
            style={
              styles.timeText
            }>{`${item.startTime.toUpperCase()} - ${item.endTime.toUpperCase()}`}</Text>
          <Text style={styles.title}>{`Title - ${item.title}`}</Text>
          <Text style={styles.location}>{`Location - ${item.location}`}</Text>
        </TouchableOpacity>
        {item.index === 0 ? (
          <TouchableOpacity
            onPress={() => navigateToEvent(item)}
            style={styles.addEventBtn}>
            <Image style={styles.eventIcon} source={IMAGES.addEvent} />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyView} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Agenda
        items={items ?? {}}
        renderEmptyData={() => (
          <TouchableOpacity
            style={styles.emptyAgenda}
            onPress={navigateToEvent}>
            <Image style={styles.eventIcon} source={IMAGES.addEvent} />
            <Text style={styles.addEventText}>Add Event</Text>
          </TouchableOpacity>
        )}
        onDayPress={data => {
          setCurrentDate(data?.dateString);
        }}
        selected={new Date()}
        refreshControl={null}
        showClosingKnob={false}
        refreshing={false}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainView: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    marginBottom: 5,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyAgenda: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  timeText: {
    fontSize: 12,
  },
  title: {
    marginTop: 10,
    fontSize: 16,
  },
  location: {
    fontSize: 16,
    marginTop: 2,
  },
  eventIcon: {
    height: 30,
    width: 30,
  },
  addEventBtn: {
    marginTop: 17,
    justifyContent: 'center',
    marginRight: 10,
  },
  addEventText: {
    fontSize: 16,
    marginLeft: 10,
  },
  emptyView: {
    marginRight: 40,
  },
});

export default CalendarScreen;
