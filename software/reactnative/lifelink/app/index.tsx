import { Home } from "@/components/Home";
import { Text, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Suitcase from '@/assets/images/suitcase.svg';
import { useEffect } from "react";

export default function Index() {

  useEffect(() => {
    StatusBar.setBackgroundColor("#FC4F42");
  }, [])
  
  return (
    <>
      <StatusBar backgroundColor="#FC4F42" />
      
      <View className="flex flex-row bg-[#FC4F42] h-14 items-center p-4">
        <Suitcase className="w-6 h-6 ml-2 mr-6" />
        <Text className="text-white font-bold text-xl">LifeLink</Text>
      </View>

      <SafeAreaView>
        <Home />
      </SafeAreaView>
    </>
  );
}
