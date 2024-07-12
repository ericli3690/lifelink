import MapView from "react-native-maps";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { app } from '@/firebaseConfig.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// const LOCATION_TASK_NAME = 'background-location-task';
const BACKGROUND_FETCH_TASK = 'background-fetch';

const fetchEmergenciesAndNotify = () => {

  console.log(new Date().toUTCString());

  // useEffect(() => {
  //   (async () => {
  //     const db = getFirestore(app);
  //     const query = await getDocs(collection(db, "emergencies"));
  //     query.forEach(document => {
  //       console.log(document.data());
  //     });
  //   })();
  // }, []);

}

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  fetchEmergenciesAndNotify(); // action
  return BackgroundFetch.BackgroundFetchResult.NewData; // finish
});

export default function Map() {

  const [userLocation, setUserLocation]: any = useState({
    coords: { // some default coords in san francisco cus why not
      latitude: 37,
      longitude: -122
    }
  });

  useEffect(() => {
    // on open, get user location and save to state so that ui updates
    (async () => {
      let { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (foregroundStatus !== 'granted' || backgroundStatus !== 'granted') {
        Alert.alert(
          "Geolocation permissions are necessary to use this app.",
          "Please enable geolocation in your mobile device's settings."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);

      // also register background fetch
      BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 5, // seconds
        stopOnTerminate: false,
        startOnBoot: true
      });

      // old background location code

      // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      //   accuracy: Location.Accuracy.Balanced
      // })
      // .catch(e => {
      //   Alert.alert(`An error occured: ${e.code}`, `${e.message}`);
      // });

    })();
    
  }, []);

  return (
    <MapView className="w-max h-full pointer-events-auto"
      region={{
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }}
    />
  )
}

// old background location code

// type TaskData = {
//   locations?: Array<Location.LocationObject>;
// }

// TaskManager.defineTask<TaskData>(LOCATION_TASK_NAME, ({ data, error }) => {
//   if (error) {
//     Alert.alert("A background geolocation error occured.");
//     return;
//   }
//   if (data) {
//     const { locations } = data;
//     // can do stuff with locations here
//     console.log("locations");
//   }
// });