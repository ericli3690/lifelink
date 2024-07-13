import MapView from "react-native-maps";
import { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { app } from '@/firebaseConfig.js';
import { getFirestore, collection, getDocs, doc, onSnapshot, DocumentData } from 'firebase/firestore';

// const LOCATION_TASK_NAME = 'background-location-task';
// const BACKGROUND_FETCH_TASK = 'background-fetch';

let recentEmergencyTimestamp = 0;

// const checkForEmergenciesUpdate = async (callback: any) => {

// }

// const backgroundFetchEmergenciesAndNotify = async () => {

//   console.log(`Background fetch fired at ${new Date().toUTCString()}.`);

//   await checkForEmergenciesUpdate(() => {
//     // TODO send notif here
//     console.log("bg notif fire!!");
//   });

// }

// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   await backgroundFetchEmergenciesAndNotify(); // action
//   return BackgroundFetch.BackgroundFetchResult.NewData; // finish
// });

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

  const [selectedEmergency, setSelectedEmergency]: any = useState(recentEmergency);

  const [selectedEmergencyTimeElapsedString, setSelectedEmergencyTimeElapsedString]: any = useState("Loading...");

  const [currentTime, setCurrentTime]: any = useState(0);

  // const foregroundFetchEmergenciesAndNotify = async () => {

  //   console.log(`Foreground fetch fired at ${new Date().toUTCString()}.`);

  //   // set location
  //   let location = await Location.getCurrentPositionAsync({});
  //   setUserLocation(location);

  //   // set recent emergency
  //   checkForEmergenciesUpdate(setRecentEmergency);

  //   setTimeout(foregroundFetchEmergenciesAndNotify, 1000 * 30); // repeat in 30 seconds

  // };

  // DEBUG
  useEffect(() => {
    console.log("updated timestamp", recentEmergencyTimestamp);
    console.log("updated recentemergency timestamp", recentEmergency.timeOccured.seconds);
  }, [recentEmergency]);

  // set up locaction, emergency tracking, map
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

      // get recent emergency
      const db = getFirestore(app);

      const unsubscribe = onSnapshot(doc(db, "emergencies", "most-recent"), doc => {
        const cloudRecentEmergency = doc.data();
        const cloudRecentEmergencyTimestamp = cloudRecentEmergency?.timeOccured.seconds;

        console.log("comparing timestamps", cloudRecentEmergencyTimestamp, recentEmergencyTimestamp);
        
        if ((recentEmergencyTimestamp === 0) || (recentEmergencyTimestamp != cloudRecentEmergencyTimestamp)) {
          // the timestamp has updated, there is a new emergency
          // send notif and add new marker to map

          recentEmergencyTimestamp = cloudRecentEmergencyTimestamp;
          setRecentEmergency(cloudRecentEmergency);
          // callback(cloudRecentEmergency); // runs upon successful change
          
        }
      });

      // get all other emergencies
      const query = await getDocs(collection(db, "otherEmergencies"));
      let temp: any[] = [];
      query.forEach(doc => {
        temp.push(doc.data());
      });
      setOtherEmergencies(temp);

      // periodically update time
      setInterval(() => {
        setCurrentTime(Math.floor(Date.now()/1000));
      }, 1000); // every second

      // // register background fetch
      // await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      //   minimumInterval: 5, // seconds (actually fires every 30 seconds but im too scared to touch this)
      //   stopOnTerminate: false,
      //   startOnBoot: true
      // });

      // register foreground fetch
      // await foregroundFetchEmergenciesAndNotify();

      // old background location code

      // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      //   accuracy: Location.Accuracy.Balanced
      // })
      // .catch(e => {
      //   Alert.alert(`An error occured: ${e.code}`, `${e.message}`);
      // });

    })();
  }, []);

  useEffect(() => {
    setSelectedEmergency(recentEmergency);
    console.log(recentEmergency.symptoms);
  }, [recentEmergency]);

  useEffect(() => {
    setSelectedEmergencyTimeElapsedString(secondsToReading(currentTime - selectedEmergency.timeOccured.seconds));
  }, [selectedEmergency, currentTime]);

  const coordsToLocation = (latitude: number, longitude: number) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
      headers: {
        'User-Agent': 'LifeLinkMediHacks2024HackathonSubmissionv0.1'
      }
    })
      .then(res => res.json())
      .then(res => {return res.display_name})
      .catch(error => {
        return `${latitude}, ${longitude}`;
      });
    // in case of final failure
    return 'error';
  }

  return (
    <View className="mx-4 flex h-max flex-1">
      <Text className="text-xl text-stone-800 font-bold mb-2">Active Alerts</Text>
      <View className="border-4 rounded-sm border-stone-600 h-2/5 opacity-90">
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
            onPress={() => {setSelectedEmergency(recentEmergency)}}
          />
          {otherEmergencies.map((otherEmergency: any, index: number) => {
            return (<Marker
              key={index}
              coordinate={{ latitude: otherEmergency.latitude, longitude: otherEmergency.longitude }}
              title={"Emergency"}
              description={ otherEmergency.diagnosis }
              onPress={() => {setSelectedEmergency(otherEmergency)}}
            />)
          })}
        </MapView>
      </View>
      <View className="flex-1 border-4 border-stone-600 mt-2 mb-4">
        <ScrollView className="m-2">
          <Text>Emergency at {coordsToLocation(selectedEmergency.latitude, selectedEmergency.longitude)}</Text>
          <Text>Time elapsed: {selectedEmergencyTimeElapsedString}</Text>
          <Image source={{uri: `data:image/jpeg;base64,${selectedEmergency.image}`}} />
          <View className="flex flex-row flex-wrap">
            {selectedEmergency.symptoms.map((symptom: any, index: number) => {
              return (<View key={index} className="bg-red-500 rounded-xl w-fit p-1 m-1">
                <Text className="text-white font-bold mx-2">{symptom}</Text>
              </View>)
            })}
          </View>
          <Text className="bg-stone-400 p-2 rounded-lg">{selectedEmergency.diagnosis.trim().replace(/\s\s+/g,"\n\n")}</Text>
        </ScrollView>
      </View>
    </View>
  )
}

const secondsToReading = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const hoursString = hours > 0 ? `${hours}h, ` : '';
  const minutesString = minutes > 0 ? `${minutes}min, ` : '';
  const secondsString = `${secs}s`;

  return hoursString + minutesString + secondsString;
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