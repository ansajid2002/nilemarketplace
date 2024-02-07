import {SafeAreaView, View, Text, Image, Pressable, TextInput, TouchableOpacity, BackHandler, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'

import { Ionicons } from "@expo/vector-icons";
import Button from '../../components/Button'
import { COLORS } from './registerScreen';

import { useDispatch, useSelector } from 'react-redux';
import { addCarts, addItem, emptyCart } from '../../store/slices/cartSlice';
import { changetabbarIndex } from '../../store/slices/counterslice';
import { AdminUrl } from '../../constant';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateCustomerData } from '../../store/slices/customerData';
import { ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, } from '@expo/vector-icons';
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import { debounce } from 'lodash';
import { Modal } from 'react-native';

WebBrowser.maybeCompleteAuthSession()
const ForgotPassword = ({ navigation }) => {
    const [isOTPModalVisible, setOTPModalVisible] = useState(false);
    const [otpInput, setOtpInput] = useState('');

    const [loading, setLoading] = useState(false); // Track loading state
    useEffect(() => {
        setLoading(false); // Remove the activity indicator when component re-renders
    }, []);


    const dispatch = useDispatch()

    const [state, setState] = useState({
        email: "",
        backClickCount: 0,
    });
    const updateState = (data) => setState((state) => ({ ...state, ...data }))


    const isEmailValid = () => {
        const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        return emailRegex.test(email);
    };

    const handleReset = async () => {
        try {
            setLoading(true); // Show the activity indicator while the request is in progress

            if (!isEmailValid()) {
                Alert.alert("Error", 'Invalid email address');
                return; // Stop execution if email is invalid
            }

            // Construct the request body
            const requestBody = {
                email: email
            };

            // Send a POST request to the server
            const response = await fetch(`${AdminUrl}/api/ResetCustomerPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.status === 200) {
                // Password reset request was successful, show a popup to input OTP
                setOTPModalVisible(true); // You should implement this function to show the OTP input popup
            } else {
                const data = await response.json();
                Alert.alert("Error", data.message);
            }
        } catch (error) {
            console.error('Request failed', error);
            // Handle the error, e.g., show an error message to the user
        } finally {
            setLoading(false); // Remove the activity indicator when the request is complete
        }
    };



    const handleOTPVerification = async () => {
        // Check if OTP is a 4-digit number
        if (/^\d{4}$/.test(otpInput)) {
            // OTP is valid, proceed with sending it to the backend

            try {
                const response = await fetch(`${AdminUrl}/api/ForgotPasswordOtpVerify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        otp: otpInput, // Send the OTP to the backend
                        email
                    }),
                });

                if (response.ok) {
                    // Request was successful, handle success response
                    // For example, you can show a success message
                    const data = await response.json()
                    navigation.navigate('ChangePassword', data?.customer_id)
                } else {
                    // Request failed, handle the error
                    throw new Error('Failed to verify OTP. Please try again.');
                }
            } catch (error) {
                // Handle any exceptions or network errors
                Alert.alert('Error', error.message);
            }
        } else {
            // OTP is not a 4-digit number, show an error message
            Alert.alert('Error', 'Please enter a 4-digit OTP code.');
        }
    };

    const {
        email,
    } = state;


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
            <View style={{ flex: 1, marginHorizontal: 22 }}>
                <View style={{ marginVertical: 22 }}>
                    <View className="flex-row items-center">

                        <Text style={{
                            fontSize: 22,
                            fontWeight: 'bold',
                            marginVertical: 12,
                            color: COLORS.black,

                        }}
                            className="flex-1">
                            Forgot Password
                        </Text>


                    </View>

                </View>

                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 400,
                        marginVertical: 8
                    }}>Email address</Text>

                    <View style={{
                        width: "100%",
                        height: 48,
                        borderColor: COLORS.black,
                        borderWidth: 1,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingLeft: 22
                    }}>
                        <TextInput
                            placeholder='Enter your email address'
                            placeholderTextColor={COLORS.black}
                            keyboardType='email-address'
                            value={email}
                            onChangeText={(text) => updateState({ email: text })}
                            style={{
                                width: "100%"
                            }}
                        />
                    </View>
                </View>


                {
                    loading ? (
                        <ActivityIndicator size="small" color={"black"} />
                    ) : (
                        <Button
                            title="Send Reset Email"
                            filled
                            style={{
                                marginTop: 18,
                                marginBottom: 4,
                            }}
                            onPress={debounce(handleReset,500)} // Replace 'handlePasswordReset' with the appropriate function for resetting the password
                            disabled={!isEmailValid()}
                        />
                    )
                }


                <View style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: 22
                }}>
                    <Text style={{ fontSize: 16, color: COLORS.black }}>Remember your password? </Text>
                    <Pressable
                        onPress={debounce(() => navigation.navigate("Login"),500)}  // Change "Login" to the name of your login screen
                    >
                        <Text style={{
                            fontSize: 16,
                            color: COLORS.primary,
                            fontWeight: "bold",
                            marginLeft: 6
                        }}>Go back to Login</Text>
                    </Pressable>
                </View>

            </View>


            {/* OTP Modal */}
            <Modal
                visible={isOTPModalVisible}
                transparent={true}
                animationType="slide">
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, width: 250 }} >
                        <Text className="font-bold text-xl text-gray-700">Enter OTP</Text>
                        <Text className="text-sm text-gray-700 mb-5">A verification code has been sent to your email.</Text>
                        <TextInput
                            placeholder="Enter OTP"
                            value={otpInput}
                            onChangeText={(text) => setOtpInput(text)}
                            style={{ fontSize: 16, borderBottomWidth: 1, borderColor: '#CDCDCD', marginBottom: 10 }}
                        />
                        <View className="flex-row w-1/2">
                            <TouchableOpacity onPress={debounce(() => setOTPModalVisible(false),500)} className="flex-row justify-center w-full">
                                <Text style={{ fontSize: 16, color: '#313131' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={debounce(() => handleOTPVerification(),500)} className="flex-row justify-center w-full">
                                <Text style={{ fontSize: 16, color: '#3493D9' }}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default ForgotPassword