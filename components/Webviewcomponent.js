import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from "@expo/vector-icons";


const Webviewcomponent = ({route,navigation}) => {
    return (
    <SafeAreaView className="flex-1 bg-white">
    {/* <Text>{title}</Text> */}
    <TouchableOpacity className="m-3" onPress={() =>navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" size={25} />
    </TouchableOpacity>
       <WebView
      source={{ uri: route.params.externalUri }}
    />
    </SafeAreaView>
  )
}

export default Webviewcomponent