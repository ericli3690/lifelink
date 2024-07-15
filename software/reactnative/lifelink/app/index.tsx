import Map from "@/components/Map";
import { Text, View, StatusBar, Pressable } from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { SafeAreaView } from "react-native-safe-area-context";
import Suitcase from '@/assets/images/suitcase.svg';
import { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";

export default function Index() {

  const { isOnDuty, isDispatcher, userID } = useLocalSearchParams();

  const savedIsOnDuty = isOnDuty ? (isOnDuty === 'true') : true;
  const savedIsDispatcher = isDispatcher ? (isDispatcher === 'true') : false;
  const savedUserID = userID || (Math.floor(Math.random() * 999999999) + 1).toString();

  useEffect(() => {
    StatusBar.setBackgroundColor("#FC4F42");
  }, [])
  
  return (
    <View className="h-[100vh]">
      <StatusBar backgroundColor="#FC4F42" />
      
      <View className="flex flex-row bg-[#FC4F42] h-14 items-center p-4">
        <ExpoImage source={require("@/assets/images/icon.png")} className="w-10 h-8 ml-2 mr-4" />
        {/* <Suitcase className="w-6 rh-6 ml-2 mr-6" /> */}
        <Text className="text-white font-bold text-xl flex-1">LifeLink</Text>
      </View>

      <SafeAreaView className="bg-stone-200 flex flex-1">
        <Map savedIsOnDuty={savedIsOnDuty} savedIsDispatcher={savedIsDispatcher} savedUserID={savedUserID} />
      </SafeAreaView>
    </View>
  );
}
