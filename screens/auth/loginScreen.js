import { SafeAreaView, View, Text, Image, Pressable, TextInput, TouchableOpacity, BackHandler, Alert, Platform } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'

import { Ionicons } from "@expo/vector-icons";
import Button from '../../components/Button'
import { COLORS } from './registerScreen';
import { useDispatch, useSelector } from 'react-redux';
import { fetchcart, getCartTotal } from '../../store/slices/cartSlice';
import { AdminUrl, appName } from '../../constant';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateCustomerData } from '../../store/slices/customerData';
import { ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, } from '@expo/vector-icons';
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import * as Facebook from "expo-auth-session/providers/facebook"
import { debounce } from 'lodash';
// import { sendNotificationWithNavigation, storeNotification } from '../NotificationExpo';
import { KeyboardAvoidingView } from 'react-native';
import { NativeModules } from 'react-native';
import { changeSomaliandistrict } from '../../store/slices/customerSlice';
import { useTranslation } from 'react-i18next';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';

WebBrowser.maybeCompleteAuthSession()
const Login = ({ navigation, route }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const { somalian_district } = useSelector((store) => store.customerAddress)
    const { t } = useTranslation()


    const [request, response, promptAsync] = Google.useAuthRequest({  //nilemarketplace7@gmail.com
        androidClientId: "831224318905-l5nn1q87t9s6q69hu69qp42u69nnq1ms.apps.googleusercontent.com",
        iosClientId: "831224318905-1tkvpbkqm6u3eegv32qlt6rsjr023qmi.apps.googleusercontent.com",
    })

    const [req, res, promptAsyncFacebook] = Facebook.useAuthRequest({  //nilemarketplace7@gmail.com
        clientId: "874759300637955"
    })

    const [loading, setLoading] = useState(false); // Track loading state
    useEffect(() => {
        setLoading(false); // Remove the activity indicator when component re-renders
    }, []);


    useEffect(() => {
        handleSignInWithGoogle();
    }, [response]);

    useEffect(() => {
        handleSignInWithFacebook()
    }, [res])
    ////////new apple sign in ///////////////////////////////

    function AppleSignIn() {
        return (
            <AppleButton
                buttonStyle={AppleButton.Style.BLACK}
                buttonType={AppleButton.Type.SIGN_IN}
                style={{

                    width: '100%',
                    height: 45,
                }}
                onPress={() => onAppleButtonPress().then(() => console.log('Apple sign-in complete!'))}
            />
        );
    }
    console.log(AdminUrl, "AdminUrl");
    async function onAppleButtonPress() {
        // Start the sign-in request
        console.log("SENDing apple reques again t");
        console.log("s");
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            // As per the FAQ of react-native-apple-authentication, the name should come first in the following array.
            // See: https://github.com/invertase/react-native-apple-authentication#faqs
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });
        console.log("sa");
        // Ensure Apple returned a user identityToken
        if (!appleAuthRequestResponse.identityToken) {
            throw new Error('Apple Sign-In failed - no identify token returned');
        }

        // Create a Firebase credential from the response
        const { identityToken, nonce } = appleAuthRequestResponse;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
        console.log(appleCredential, "APPLECERED");
        console.log("sending access token to backend");

        // Sign the user in with the credential
        try {
            console.log("a1");
            const userCredential = await auth().signInWithCredential(appleCredential);
            console.log("a2");
            const idToken = await userCredential.user.getIdToken()
            console.log(userCredential, idToken, "sss");
            await sendAccessTokenToBackendApple(idToken, { name: auth().currentUser.email, email: auth().currentUser.email })
        } catch (e) {
            console.log(e, "eerr");
            Alert.alert("Error Validating Identity", e)
        }
    }

    ////////new apple sign in ///////////////////////////////



    async function handleSignInWithGoogle() {
        if (response?.type === "success") {
            const accessToken = response.authentication.accessToken;

            // Send the access token to the backend
            await sendAccessTokenToBackend(accessToken);
        }
    }

    async function handleSignInWithFacebook() {
        if (res?.type === "success" && res.authentication) {
            const accessToken = res.authentication.accessToken;

            // Send the access token to the backend
            await sendAccessTokenToBackendofFacebook(accessToken);
        }
    }


    async function sendAccessTokenToBackendApple(idToken, userData) {
        try {
            const response = await fetch(`${AdminUrl}/api/getAppleUserData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken, userData }),

            });
            const data = await response.json()
            console.log(data, "data from backend");
            if (data.status === 401) {
                Alert.alert('Error', data.message)
                setLoading(false); // Remove the activity indicator when component re-renders
            }
            else if (data.status === 200) {

                await AsyncStorage.setItem('customerData', JSON.stringify(data.userdata));
                updateCartData(data?.userdata?.customer_id)
                dispatch(updateCustomerData(data?.userdata))
                setLoading(false)
                NativeModules.DevSettings.reload();
                navigation.replace('Home')
            }
        } catch (error) {
            Alert.alert(error)
        }
    }

    async function sendAccessTokenToBackend(accessToken) {
        try {
            setLoading(true)
            const response = await fetch(`${AdminUrl}/api/getGoogleUserData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessToken }),
            });

            const data = await response.json()

            if (data.status === 401) {
                Alert.alert('Error', data.message)
                setLoading(false); // Remove the activity indicator when component re-renders
            }
            else if (data.status === 200) {

                await AsyncStorage.setItem('customerData', JSON.stringify(data.userdata));
                updateCartData(data?.userdata?.customer_id)
                dispatch(updateCustomerData(data?.userdata))
                setLoading(false)
                // NativeModules.DevSettings.reload();
                navigation.replace('Home')
            }
        } catch (error) {
            console.error('Error while sending the access token:', error);
        }
    }

    async function sendAccessTokenToBackendofFacebook(accessToken) {
        try {
            setLoading(true)
            const response = await fetch(`${AdminUrl}/api/getFacebookData`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessToken }),
            });

            const data = await response.json()

            if (data.status === 401) {
                Alert.alert('Error', data.message)
                setLoading(false); // Remove the activity indicator when component re-renders
            }
            else if (data.status === 200) {
                dispatch(updateCustomerData(data?.userdata))
                updateCartData(data?.userdata?.customer_id)
                await AsyncStorage.setItem('customerData', JSON.stringify(data.userdata));


                // await sendNotificationWithNavigation(`Great, ${data?.userdata?.given_name}, You have logged in Successfully...✅`)

                navigation.replace('Home')
                setLoading(false)
            }
        } catch (error) {
            console.error('Error while sending the access token:', error);
        }
    }

    const dispatch = useDispatch()
    const cartItems = useSelector((state) => state.cart.cartItems);
    const updateCartData = async (customerId) => {
        try {
            console.log("CALLED the mixture function");
            if (cartItems?.length === 0) {
                const fetchCartTotal = async () => {
                    try {
                        const urlWithCustomerId = `${AdminUrl}/api/cartTotal?customer_id=${customerId}`;
                        const requestOptions = {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        };

                        const response = await fetch(urlWithCustomerId, requestOptions);

                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        const data = await response.json();
                        dispatch(getCartTotal(data.total));
                    } catch (error) {
                        console.error('Error fetching cart total:', error);
                        // Handle error as needed
                    }
                };

                const fetchCartData = async () => {
                    try {
                        const urlWithCustomerId = `${AdminUrl}/api/cart?customer_id=${customerId}`;
                        const requestOptions = {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        };

                        const response = await fetch(urlWithCustomerId, requestOptions);

                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        const data = await response.json();
                        dispatch(fetchcart(data));
                        dispatch(changeSomaliandistrict());
                    } catch (error) {
                        console.error('Error fetching cart data:', error);
                        // Handle error as needed
                    }
                };

                const fetchMogadishuDistrict = async () => {
                    try {
                        const response = await fetch(`${AdminUrl}/api/getmogadishudistrict`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                customer_id: customerId,
                                district: somalian_district,
                            }),
                        });
                        console.log(response, "response");
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        const responseData = await response.json();
                        // Handle the response data as needed
                        dispatch(changeSomaliandistrict(responseData.customer));
                    } catch (error) {
                        console.log(error);
                    }

                };


                // Usage
                await fetchCartTotal();
                await fetchCartData();
                await fetchMogadishuDistrict();
            }

            for (const singleCartItem of cartItems) {
                const { category, subcategory, uniquepid, vendorid, label, added_quantity } = singleCartItem;

                const replaceCategory = category.replace(/[^\w\s]/g, "").replace(/\s/g, "");
                const replaceSubcategory = subcategory.replace(/[^\w\s]/g, "").replace(/\s/g, "");

                const requestData = {
                    customer_id: customerId,
                    vendor_id: vendorid,
                    product_uniqueid: uniquepid,
                    category: replaceCategory,
                    subcategory: replaceSubcategory,
                    quantity: 1,
                    variantlabel: label,
                    added_quantity: added_quantity,

                };

                const response = await fetch(`${AdminUrl}/api/addProductcartlogin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    console.log("REQUEST WAS NOT SENT TO BACKEND");
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                console.log("Response sent");
            }
            const urlWithCustomerId1 = `${AdminUrl}/api/cartTotal?customer_id=${customerId}`;
            const requestOptions1 = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response1 = await fetch(urlWithCustomerId1, requestOptions1);
            if (!response1.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data1 = await response1.json()
            dispatch(getCartTotal(data1.total))
            const urlWithCustomerId = `${AdminUrl}/api/cart?customer_id=${customerId}`;
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const response = await fetch(urlWithCustomerId, requestOptions);

            const fetchMogadishuDistrict = async () => {
                try {
                    const response = await fetch(`${AdminUrl}/api/getmogadishudistrict`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customer_id: customerId,
                            district: somalian_district,
                        }),
                    });
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const responseData = await response.json();
                    // Handle the response data as needed
                    console.log("DISPATCHING FROM CART ) LOGIN ");
                    dispatch(changeSomaliandistrict(responseData.customer));
                } catch (error) {
                    console.log(error);
                }

            };
            fetchMogadishuDistrict()
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            else {
                const data3 = await response.json();
                dispatch(fetchcart(data3));

            }
        } catch (error) {
            console.log("Error while integrating redux cart with database login", error);
        }
    };

    const backAction = () => {
        backClickCount == 1 ? BackHandler.exitApp() : _spring();
        return true;
    }

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
        }, [backAction])
    );

    function _spring() {
        updateState({ backClickCount: 1 });
        setTimeout(() => {
            updateState({ backClickCount: 0 })
        }, 1000)
    }

    const [state, setState] = useState({
        email: "",
        password: "",
        securePassword: true,
        backClickCount: 0,
    });

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    const isEmailValid = () => {
        const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        return emailRegex.test(email);
    };

    const isPasswordValid = () => {
        return password.length >= 1; // Customize this validation as needed
    };

    const handleLogin = async () => {
        try {
            setLoading(true); // Show the activity indicator while the request is in progress

            if (!isEmailValid()) {
                Alert.alert("Error", 'Invalid email address')
                return;
            }

            if (!isPasswordValid()) {
                Alert.alert("Error", "Password must be at least 8 characters")
                return;
            }

            const requestBody = {
                email: email,
                password: password,
            };

            // Send a POST request to the server
            const response = await fetch(`${AdminUrl}/api/customerLoginEmail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (data.status === 200) {
                dispatch(updateCustomerData(data?.customerData))
                updateCartData(data?.customerData?.customer_id)
                await AsyncStorage.setItem('customerData', JSON.stringify(data.customerData));

                if (data.customerData.customer_interest !== null && data.customerData.customer_interest !== undefined && data.customerData.customer_interest.length > 0) {

                    navigation.replace("Home")
                } else {
                    // The customer_interest is null, undefined, or empty
                    // Handle this case or execute code accordingly
                    navigation.replace('Pick Interest')
                }
                console.log("SENDING NOTIFICATION FOR LOGGED IN USER");
                // await sendNotificationWithNavigation(`Great, ${data?.customerData?.given_name}`, 'You have logged in Successfully...✅')

            } else {
                // Handle the error based on the status code in data.status
                if (data.status === 401) {
                    // Unauthorized - Invalid email or password
                    Alert.alert("Error", data.message, [
                        { text: "OK", onPress: () => { } },
                    ]);
                } else if (data.status === 301) {
                    // Email sent for verification
                    navigation.replace('Verification', data?.user)
                } else {
                    // Other error status codes
                    Alert.alert("Error", "An error occurred", [
                        { text: "OK", onPress: () => { } },
                    ]);
                }
            }
        } catch (error) {
            console.error('Login failed', error);
            // Handle the error, e.g., show an error message to the user
        } finally {
            setLoading(false); // Remove the activity indicator when the request is complete
        }
    };




    const {
        email,
        password,
        backClickCount,
    } = state;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height mt-10'}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
                
                <View style={{ flex: 1, marginHorizontal: 22 }}>
                <View className="flex-row items-start">

                    <View style={{ marginVertical: 22 }}>
                        <View className="flex-row items-center">
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                
                                color: COLORS.black,
                                
                            }}
                            className="flex-1 mb-2">
                                {t(`Welcome to ${appName}`)}
                            </Text>



                        </View>

                        <Text style={{
                            fontSize: 16,
                            color: COLORS.black
                        }}>{t("Step into a World of Possibilities: Login to Your Marketplace Adventure!")}</Text>
                    </View>
                    <TouchableOpacity className="flex-row items-end  justify-end mt-4 mr-2" onPress={debounce(() => {
                    navigation.replace("Home")
                }, 500)}>
                    <MaterialCommunityIcons name="close" size={25} color={"black"} />
                </TouchableOpacity>

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
                                value={email}
                                onChangeText={(text) => updateState({ email: text })}
                                style={{
                                    width: "100%"
                                }}
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

                    <View style={{
                        flexDirection: 'row',
                        marginVertical: 6,
                        justifyContent: 'space-between'
                    }}>

                        <TouchableOpacity onPress={debounce(() => navigation.navigate('ForgotPassword'), 500)}>
                            <View>
                                <Text className="text-[#fb7701] font-semibold  italic " >{t("Forgot Passowrd ?")}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {
                        loading ?
                            <>
                                <ActivityIndicator size="small" color={"blak"} />

                            </> : <Button
                                title="Login"
                                filled
                                style={{
                                    marginTop: 18,
                                    marginBottom: 4,
                                }}

                                // className={`${!isEmailValid() || !isPasswordValid() ? 'bg-red-500' : ''}`}
                                onPress={!loading && handleLogin}
                                disabled={!isEmailValid() || !isPasswordValid()}
                            />


                    }


                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                        <View
                            style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: COLORS.grey,
                                marginHorizontal: 10
                            }}
                        />
                        <Text style={{ fontSize: 14 }}>{t("Or Login with")}</Text>
                        <View
                            style={{
                                flex: 1,
                                height: 1,
                                backgroundColor: COLORS.grey,
                                marginHorizontal: 10
                            }}
                        />
                    </View>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }} className="space-x-1" >
                        <TouchableOpacity
                            onPress={debounce(() => promptAsync(), 500)}
                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                height: 45,
                                borderWidth: 1,
                                borderColor: COLORS.grey,
                                marginRight: 4,
                                borderRadius: 10
                            }}
                        >
                            <Image
                                source={require("../../assets/google.png")}
                                style={{
                                    height: 20,
                                    width: 20,
                                    marginRight: 8
                                }}
                                resizeMode='contain'
                            />

                            <Text>Google</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            onPress={debounce(() => promptAsyncFacebook(), 500)}

                            style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                height: 45,
                                borderWidth: 1,
                                borderColor: COLORS.grey,
                                marginRight: 4,
                                borderRadius: 10
                            }}
                        >
                            <Image
                                source={require("../../assets/facebook.png")}
                                style={{
                                    height: 30,
                                    width: 30,
                                    marginRight: 8
                                }}
                                resizeMode='contain'
                            />

                            <Text>Facebook</Text>
                        </TouchableOpacity> */}



                    </View>
                    {
                        Platform.OS === "ios" &&

                        <View className="mt-4">
                            {AppleSignIn()}
                        </View>
                    }
                    <View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: 22
                    }}>
                        <Text style={{ fontSize: 16, color: COLORS.black }}>{t("Don't have an account ?")}</Text>
                        <Pressable
                            onPress={debounce(() => navigation.navigate("Register"), 500)}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: COLORS.primary,
                                fontWeight: "bold",
                                marginLeft: 6
                            }}>{t("Register")}</Text>
                        </Pressable>
                    </View>
                </View>

            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

export default Login