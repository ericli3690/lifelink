import { useEffect, useState } from "react";
import { View, StatusBar, Text, Pressable, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView } from "react-native";
import { Image as ExpoImage } from 'expo-image';
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, getFirestore, onSnapshot, query, serverTimestamp, setDoc } from "firebase/firestore";
import { app } from "@/firebaseConfig";

let unsubscribeThree = () => {};

export default function Chat() {

  const { isOnDuty, isDispatcher, userID } = useLocalSearchParams();

  useEffect(() => {
    StatusBar.setBackgroundColor("#FC4F42");
  }, [])

  const [text, setText]: any = useState("");
  const [chatHistory, setChatHistory]: any = useState([]);

  const db = getFirestore(app);

  useEffect(() => {

    unsubscribeThree();

    (async () => {
      const q = query(collection(db, "chatLog"));
      unsubscribeThree = onSnapshot(q, {includeMetadataChanges: true}, (querySnapshot) => {
        let temp: any[] = [];
        querySnapshot.forEach(doc => {
          if (!doc.metadata.hasPendingWrites) temp.push(doc.data());
        });
        temp.sort((a: any,b: any) => {
          return a.timeSent.seconds - b.timeSent.seconds
        });
        setChatHistory(temp);
      });
    })();

  }, []);
  
  return (
    <KeyboardAvoidingView className="h-[100vh] flex absolute left-0 bottom-0 right-0">
      <StatusBar backgroundColor="#FC4F42" />
      
      <View className="flex flex-row bg-[#FC4F42] h-14 items-center p-4">
        <Pressable onPress={() => {router.replace(`/?isOnDuty=${isOnDuty}&isDispatcher=${isDispatcher}&userID=${userID}` as any)}}><ExpoImage source={require("@/assets/images/left.png")} className="w-6 h-6 ml-2 mr-4" /></Pressable>
        <Text className="text-white font-bold text-xl">LifeLink</Text>
      </View>

      <SafeAreaView className="bg-stone-200 flex flex-1">
        <Text className="text-2xl text-stone-800 font-bold ml-4 mt-4">MESSAGES:</Text>
        <View className="mb-4 mx-4 mt-2 flex h-max flex-1 bg-slate-300 rounded-lg">
          <ScrollView className="flex flex-col flex-1 m-4">
            {chatHistory.map((msgData: any, index: number) => {
              return (<View key={index} className="mb-2 flex flex-col items-start w-max">
                <View className="flex flex-row justify-start">
                  <Text className="mr-2 text-stone-800 font-bold text-md">{msgData.userID}</Text>
                  {
                    msgData.isDispatcher

                    ?

                    <Text className="mr-2 text-red-600 text-md font-bold">Dispatcher</Text>

                    :

                    <Text className="mr-2 text-red-400 text-md font-bold">First Responder</Text>
                  }
                </View>
                <Text>{convertSecondsToDate(msgData.timeSent.seconds)}</Text>
                <Text className="bg-slate-200 p-2 rounded-lg w-full text-left mt-1">{msgData.textBody}</Text>
              </View>)
            })}
          </ScrollView>
          <View className="flex-none flex flex-row m-4">
            <TextInput
              className="flex-1 border-2 border-stone-600 rounded-md p-2 h-12"
              placeholder="Tap to type"
              multiline={true}
              value={text}
              onChangeText={setText}
            />
            <Pressable onPress={() => {
              (async () => {
                await setDoc(doc(db, "chatLog", Date.now().toString()), {
                  isDispatcher: (isDispatcher == 'true'),
                  textBody: text,
                  timeSent: serverTimestamp(),
                  userID: userID
                });
                setText(""); // reset text input
              })();
            }}>
              <View className="py-2 px-6 my-2 ml-2 rounded-full bg-[#FC4F42]"><ExpoImage source={require("@/assets/images/send.png")} className="w-4 h-4" /></View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const convertSecondsToDate = (seconds: number) => {
  let d = new Date(0);
  d.setUTCSeconds(seconds)
  return d.toUTCString();
}