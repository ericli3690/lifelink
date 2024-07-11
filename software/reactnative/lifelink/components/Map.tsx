import MapView from "react-native-maps";

export default function Map() {
  return (
    <MapView className="w-max h-64"
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0022,
        longitudeDelta: 0.0021,
      }}
    />
  )
}