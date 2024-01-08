import React, { useCallback } from "react";
import { SafeAreaView, View, StatusBar, Text, BackHandler, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const SplashScreen = ({ navigation }) => {

    const backAction = () => {
        BackHandler.exitApp();
        return true;
    }

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
        }, [backAction])
    );

    // setTimeout(() => {
    //     navigation.push('Onboarding')
    // }, 2000);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar translucent={false} />
            <View style={{ flex: 1, alignItems: "center", justifyContent: 'center' }}>
                <Image
                    resizeMode="contain"
                    source={require('../assets/images/mainicon.png')}
                    style={{ width: 220.0, height: 300.0, borderRadius: 10.0, }}
                />

            </View>
        </SafeAreaView>
    )
}

export default SplashScreen;