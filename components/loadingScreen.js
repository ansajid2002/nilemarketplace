import React, { useEffect } from "react";
import { View } from "react-native";
import * as Font from "expo-font";
import { Colors } from "../constants/styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from "react-redux";
import { updateCustomerData } from "../store/slices/customerData";

const LoadingScreen = ({ navigation }) => {
    const dispatch = useDispatch()
    const { customerData } = useSelector((store) => store.userData)

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
            const onboarding = await AsyncStorage.getItem('onboarding');

            const a = JSON.parse(customerDataAsync)

            // Navigate to the appropriate screen based on AsyncStorage data
            if (customerDataAsync) {
                dispatch(updateCustomerData(a))
                navigation.push("Home")
            } else {
                if (onboarding === 1) {
                    navigation.navigate('Login');
                } else {
                    navigation.navigate('Onboarding');
                }
            }
        }

        loadFont();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: Colors.whiteColor }} />
    )
}

export default LoadingScreen;
