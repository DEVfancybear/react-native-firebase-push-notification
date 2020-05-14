import React, {Component} from 'react';
import {View, Text, Alert} from 'react-native';
import firebase from 'react-native-firebase';

export default class App extends Component {
  async componentDidMount() {
    await this.checkPermission();
    await this.createNotificationListeners();
  }

  //1
  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    let fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      // user has a device token
      console.log('fcmToken', fcmToken);
    }
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Text>Welcome to React Native!</Text>
      </View>
    );
  }
  ////////////////////// Add these methods //////////////////////

  //Remove listeners allocated in createNotificationListeners()
  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    console.log('Start createNotificationListeners');
    this.notificationListener = await firebase
      .notifications()
      .onNotification((notification) => {
        const localNotification = new firebase.notifications.Notification({
          sound: 'default',
          show_in_foreground: true,
        })
          .setNotificationId(notification.notificationId)
          .setTitle(notification.title)
          .setSubtitle(notification.subtitle)
          .setBody(notification.body)
          .setData(notification.data)
          // .setBadge(notification.data.badge ? notification.data.badge : 1)
          .android.setChannelId('fcm_default_channel') // e.g. the id you chose above
          // .android.setSmallIcon('@drawable/ic_launcher') // create this icon in Android Studio
          .android.setColor('#000000') // you can set a color here
          .android.setPriority(firebase.notifications.Android.Priority.High);

        firebase
          .notifications()
          .displayNotification(localNotification)
          .catch((err) => console.error(err));
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = await firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        const {title, body} = notificationOpen.notification;
        this.showAlert(title, body);
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const {title, body} = notificationOpen.notification;
      this.showAlert(title, body);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = await firebase.messaging().onMessage((message) => {
      //process data message
      console.log('message', JSON.stringify(message));
      const localNotification = new firebase.notifications.Notification({
        sound: 'default',
        show_in_foreground: true,
      })
        //.setNotificationId(notification.notificationId)
        .setTitle(message.data.title)
        .setSubtitle(message.data.message)
        .setBody(message.data.body)
        //.setData(notification.data)
        .android.setChannelId('fcm_default_channel') // e.g. the id you chose above
        //.android.setSmallIcon('@drawable/ic_launcher') // create this icon in Android Studio
        .android.setColor('#000000') // you can set a color here
        .android.setPriority(firebase.notifications.Android.Priority.High);
      //console.log("getMessage", message.data);

      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch((err) => console.error(err));
    });
  }

  showAlert(title, body) {
    Alert.alert(
      title,
      body,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  }
}
