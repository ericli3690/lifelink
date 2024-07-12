import { Alert, Text, View } from "react-native";
import Map from "./Map";
import { useEffect } from "react";

export function Home() {
  return (
    <View className="mx-4">
      <Text className="text-xl text-stone-800 font-bold mb-2">Active Alerts</Text>
      <View className="border-4 rounded-sm border-stone-600 h-2/3 opacity-90">
        <Map />
      </View>
    </View>
  )
}