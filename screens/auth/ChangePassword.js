import { View,SafeAreaView, Text, Image, Pressable, TextInput, TouchableOpacity, BackHandler, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'

import { Ionicons } from "@expo/vector-icons";
import Button from '../../components/Button'
import { COLORS } from './registerScreen';
import { useDispatch } from 'react-redux';
import { AdminUrl } from '../../constant';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changetabbarIndex } from '../../store/slices/counterslice';
import { updateCustomerData } from '../../store/slices/customerData';
import { debounce } from 'lodash';

const ChangePassword = ({ navigation, route }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const [isConfirmPasswordShown, setisConfirmPasswordShown] = useState(true);
    const customer_id = route.params

    const dispatch = useDispatch()

    const [loading, setLoading] = useState(false); // Track loading state
    useEffect(() => {
        setLoading(false); // Remove the activity indicator when component re-renders
    }, []);


    const [state, setState] = useState({
        password: "",
        securePassword: "",
        backClickCount: 0,
    });
    const updateState = (data) => setState((state) => ({ ...state, ...data }))



    const handleUpdatePassword = async () => {
        try {
            setLoading(true); // Show the activity indicator while the request is in progress

            // Check if passwords match
            if (password !== securePassword) {
                Alert.alert("Error", "Passwords do not match");
                setLoading(false);
                return;
            }

            // Validate password length
            if (password.length < 8) {
                Alert.alert("Error", "Password should be at least 8 characters long");
                setLoading(false);
                return;
            }

            // Validate secure password pattern
            const securePasswordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!securePasswordPattern.test(password)) {
                const missingPatterns = [];
                if (!/[A-Z]/.test(password)) missingPatterns.push('at least one uppercase letter');
                if (!/[a-z]/.test(password)) missingPatterns.push('at least one lowercase letter');
                if (!/\d/.test(password)) missingPatterns.push('at least one digit');
                if (!/[@$!%*?&]/.test(password)) missingPatterns.push('at least one special character (@$!%*?&)');

                const errorMessage = `Password must meet the following requirements: ${missingPatterns.join(', ')}`;
                Alert.alert("Error", errorMessage);
                setLoading(false);
                return;
            }

            // Construct the request body
            const requestBody = {
                password,
                customer_id
            };

            // Send a POST request to the server
            const response = await fetch(`${AdminUrl}/api/UpdateCustomerPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.status === 200) {
                // Password reset request was successful, show a popup to input OTP
                const data = await response.json()
                await AsyncStorage.setItem('customerData', JSON.stringify(data?.customer));
                dispatch(updateCustomerData(data?.customer))
                navigation.navigate("Home")
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

    const {
        password,
        securePassword
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
                            Change Password
                        </Text>


                    </View>

                </View>

                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 400,
                        marginVertical: 8
                    }}>Password</Text>

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
                            placeholder='Enter your password'
                            placeholderTextColor={COLORS.black}
                            secureTextEntry={isPasswordShown}
                            value={password}
                            onChangeText={(text) => updateState({ password: text })}
                            style={{
                                width: "100%"
                            }}
                        />

                        <TouchableOpacity
                            onPress={debounce(() => setIsPasswordShown(!isPasswordShown), 500)}
                            style={{
                                position: "absolute",
                                right: 12
                            }}
                        >
                            {
                                isPasswordShown == true ? (
                                    <Ionicons name="eye-off" size={24} color={COLORS.black} />
                                ) : (
                                    <Ionicons name="eye" size={24} color={COLORS.black} />
                                )
                            }

                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ marginBottom: 12 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 400,
                        marginVertical: 8
                    }}>Confirm Password</Text>

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
                            placeholder='Enter your Confirm password'
                            placeholderTextColor={COLORS.black}
                            secureTextEntry={isConfirmPasswordShown}
                            value={securePassword}
                            onChangeText={(text) => updateState({ securePassword: text })}
                            style={{
                                width: "100%"
                            }}
                        />

                        <TouchableOpacity
                            onPress={debounce(() => setisConfirmPasswordShown(!isConfirmPasswordShown), 500)}
                            style={{
                                position: "absolute",
                                right: 12
                            }}
                        >
                            {
                                isConfirmPasswordShown == true ? (
                                    <Ionicons name="eye-off" size={24} color={COLORS.black} />
                                ) : (
                                    <Ionicons name="eye" size={24} color={COLORS.black} />
                                )
                            }

                        </TouchableOpacity>
                    </View>
                </View>

                {
                    loading ? (
                        <ActivityIndicator size="small" color={"black"} />
                    ) : (
                        <Button
                            title="Update Password"
                            filled
                            style={{
                                marginTop: 18,
                                marginBottom: 4,
                            }}
                            onPress={debounce(handleUpdatePassword, 500)} // Replace 'handlePasswordReset' with the appropriate function for resetting the password
                        />
                    )
                }
            </View>


        </SafeAreaView>
    )
}

export default ChangePassword