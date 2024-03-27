import React, { useRef, useState } from "react";
import { SafeAreaView, View, StatusBar, ScrollView, TouchableOpacity, StyleSheet, Text, TextInput } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons } from '@expo/vector-icons';
// import { CircleFade } from 'react-native-animated-spinkit';

// import OTPTextView from 'react-native-otp-textinput';
import { Image } from "react-native";
import { AdminUrl, appName } from "../../constant";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCustomerData } from "../../store/slices/customerData";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { Overlay } from "@rneui/base";

const VerificationScreen = ({ navigation, route }) => {
    const { customer_id } = route.params
    const [otpInputs, setOtpInputs] = useState(['', '', '', '']);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];
    const [isLoading, setisLoading] = useState(false);
    const dispatch = useDispatch()
    const handleOtpChange = (text, index) => {
        if (/^\d+$/.test(text) && text.length <= 1) {
            otpInputs[index] = text;
            setOtpInputs([...otpInputs]);

            // Enable the next input when the current one is filled
            if (text.length > 0 && index < 3) {
                inputRefs[index + 1].current.focus();
            }
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primaryColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                <View style={styles.pageStyle}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {verifyTextWithBackArrow()}
                        {verifyInfo()}
                        {otpInfo()}
                        {continueButton()}
                    </ScrollView>
                </View>
                {loadingDialog()}
            </View>
        </SafeAreaView>
    )

    function loadingDialog() {
        return (
            <Overlay
                isVisible={isLoading}
                onBackdropPress={() => setisLoading(false)}
                overlayStyle={{ width: '80%', padding: 0.0, borderRadius: Sizes.fixPadding - 5.0 }}
            >
                <View style={styles.dialogWrapStyle}>
                    {/* <CircleFade size={56} color={Colors.primaryColor} /> */}
                    <Text style={{ ...Fonts.grayColor14Regular, marginTop: Sizes.fixPadding * 2.0 }}>
                        Please wait...
                    </Text>
                </View>
            </Overlay>
        );
    }

    function continueButton() {
        const otpString = otpInputs.join(''); // Convert OTP inputs to a string
        const otpAsInteger = parseInt(otpString, 10); // Convert the OTP string to an integer

        const sendOtp = async () => {
            try {
                setisLoading(true);

                const response = await fetch(`${AdminUrl}/api/verifyVerificationCodeCustomer`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ CustomerId: customer_id, verificationCode: otpAsInteger }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const responseData = await response.json();

                if (responseData.status === 200) {
                    await AsyncStorage.setItem('customerData', JSON.stringify(responseData.user));
                    // await AsyncStorage.setItem('loggedid', responseData.loggedid);
                    dispatch(updateCustomerData(responseData?.user))
                    navigation.navigate('Home')

                } else if (responseData.status === 401) {
                    Alert.alert("Error", responseData.message, [
                        { text: "OK", onPress: () => { } },
                    ]);
                }

                setisLoading(false);

                // You can handle the response data here
                // For example, navigate to the 'BottomTabBar' screen if the response is successful

                // navigation.push('BottomTabBar');
            } catch (error) {
                console.error('Error sending OTP:', error);
                setisLoading(false);

                // Handle the error as needed, e.g., show an error message to the user
            }
        };

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={debounce(sendOtp, 500)} // Call sendOtp when the button is pressed
                style={styles.continueButtonStyle}
            >
                <Text style={{ ...Fonts.whiteColor16Bold }}>CONTINUE</Text>
            </TouchableOpacity>
        );
    }




    function otpInfo() {
        const clearInputValues = () => {
            setOtpInputs(['', '', '', '']);
            inputRefs[0].current.focus(); // Focus on the first input after clearing
        };

        return (
            <View style={{ marginTop: Sizes.fixPadding + 5.0 }}>
                <Text style={{ textAlign: 'center', ...Fonts.blackColor16SemiBold }}>
                    Enter Code Here
                </Text>
                <View style={styles.otpInputContainer} className="flex-row justify-center mt-4 mb-4">
                    {otpInputs.map((input, index) => (
                        <TextInput
                            key={index}
                            style={[
                                styles.otpInput,
                            ]}
                            value={input}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            ref={inputRefs[index]}
                            className="border p-2 ml-2 text-2xl w-12 flex-row justify-center text-center"
                        />
                    ))}
                    <TouchableOpacity onPress={debounce(clearInputValues, 500)} className="ml-2 flex-row justify-center items-center">
                        <Text className="text-blue-600 tracking-wider">Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }


    function verifyInfo() {
        return (
            <Text style={{ marginHorizontal: Sizes.fixPadding * 2.0, textAlign: 'center', ...Fonts.grayColor14Medium }}>
                {`An email with verification instructions has been sent to your Gmail account. Please check your Gmail inbox and follow the instructions to verify your account.`}
            </Text>
        )
    }

    function verifyTextWithBackArrow() {
        return (
            <View style={styles.verifyTextWithBackArrowWrapStyle}>
                <MaterialIcons
                    name="arrow-back-ios"
                    color={Colors.blackColor}
                    size={22}
                    onPress={debounce(() => navigation.goBack(), 500)} // Use navigation.goBack() to go back
                />

                <Text style={{ textAlign: 'center', flex: 1, ...Fonts.primaryColor18SemiBold }}>
                    Verify Your Account
                </Text>
            </View>
        )
    }

    function header() {
        return (
            // <Text style={{ marginHorizontal: Sizes.fixPadding * 2.0, marginVertical: Sizes.fixPadding * 3.0, ...Fonts.whiteColor24AclonicaRegular }}>
            //     Nile Marketplace
            // </Text>
            <View className="h-20 ml-3 ">
                <Image
                    source={appName}
                    style={{ width: 120.0, height: 50.0, borderRadius: 10.0, }}
                    className="my-auto"

                />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 2.0,
        backgroundColor: Colors.primaryColor,
        borderBottomLeftRadius: Sizes.fixPadding + 5.0,
        borderBottomRightRadius: Sizes.fixPadding + 5.0,
    },
    pageStyle: {
        flex: 1,
        backgroundColor: Colors.whiteColor,
        borderTopLeftRadius: Sizes.fixPadding * 2.0,
        borderTopRightRadius: Sizes.fixPadding * 2.0,
    },
    verifyTextWithBackArrowWrapStyle: {
        marginTop: Sizes.fixPadding * 3.0,
        marginBottom: Sizes.fixPadding + 5.0,
        marginHorizontal: Sizes.fixPadding * 2.0,
        flexDirection: 'row',
        alignItems: 'center',
    },
    textFieldStyle: {
        borderBottomWidth: null,
        borderRadius: Sizes.fixPadding - 5.0,
        backgroundColor: Colors.whiteColor,
        borderWidth: 1.0,
        elevation: 2.0,
        ...Fonts.blackColor18Medium,
    },
    continueButtonStyle: {
        backgroundColor: Colors.primaryColor,
        margin: Sizes.fixPadding * 2.0,
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: Sizes.fixPadding + 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        shadowColor: Colors.primaryColor,
        elevation: 5.0,
        borderColor: 'rgba(75, 44, 32, 0.5)',
        borderWidth: 1.0,
    },
    dialogWrapStyle: {
        borderRadius: Sizes.fixPadding - 5.0,
        padding: Sizes.fixPadding * 2.0,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center'
    },
});

export default VerificationScreen;