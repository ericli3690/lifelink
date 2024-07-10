import { Home } from "@/components/Home";
import { StatusBar } from "expo-status-bar";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <>
      <StatusBar backgroundColor="#FC4F42"></StatusBar>
      <View className="flex flex-row bg-[#FC4F42] h-14 items-center p-4">
        <Image className="size-8" source={require('@/assets/images/suitcase-medical-solid.svg')} />
        {/* <Text className="text-white font-bold text-xl">LifeLink</Text> */}
      </View>
      
      <SafeAreaView>
        <Home />
      </SafeAreaView>
    </>
  );
}
