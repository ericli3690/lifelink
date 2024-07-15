import MapView, { Circle } from "react-native-maps";
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from "react";
import { Alert, Button, Image, ScrollView, Switch, Text, View, Pressable } from "react-native";
import { app } from '@/firebaseConfig.js';
import { getFirestore, collection, doc, onSnapshot, query } from 'firebase/firestore';

// const LOCATION_TASK_NAME = 'background-location-task';
// const BACKGROUND_FETCH_TASK = 'background-fetch';

// let recentEmergencyTimestamp = 0;

let foregroundActivated = false;

let unsubscribeOne = () => {};
let unsubscribeTwo = () => {};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

const sendNotification = () => {
  Notifications.scheduleNotificationAsync({
    content: {
      title: "New LifeLink Emergency",
      body: "Click to view LifeLink dashboard."
    },
    trigger: null
  });
}

const deselectedEmergency = {
  diagnosis: "NO EMERGENCY SELECTED",
  image: "",
  latitude: 0,
  longitude: 0,
  symptoms: [],
  timeOccured: {
    nanoseconds: 0,
    seconds: 0
  }
}

// const checkForEmergenciesUpdate = async (callback: any) => {

// }

// const backgroundFetchEmergenciesAndNotify = async () => {

//   console.log(`Background fetch fired at ${new Date().toUTCString()}.`);

//   await checkForEmergenciesUpdate(() => {
//     console.log("bg notif fire!!");
//   });

// }

// TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
//   await backgroundFetchEmergenciesAndNotify(); // action
//   return BackgroundFetch.BackgroundFetchResult.NewData; // finish
// });

