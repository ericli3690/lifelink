import { View, Text, Linking, Alert } from "react-native";
import Map from "./Map";

export function Home() {
  return (
    <View className="px-4">
      <Text>Testing testing!</Text>
      <Map />
      {/* mandatory copyright attribution */}
      <Text>Map data from <Text className="text-blue-400 font-bold" onPress={() => {
        Linking.openURL('https://www.openstreetmap.org/copyright')
          .catch(e => {
            Alert.alert(
              "An Error Occured."
            )
          })
      }}>OpenStreetMap</Text></Text>
    </View>
  )
}