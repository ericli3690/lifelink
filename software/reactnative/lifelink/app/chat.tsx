import { useEffect } from "react";
import { View, StatusBar, Text, Pressable, SafeAreaView } from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from "expo-router";

export default function Chat() {

  const { isOnDuty, isDispatcher } = useLocalSearchParams();

  useEffect(() => {
    StatusBar.setBackgroundColor("#FC4F42");
  }, [])
  
  return (
    <View className="h-[100vh]">
      <StatusBar backgroundColor="#FC4F42" />
      
      <View className="flex flex-row bg-[#FC4F42] h-14 items-center p-4">
        <Pressable onPress={() => {router.replace(`/?isOnDuty=${isOnDuty}&isDispatcher=${isDispatcher}` as any)}}><ExpoImage source={require("@/assets/images/left.png")} className="w-4 h-4 ml-2 mr-4" /></Pressable>
        <Text className="text-white font-bold text-xl">LifeLink</Text>
      </View>

      <SafeAreaView className="bg-stone-200 flex flex-1">
        <View className="mx-4 flex h-max flex-1">
          <Text>First Responder and Dispatcher Communication Log</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}