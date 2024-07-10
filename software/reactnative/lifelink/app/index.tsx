import { Component } from "@/components/Component";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <View className="flex flex-col">
        <Text>Edit app/index.tsx to edit this screen.</Text>
        <Component />
      </View>
    </SafeAreaView>
  );
}
