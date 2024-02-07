import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable, Image, Alert, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import Button from '../../components/Button';
import { AdminUrl } from '../../constant';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

export const COLORS = {
    white: "#FFFFFF",
    black: "#222222",
    primary: "#fb7701",
    secondary: "#39B68D",
    grey: "#CCCCCC"
}

const RegisterScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const {t} = useTranslation()


    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
    const [loader, setLoader] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordShown(!isPasswordShown);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordShown(!isConfirmPasswordShown);
    };

    const isFirstNameValid = (text) => {
        return text.trim() !== ''; // Check if the trimmed value is not empty
    };

    const isLastNameValid = (text) => {
        return text.trim() !== ''; // Check if the trimmed value is not empty
    };

    const isMobileNumberValid = (text) => {
        // Basic validation for mobile number format (10 digits)
        const mobileNumberPattern = /^[0-9]{10}$/;
        return mobileNumberPattern.test(text);
    };

    const isCountryCodeValid = (text) => {
        // Basic validation for the country code (e.g., +91)
        const countryCode = /^\+\d{1,4}$/;
        return countryCode.test(text);
    };

    const isEmailValid = (text) => {
        // Basic email format validation
        const emailPattern = /\S+@\S+\.\S+/;
        return emailPattern.test(text);
    };

    const isPasswordValid = (text) => {
        // You can define your own password validation rules
        // For example, require a minimum length of 8 characters
        return text.length >= 8;
    };

    const isConfirmPasswordValid = (text) => {
        return text === password; // Confirm password should match the password
    };

    const handleSignUp = () => {
        // Validate input fields
        if (!isFirstNameValid(firstName)) {
            alert("Please enter a valid first name.");
            return;
        }

        if (!isLastNameValid(lastName)) {
            alert("Please enter a valid last name.");
            return;
        }

        if (!isEmailValid(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!isPasswordValid(password)) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (!isConfirmPasswordValid(confirmPassword)) {
            alert("Passwords do not match.");
            return;
        }

        if (!isCountryCodeValid(countryCode)) {
            alert("Please enter a valid country code.");
            return;
        }

        if (!isMobileNumberValid(phoneNumber)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        const userData = {
            given_name: firstName,
            family_name: lastName,
            email,
            countryCode,
            phone_number: `${countryCode} ${phoneNumber}`,
            password,
        };

        setLoader(true)
        // Send the user data to the backend API
        fetch(`${AdminUrl}/api/addcustomers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the backend (e.g., success message)
                if (!data?.success) {
                    Alert.alert('Error', data?.message)
                } else if (data?.success) {
                    navigation.navigate('Verification', { customer_id: data?.insertedId })
                }
            })
            .catch(error => {
                console.error('Error signing up:', error);
                // Handle the error (e.g., show an error message)
            })
            .finally(() => {
                // Code to be executed regardless of success or failure
                console.log('Request completed');
                setLoader(false)
            });

    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height mt-10'}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>

                <ScrollView style={{ backgroundColor: COLORS.white }}>
                    <View style={{ flex: 1, marginHorizontal: 22 }}>

                        <View className="mt-4" style={{}}>
                            <Text style={{
                                fontSize: 22,
                                fontWeight: 'bold',
                                marginVertical: 12,
                                color: COLORS.black
                            }}>
                                {t("Create Account")}
                            </Text>

                            <Text style={{
                                fontSize: 16,
                                color: COLORS.black
                            }}>{t("Discover great deals and shop with ease!")}</Text>
                        </View>

                        <View style={{ marginBottom: 12 }} className="flex-row">
                            <View className="w-[48%] gap-1">
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 400,
                                    marginVertical: 8
                                }}>{t("First Name")}</Text>

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
                                        placeholder='First Name'
                                        placeholderTextColor={COLORS.black}
                                        style={{ width: '100%' }}
                                        value={firstName}
                                        onChangeText={text => setFirstName(text)}
                                    />
                                </View>
                            </View>

                            <View className="w-[48%] gap-1 ml-3">
                                <Text style={{
                                    fontSize: 16,
                                    fontWeight: 400,
                                    marginVertical: 8
                                }}>{t("Last Name")}</Text>

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
                                        placeholder='Last Name'
                                        placeholderTextColor={COLORS.black}
                                        style={{ width: '100%' }}
                                        value={lastName}
                                        onChangeText={text => setLastName(text)}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 400,
                                marginVertical: 8
                            }}>{t("Email address")}</Text>

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
                                    style={{ width: '100%' }}
                                    value={email}
                                    onChangeText={text => setEmail(text)}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 400,
                                marginVertical: 8
                            }}>{t("Mobile Number")}</Text>

                            <View style={{
                                width: "100%",
                                height: 48,
                                borderColor: COLORS.black,
                                borderWidth: 1,
                                borderRadius: 8,
                                alignItems: "center",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingLeft: 22
                            }}>
                                <TextInput
                                    placeholder='+91'
                                    placeholderTextColor={COLORS.black}
                                    keyboardType='numeric'
                                    style={{
                                        width: "12%",
                                        borderRightWidth: 1,
                                        borderLeftColor: COLORS.grey,
                                        height: "100%"
                                    }}
                                    onChangeText={text => setCountryCode(text)}
                                    value={countryCode}

                                />

                                <TextInput
                                    placeholder='Enter your phone number'
                                    placeholderTextColor={COLORS.black}
                                    keyboardType='numeric'
                                    style={{
                                        width: "80%"
                                    }}
                                    value={phoneNumber}
                                    onChangeText={text => setPhoneNumber(text)}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: 12 }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 400,
                                marginVertical: 8
                            }}>{t("Password")}</Text>

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
                                    style={{ width: '100%' }}
                                    value={password}
                                    onChangeText={text => setPassword(text)}
                                />

                                <TouchableOpacity
                                    onPress={togglePasswordVisibility}
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
                            }}>{t("Confirm Password")}</Text>

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
                                    secureTextEntry={isConfirmPasswordShown}
                                    style={{ width: '100%' }}
                                    value={confirmPassword}
                                    onChangeText={text => setConfirmPassword(text)}
                                />

                                <TouchableOpacity
                                    onPress={toggleConfirmPasswordVisibility}
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

                        <View style={{
                            flexDirection: 'row',
                            marginVertical: 6
                        }}>
                            <Text>{t("I agree to the terms and conditions")}</Text>
                        </View>

                        {
                            loader ?
                                <ActivityIndicator />
                                : <Button
                                    title={t("Sign Up")}
                                    filled
                                    style={{
                                        marginTop: 18,
                                        marginBottom: 10,
                                    }}
                                    onPress={debounce(handleSignUp, 500)}

                                />
                        }

                    </View>
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>

    );
};

export default RegisterScreen;
