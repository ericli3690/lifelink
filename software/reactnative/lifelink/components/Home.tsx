import { Alert, Text, View } from "react-native";
import Map from "./Map";
import { app } from '@/firebaseConfig.js';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { useEffect } from "react";
import BackgroundTimer from 'react-native-background-timer';

export function Home() {

  useEffect(() => {
    BackgroundTimer.runBackgroundTimer(() => { 
      console.log("test")
      }, 
      3000);
    (async () => {
      const db = getFirestore(app);
      const query = await getDocs(collection(db, "emergencies"));
      query.forEach(document => {
        console.log(document.data());
      });
    })();
  }, []);

  return (
    <View className="mx-4">
      <Text className="text-xl text-stone-800 font-bold mb-2">Active Alerts</Text>
      <View className="border-4 rounded-sm border-stone-600 h-2/3 opacity-90">
        <Map />
      </View>
    </View>
  )
}