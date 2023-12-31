import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, Dimensions, ActivityIndicator } from "react-native";
import * as Font from "expo-font";
import { Colors } from "../constants/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from "react-redux";
import { updateCustomerData } from "../store/slices/customerData";
import { AdminUrl } from "../constant";
import { Image } from "react-native";
import { useTranslation } from "react-i18next";


const LoadingScreen = ({ navigation }) => {

    const dispatch = useDispatch()
    const [lscreen, setLscreen] = useState(null)
    const {t} = useTranslation()


    const fetchLoadingscreen = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getApploadingscreen`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLscreen(data)
        } catch (error) {
            console.error('Error:', error);
        } finally {
            const onboarding = await AsyncStorage.getItem('onboarding');
            const customerDataAsync = await AsyncStorage.getItem('customerData');
            setTimeout(() => {
                if (customerDataAsync) {
                    navigation.replace("Home")
                } else {
                    if (onboarding === "1") {
                        navigation.replace('Login');
                    } else {
                        navigation.replace('Onboarding');
                    }
                }
            }, 2000)

        }
    }

    useEffect(() => {
        if (!lscreen) {
            fetchLoadingscreen()
        }
    }, [lscreen])

    useEffect(() => {
        async function loadFont() {
            await Font.loadAsync({
                Montserrat_Light: require("../assets/fonts/montserrat/Montserrat-Light.ttf"),
                Montserrat_Regular: require("../assets/fonts/montserrat/Montserrat-Regular.ttf"),
                Montserrat_Medium: require("../assets/fonts/montserrat/Montserrat-Medium.ttf"),
                Montserrat_SemiBold: require("../assets/fonts/montserrat/Montserrat-SemiBold.ttf"),
                Montserrat_Bold: require("../assets/fonts/montserrat/Montserrat-Bold.ttf"),
                Aclonica_Regular: require("../assets/fonts/aclonica/Aclonica-Regular.ttf"),
            });

            // Check if 'loggedid' and 'customerData' exist in AsyncStorage
            const customerDataAsync = await AsyncStorage.getItem('customerData');
            console.log(customerDataAsync,"customerDataAsync");
            
            const a = JSON.parse(customerDataAsync)
            
            // Navigate to the appropriate screen based on AsyncStorage data
            if (a !== null) {
                dispatch(updateCustomerData(a))
            }

        }

        loadFont();
    }, []);
    return (
        <SafeAreaView className=" flex-row items-center justify-center bg-white " style={{ flex: 1 }} >

            {
                lscreen ?
                <Image
                    source={{ uri: `${AdminUrl}/uploads/Apploadingscreen/${lscreen[0]?.apploading_url}` }}
                    style={{ height: 600, width: 350}}
                /> : 
           
                <View>
                <ActivityIndicator size="large" color="#00008b" />
                </View>

            
            }


        </SafeAreaView>
    )
}

export default LoadingScreen;
