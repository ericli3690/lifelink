import { Alert, Linking, Text, View } from "react-native";
import { WebView } from 'react-native-webview';

export default function Map() {
  return (
    <WebView source={{ uri: 'https://reactnative.dev/' }} style={{ flex: 1 }} />
  )
}