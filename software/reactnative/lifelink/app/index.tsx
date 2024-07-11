import { Home } from "@/components/Home";
import { Image, Text, View, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import Suitcase from '@/assets/images/suitcase.svg';
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";

export default function Index() {
  return (
    <>
      <ExpoStatusBar backgroundColor="#FC4F42" />
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
