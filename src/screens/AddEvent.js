import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';
import DatePicker from 'react-native-date-picker';
import moment from 'moment';

const AddEventScreen = ({navigation, route}) => {
  const [eventTitle, setEventTile] = React.useState('');
  const [eventLocation, setEventLocation] = React.useState('');
  const [date, setDate] = React.useState();
  const [open, setOpen] = React.useState(false);
  const [dateValue, setdateValue] = React.useState('');
  const [dateEnd, setDateEnd] = React.useState();
  const [openEnd, setOpenEnd] = React.useState(false);
  const [endDateValue, setEndDateValue] = React.useState('');

  //Execute when component is loaded
  React.useEffect(() => {
    RNCalendarEvents.requestPermissions()
      .then(res => {
        console.log('Premission Response', res);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const createEvent = async () => {
    if (!(eventTitle && eventLocation && date && dateEnd)) {
      Alert.alert('Calendar Events', 'Please fill all fields!', [
        {text: 'OK', onPress: () => {}},
      ]);
      return;
    }
    try {
      await RNCalendarEvents.saveEvent(eventTitle, {
        calendarId: route?.params?.primaryCalendarId ?? '',
        startDate: date.toISOString(),
        endDate: dateEnd.toISOString(),
        location: eventLocation,
      });
      // console.log('Event Id--->', value);
      navigation.goBack();
    } catch (error) {
      // console.log(' Did Not work Threw an error --->', error);
      Alert.alert('Calendar Events', error.toString(), [
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ]);
    }
  };

  const changeDate = dateArg => {
    const dateArray = dateArg.toISOString().split('T');
    dateArray[0] = route?.params?.date;
    return new Date(dateArray.join('T'));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mainContainer}>
          <View style={styles.singleElement}>
            <View style={styles.textInputContainer}>
              <TextInput
                editable={false}
                style={styles.textInput}
                value={route?.params?.date ?? ''}
              />
            </View>
          </View>
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.singleElement}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Event Title"
                value={eventTitle}
                onChangeText={value => {
                  setEventTile(value);
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.singleElement}>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter Event Location"
                value={eventLocation}
                onChangeText={value => {
                  setEventLocation(value);
                }}
                multiline={true}
                numberOfLines={2}
              />
            </View>
          </View>
        </View>

        <View style={styles.mainContainer}>
          <View style={styles.singleElement}>
            <View style={styles.dateInputContainer}>
              <TouchableOpacity
                style={[styles.btn, {marginRight: 5}]}
                onPress={() => setOpen(true)}>
                {dateValue ? (
                  <Text> {dateValue} </Text>
                ) : (
                  <Text> Select Start Time </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, {marginLeft: 5}]}
                onPress={() => setOpenEnd(true)}>
                {endDateValue ? (
                  <Text> {endDateValue}</Text>
                ) : (
                  <Text> Select End Time </Text>
                )}
              </TouchableOpacity>
              <DatePicker
                modal
                open={open}
                date={date ?? new Date()}
                mode="time"
                onConfirm={date => {
                  const actualDateTime = changeDate(date);
                  var currentdate = new Date(actualDateTime);
                  const displayDate = moment(currentdate).format('h:mm A');
                  setOpen(false);
                  setDate(actualDateTime);
                  setdateValue(displayDate.toString());
                }}
                onCancel={() => {
                  setOpen(false);
                }}
              />
              <DatePicker
                modal
                open={openEnd}
                date={dateEnd ?? new Date()}
                mode="time"
                onConfirm={date => {
                  const actualDateTime = changeDate(date);
                  const currentdate = new Date(actualDateTime);
                  const displayDate = moment(currentdate).format('h:mm A');
                  setOpenEnd(false);
                  setDateEnd(actualDateTime);
                  setEndDateValue(displayDate.toString());
                }}
                onCancel={() => {
                  setOpenEnd(false);
                }}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveEvent}
          onPress={() => createEvent()}>
          <Text> Save Event </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4fc',
    paddingTop: 10,
  },
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 10,
  },

  singleElement: {
    display: 'flex',
    flex: 4,
    flexDirection: 'column',
  },

  textInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 1,
  },

  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveEvent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#7EC8E3',
    borderRadius: 10,
    marginTop: 30,
  },
});

export default AddEventScreen;