export default function Map({savedIsOnDuty, savedIsDispatcher, savedUserID}: any) {

  // recentEmergencyTimestamp = 0;

  const [userLocation, setUserLocation]: any = useState({
    coords: {
      latitude: 0,
      longitude: 0
    }
  });

  const [recentEmergency, setRecentEmergency]: any = useState(deselectedEmergency);
  const [recentEmergencyTimestamp, setRecentEmergencyTimestamp]: any = useState(0);

  const [otherEmergencies, setOtherEmergencies]: any = useState([]);

  const [selectedEmergency, setSelectedEmergency]: any = useState(recentEmergency);
  const [selectedEmergencyTimeElapsedString, setSelectedEmergencyTimeElapsedString]: any = useState("NO EMERGENCY SELECTED");
  const [selectedEmergencyLocationString, setSelectedEmergencyLocationString]: any = useState("NO EMERGENCY SELECTED");
  const [selectedEmergencyDiagnosisString, setSelectedEmergencyDiagnosisString]: any = useState("NO EMERGENCY SELECTED.");
  const [selectedEmergencyImageString, setSelectedEmergencyImageString]: any = useState("");

  const [currentTime, setCurrentTime]: any = useState(0);

  const [isOnDuty, setIsOnDuty]: any = useState(savedIsOnDuty);
  const [isDispatcher, setIsDispatcher]: any = useState(savedIsDispatcher);

  const [isDropdownShown, setIsDropdownShown]: any = useState(false);

  const [showRecentEmergency, setShowRecentEmergency]: any = useState(true);
  const [showOtherEmergencies, setShowOtherEmergencies]: any = useState([]);

  const [userID, setUserID]: any = useState(savedUserID);

  const foregroundFetchEmergenciesAndNotify = async () => {

    // console.log(`Foreground fetch fired at ${new Date().toUTCString()}.`);

    // set location
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location);

    setTimeout(foregroundFetchEmergenciesAndNotify, 1000 * 30); // repeat in 30 seconds

  };

  // DEBUG
  // useEffect(() => {
  //   console.log("updated timestamp", recentEmergencyTimestamp);
  //   console.log("updated recentemergency timestamp", recentEmergency.timeOccured.seconds);
  // }, [recentEmergency]);

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
      if (!foregroundActivated) {
        await foregroundFetchEmergenciesAndNotify();
        foregroundActivated = true;
      }
      
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

    if (userLocation.coords.latitude == 0 && userLocation.coords.longitude == 0) return;
    
    unsubscribeOne();
    unsubscribeTwo();

    (async () => {
      // prepare notifications
      // set notification channel
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C'
      });
      // get perms
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Notification permissions are required for this app to work. Please grant notification permissions in Settings.');
        return;
      }

      // get recent emergency
      const db = getFirestore(app);

      unsubscribeOne = onSnapshot(doc(db, "emergencies", "most-recent"), doc => {

        if (!isOnDuty) return;

        const cloudRecentEmergency = doc.data();
        const cloudRecentEmergencyTimestamp = cloudRecentEmergency?.timeOccured.seconds;

        // console.log("comparing timestamps", cloudRecentEmergencyTimestamp, recentEmergencyTimestamp);
        
        if ((recentEmergencyTimestamp === 0) || (recentEmergencyTimestamp != cloudRecentEmergencyTimestamp)) {
          // the timestamp has updated, there is a new emergency
          // send notif and add new marker to map
          // callback(cloudRecentEmergency); // runs upon successful change

          setRecentEmergencyTimestamp(cloudRecentEmergencyTimestamp);

          if (!isDispatcher) {
            // get euclidean distance
            const locationDelta = Math.sqrt(
              Math.pow(cloudRecentEmergency?.latitude - userLocation.coords.latitude, 2) +
              Math.pow(cloudRecentEmergency?.longitude - userLocation.coords.longitude, 2)
            );
            // check if below threshold
            if (locationDelta < 0.01) {
              setRecentEmergency(cloudRecentEmergency);
              setShowRecentEmergency(true);
              sendNotification();
            } else {
              setShowRecentEmergency(false);
            }
          } else {
            setRecentEmergency(cloudRecentEmergency);
            setShowRecentEmergency(true);
            sendNotification();
          }
          
        }
      });

      // get all other emergencies
      const q = query(collection(db, "otherEmergencies"));
      unsubscribeTwo = onSnapshot(q, (querySnapshot) => {

        if (!isOnDuty) return;

        let temp: any[] = [];
        let tempBools: string[] = [];
        querySnapshot.forEach(doc => {

          const cloudOtherEmergency = doc.data();

          if (!isDispatcher) {
            // get euclidean distance
            const locationDelta = Math.sqrt(
              Math.pow(cloudOtherEmergency?.latitude - userLocation.coords.latitude, 2) +
              Math.pow(cloudOtherEmergency?.longitude - userLocation.coords.longitude, 2)
            );
            // check if below threshold
            if (locationDelta < 0.01) {
              temp.push(cloudOtherEmergency);
              tempBools.push('true');
              sendNotification();
            }
          } else {
            temp.push(cloudOtherEmergency);
            tempBools.push('true');
            sendNotification();
          }
          
        });
        setOtherEmergencies(temp);
        setShowOtherEmergencies(tempBools);

      });

    })();
  }, [userLocation, isDispatcher, isOnDuty]);

  // DEBUG
  // useEffect(() => {
  //   console.log(userLocation)
  // }, [userLocation])

  useEffect(() => {
    setSelectedEmergency(recentEmergency);
  }, [recentEmergency]);

  useEffect(() => {
    if (selectedEmergency.timeOccured.seconds == 0) {
      setSelectedEmergencyTimeElapsedString("NO EMERGENCY SELECTED");
    } else {
      setSelectedEmergencyTimeElapsedString(secondsToReading(currentTime - selectedEmergency.timeOccured.seconds));
    }
  }, [selectedEmergency, currentTime]);

  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${selectedEmergency.latitude}&lon=${selectedEmergency.longitude}&format=json`, {
      headers: {
        'User-Agent': 'LifeLinkMediHacks2024HackathonSubmissionv0.1'
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res.display_name == "Soul Buoy") { // location at 0,0
          setSelectedEmergencyLocationString("NO EMERGENCY SELECTED");
        } else {
          setSelectedEmergencyLocationString(res.display_name);
        }
      })
      .catch(error => {
        setSelectedEmergencyLocationString(`${selectedEmergency.latitude}, ${selectedEmergency.longitude}`);
      });
    
    setSelectedEmergencyDiagnosisString(selectedEmergency.diagnosis.trim().replace(/\s\s+/g,"\n\n"));
    setSelectedEmergencyImageString(selectedEmergency.image);
  }, [selectedEmergency])

  return (
    <View className="mx-4 flex h-max flex-1">
      {isDropdownShown &&
        <>
          <View className="flex flex-row items-center bg-stone-300 p-2 m-1 rounded-full">
            <Text className="flex-1">Are You On Duty?</Text>
            <Switch
              className="h-4"
              trackColor={{false: "grey", true: "salmon"}}
              thumbColor={isOnDuty ? "red" : "grey"}
              onValueChange={() => setIsOnDuty(!isOnDuty)}
              value={isOnDuty}
            />
          </View>
          <View className="flex flex-row items-center bg-stone-300 p-2 m-1 rounded-full">
            <Text className="flex-1">Are You A Dispatcher?</Text>
            <Switch
              className="h-4"
              trackColor={{false: "grey", true: "salmon"}}
              thumbColor={isDispatcher ? "red" : "grey"}
              onValueChange={() => setIsDispatcher(!isDispatcher)}
              value={isDispatcher}
            />
          </View>
        </>
      }
      <View className="flex flex-row items-center">
        <Text className="text-2xl text-stone-800 font-bold flex-1">EMERGENCIES:</Text>
        <Pressable onPress={() => {router.replace(`/chat?isOnDuty=${isOnDuty}&isDispatcher=${isDispatcher}&userID=${userID}` as any)}}>
          <View className="py-2 px-6 my-2 ml-2 rounded-full bg-[#FC4F42]"><ExpoImage source={require("@/assets/images/chat.png")} className="w-4 h-4" /></View>
        </Pressable>
        <Pressable onPress={() => {setIsDropdownShown(!isDropdownShown)}}>
          <View className="py-2 px-6 my-2 ml-2 rounded-full bg-[#FC4F42]"><ExpoImage source={require("@/assets/images/gear.png")} className="w-4 h-4" /></View>
        </Pressable>
      </View>
      <Text className="w-max text-center mb-2">Tap a red pin to view its corresponding emergency.</Text>
      <View className="border-8 rounded-lg border-stone-600 h-2/5 opacity-90">
        <MapView className="w-max h-full pointer-events-auto"
          provider={PROVIDER_GOOGLE}
          region={{
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            key={-2}
            coordinate={userLocation.coords}
            title={"Your Location"}
            description={"You are here."}
            pinColor={"gold"}
          />
          <Circle
            center={userLocation.coords}
            radius={1000}
            fillColor="rgba(255,255,0,0.3)"
            // strokeWidth={0}
          />
          {showRecentEmergency &&
            <Marker
              key={-1}
              coordinate={{ latitude: recentEmergency.latitude, longitude: recentEmergency.longitude }}
              title={"Emergency"}
              description={selectedEmergencyLocationString}
              onPress={() => {setSelectedEmergency(recentEmergency)}}
            />
          }
          {otherEmergencies.map((otherEmergency: any, index: number) => {
            return ((showOtherEmergencies[index] ? (showOtherEmergencies[index] === 'true') : false) && <Marker
              key={index}
              coordinate={{ latitude: otherEmergency.latitude, longitude: otherEmergency.longitude }}
              title={"Emergency"}
              description={selectedEmergencyLocationString}
              onPress={() => {setSelectedEmergency(otherEmergency)}}
            />)
          })}
        </MapView>
      </View>
      <View className="flex-1 bg-stone-300 mt-4 mb-4 rounded-lg">
        <ScrollView className="m-4">
          <Text className="text-xl text-red-500 mb-1">Emergency at <Text className="font-bold">{selectedEmergencyLocationString.toUpperCase()}</Text></Text>
          <Text className="font-bold text-md text-stone-800">Time elapsed: {selectedEmergencyTimeElapsedString}</Text>
          <View className="my-2 bg-red-200 p-2 rounded-lg">
            <Text className="font-bold text-lg text-red-500">Symptoms:</Text>
            <View className="flex flex-row flex-wrap">
              {selectedEmergency.symptoms.map((symptom: any, index: number) => {
                return (<View key={index} className="bg-red-500 rounded-xl w-fit p-1 m-1">
                  <Text className="text-white font-bold mx-2">{symptom}</Text>
                </View>)
              })}
            </View>
          </View>
          <Text className="font-bold text-md text-stone-800 mb-1">Diagnosis <Text className="italic">(Warning: This is AI-generated and not official medical advice)</Text>:</Text>
          <Text className="bg-stone-200 p-2 rounded-lg mb-1">{selectedEmergencyDiagnosisString}</Text>
          <Text className="font-bold text-md text-stone-800 mb-1">Victim Image:</Text>
          <View className="h-96 border-8 border-stone-200 rounded-lg mb-2">
            <Image className="object-contain h-full" source={{uri: `data:image/jpg;base64,${selectedEmergencyImageString}`}} />
          </View>
          {isDispatcher &&
            <Button title="Dismiss Emergency" color="red" onPress={() => {
              if (selectedEmergency == recentEmergency) {
                setShowRecentEmergency(false);
              } else {
                otherEmergencies.forEach((otherEmergency: any, index: number) => {
                  if (selectedEmergency == otherEmergency) {
                    let temp = showOtherEmergencies;
                    temp[index] = false;
                    setShowOtherEmergencies(temp);
                  }
                });
              }
              setSelectedEmergency(deselectedEmergency);
            }} />
          }
        </ScrollView>
      </View>
    </View>
  )
}

const secondsToReading = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const hoursString = hours > 0 ? `${hours} hours, ` : '';
  const minutesString = minutes > 0 ? `${minutes} minutes, ` : '';
  const secondsString = `${secs} seconds`;

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