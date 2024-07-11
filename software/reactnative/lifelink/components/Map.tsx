import { Alert, Linking, Text, View } from "react-native";
import '@/styles/leaflet.css';
import '@/scripts/leaflet.js';

export default function Map() {
  return (
    <View>



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