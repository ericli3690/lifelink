import MapView from "react-native-maps";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const LOCATION_TASK_NAME = 'background-location-task';

export default function Map() {

  const [userLocation, setUserLocation]: any = useState({
    coords: {
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

      // await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      //   accuracy: Location.Accuracy.Balanced
      // })
    })
  }, []);

  return (
    <MapView className="w-max h-3/5"
      region={{
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      }}
    />
  )
}

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
//   }
// });