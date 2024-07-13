import MapView from "react-native-maps";
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { app } from '@/firebaseConfig.js';
import { getFirestore, collection, getDocs, doc, onSnapshot } from 'firebase/firestore';

// const LOCATION_TASK_NAME = 'background-location-task';
const BACKGROUND_FETCH_TASK = 'background-fetch';

const backgroundFetchEmergenciesAndNotify = async () => {

  console.log(`Background fetch fired at ${new Date().toUTCString()}.`);

  // TODO add notification here

  const db = getFirestore(app);
  const unsub = onSnapshot(doc(db, "emergencies", "most-recent"), doc => {
    console.log("bg");
    // console.log(doc.data()?.diagnosis);
  });

  // const query = await getDocs(collection(db, "emergencies"));
  // query.forEach(document => {
  //   console.log(document.data());
  // });

}

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  await backgroundFetchEmergenciesAndNotify(); // action
  return BackgroundFetch.BackgroundFetchResult.NewData; // finish
});

export default function Map() {

  const [userLocation, setUserLocation]: any = useState({
    coords: { // some default coords in san francisco cus why not
      latitude: 37,
      longitude: -122
    }
  });

  const [recentEmergency, setRecentEmergency]: any = useState({
    diagnosis: "Loading...",
    image: "",
    latitude: 0,
    longitude: 0,
    symptoms: [],
    timeOccured: {
      nanoseconds: 0,
      seconds: 0
    }
  });

  const [otherEmergencies, setOtherEmergencies]: any = useState([]);

  const foregroundFetchEmergenciesAndNotify = async () => {

    console.log(`Foreground fetch fired at ${new Date().toUTCString()}.`);

    // set location
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);

    // TODO add notification here

    const db = getFirestore(app);
    const unsub = onSnapshot(doc(db, "emergencies", "most-recent"), doc => {
      const cloudRecentEmergency = doc.data();
      console.log(cloudRecentEmergency?.timeOccured.seconds, recentEmergency.timeOccured.seconds);
      if (recentEmergency.timeOccured.seconds === 0 || recentEmergency.timeOccured.seconds !== cloudRecentEmergency?.timeOccured.seconds) {
        // the timestamp has updated, there is a new emergency
        // send notif and add new marker to map
        setRecentEmergency(cloudRecentEmergency, () => {
          console.log("yup");
          setTimeout(foregroundFetchEmergenciesAndNotify, 1000 * 30); // repeat in 30 seconds
        });
        
      }
    });

  };

  useEffect(() => {
    (async () => {

      // on open, get user location and save to state so that ui updates
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

      // register background fetch
      BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 5, // seconds (actually fires every 30 seconds but im too scared to touch this)
        stopOnTerminate: false,
        startOnBoot: true
      });

      // register foreground fetch
      foregroundFetchEmergenciesAndNotify();

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
    >
      <Marker
        key={-2}
        coordinate={userLocation.coords}
        title={"Your Location"}
        description={"You are here."}
        pinColor={"gold"}
      />
      <Marker
        key={-1}
        coordinate={{ latitude: recentEmergency.latitude, longitude: recentEmergency.longitude }}
        title={"Emergency"}
        description={recentEmergency.diagnosis}
      />
    </MapView>
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