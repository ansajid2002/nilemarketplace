import { View, Text, Image, Pressable, TextInput, TouchableOpacity, BackHandler, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import Button from '../../components/Button'
import { COLORS } from './registerScreen';
import Checkbox from 'expo-checkbox';
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
import * as Facebook from "expo-auth-session/providers/facebook"
import { debounce } from 'lodash';
import { sendNotificationWithNavigation } from '../NotificationExpo';

WebBrowser.maybeCompleteAuthSession()
const Login = ({ navigation }) => {
    const [isPasswordShown, setIsPasswordShown] = useState(true);
    const [isChecked, setIsChecked] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "216641462687-7mv9inako2l7n3rmp5gq72qu8lquvnn0.apps.googleusercontent.com",
        iosClientId: "216641462687-0vgml3eh21399khfqk6avahgmis7sgo2.apps.googleusercontent.com",
        expoClientId: "216641462687-a2ut20irksvqdes9n9gfgs21p8hp1kq4.apps.googleusercontent.com"
    })

    const [req, res, promptAsyncFacebook] = Facebook.useAuthRequest({
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
                navigation.navigate('Home')
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
                await AsyncStorage.setItem('customerData', JSON.stringify(data.userdata));
                await sendNotificationWithNavigation(`Great, ${data?.userdata?.given_name}`, 'You have logged in Successfully...✅')
                updateCartData(data?.userdata?.customer_id)
                dispatch(updateCustomerData(data?.userdata))
                setLoading(false)

                navigation.navigate('Home')
            }
        } catch (error) {
            console.error('Error while sending the access token:', error);
        }
    }

    const dispatch = useDispatch()
    const { customerData } = useSelector((store) => store.userData)
    const { productsList } = useSelector((store) => store.products)
    const cartItems = useSelector((state) => state.cart.cartItems);

    const customerId = customerData[0]?.customer_id
    const requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };


    // const updateCartData = async (customerId) => {
    //     try {

    //         for (const cartItem of cartItems) {
    //             // Extract necessary data
    //             const { category, subcategory, uniquepid, vendorInfo, added_quantity, mrp, sellingprice, label } = cartItem;

    //             const replacecategory = category.replace(/[^\w\s]/g, "").replace(/\s/g, "");
    //             const replacesubcategory = subcategory.replace(/[^\w\s]/g, "").replace(/\s/g, "");

    //             // Prepare the request data
    //             const requestData = {
    //                 customer_id: customerId,
    //                 vendor_id: vendorInfo.id,
    //                 product_uniqueid: uniquepid,
    //                 category: replacecategory,
    //                 subcategory: replacesubcategory,
    //                 variantlabel: label,
    //                 mrp,
    //                 sellingprice,
    //                 quantity: added_quantity,
    //             };

    //             // Make a POST request to your API endpoint for updating the cart
    //             const response = await fetch(`${AdminUrl}/api/addProductcart`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify(requestData),
    //             });

    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! Status: ${response.status}`);
    //             }
    //         }


    //         // Fetch cart data
    //         const urlWithCustomerId = `${AdminUrl}/api/cart?customer_id=${customerId}`;
    //         const response = await fetch(urlWithCustomerId, requestOptions);

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }


    //         const cartData = await response.json();
    //         let matchingProducts = [...cartItems]
    //         cartData.forEach((cartItem) => {
    //             const productMatch = productsList.find(
    //                 (product) => product.uniquepid === parseInt(cartItem.product_uniqueid)
    //             );
    //             if (productMatch) {
    //                 // Create a new product for each matching cart item
    //                 const newProduct = { ...productMatch };
    //                 newProduct.mrp = cartItem.mrp; // Change 'mrp' based on cartItem
    //                 newProduct.sellingprice = cartItem.sellingprice; // Change 'sellingprice' based on cartItem
    //                 newProduct.label = cartItem.variantlabel; // Change 'label' based on cartItem
    //                 newProduct.added_quantity = cartItem.total_quantity; // Change 'label' based on cartItem
    //                 matchingProducts.push(newProduct);
    //             }
    //         });

    //         const asyncCart = await AsyncStorage.getItem('cartData');
    //         const parseCartData = asyncCart ? JSON.parse(asyncCart) : [];
    //         // Process and update cart items
    //         const updatedCartItems = [...parseCartData, ...matchingProducts];


    //         const itemMap = {};

    //         updatedCartItems.forEach((currentItem) => {
    //             const { uniquepid, label, added_quantity } = currentItem;
    //             // Convert added_quantity to a number
    //             const quantity = parseInt(added_quantity, 10);
    //             const key = label ? `${uniquepid}_${label}` : uniquepid;

    //             if (itemMap[key]) {
    //                 // If the key already exists, update its added_quantity
    //                 itemMap[key].added_quantity += quantity;
    //             } else {
    //                 // If the key doesn't exist, create a new entry
    //                 itemMap[key] = { ...currentItem, added_quantity: quantity };
    //             }
    //         });

    //         const outputArray = Object.values(itemMap);


    //         let cartUpdatedItem = []
    //         for (const cartItem of outputArray) {
    //             const { category, subcategory, uniquepid, label, vendorid, mrp, sellingprice } = cartItem;
    //             const replacecategory = category
    //                 .replace(/[^\w\s]/g, "")
    //                 .replace(/\s/g, "");
    //             const replacesubcategory = subcategory
    //                 .replace(/[^\w\s]/g, "")
    //                 .replace(/\s/g, "");

    //             const matchingCartItem = cartData.find(item => item.product_uniqueid === uniquepid && (item.variantlabel === label || !label));
    //             // Initialize addedQuantity to the current added_quantity (if available), or 0
    //             let addedQuantity = parseInt(cartItem.added_quantity, 10) || 0;

    //             if (matchingCartItem) {
    //                 // If a matching cart item is found, parse its total_quantity
    //                 addedQuantity = parseInt(matchingCartItem.total_quantity, 10);
    //             }

    //             if (parseCartData && parseCartData?.length > 0) {
    //                 const requestData = {
    //                     customer_id: customerId,
    //                     vendor_id: vendorid,
    //                     product_uniqueid: uniquepid,
    //                     category: replacecategory,
    //                     subcategory: replacesubcategory,
    //                     variantlabel: label,
    //                     mrp,
    //                     sellingprice,
    //                     quantity: addedQuantity,
    //                 };

    //                 const updateResponse = await fetch(`${AdminUrl}/api/addProductcart`, {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                     body: JSON.stringify(requestData),
    //                 });

    //                 if (!updateResponse.ok) {
    //                     throw new Error(`HTTP error! Status: ${updateResponse.status}`);
    //                 }
    //                 dispatch(addItem(cartItem))
    //             }
    //             // Update the cart item with added_quantity
    //             cartUpdatedItem.push({ ...cartItem, added_quantity: addedQuantity });

    //         }

    //         dispatch(addCarts(cartUpdatedItem));

    //         // Dispatch an action to update the cart items in the Redux store
    //     } catch (error) {
    //         console.error('Error updating cart:', error);
    //     }
    // };

    // const updateCartData = async (customerId) => {
    //     console.log("function called-----------------------------------------------------------------");
    //     try {
    //         const urlWithCustomerId = `${AdminUrl}/api/cart?customer_id=${customerId}`;
    //         const requestData = {
    //             customer_id: customerId,
    //             vendor_id: vendorInfo.id,
    //             product_uniqueid: uniquepid,
    //             category: replacecategory,
    //             subcategory: replacesubcategory,
    //             variantlabel: label,
    //             mrp,
    //             sellingprice,
    //             quantity: added_quantity,
    //         };
    //         const response = await fetch(urlWithCustomerId, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(requestData),
    //         });

    //         if (!response.ok) {
    //             throw new Error(`HTTP error! Status: ${response.status}`);
    //         }
    //         const responseData = await response.json();
    //         console.log(responseData, "COming from backend");

    //         if (responseData.length > 0) {
    //             // Append the new cart data to the existing cartItems array
    //             const updatedCartItems = [...cartItems, ...responseData];

    //             // Dispatch action to update the cartItems in Redux
    //             dispatch(fetchcart(updatedCartItems));
    //         }
    //         else {
    //             const updatedCartItems = [...cartItems];
    //             dispatch(fetchcart(updatedCartItems));

    //         }

    //     } catch (error) {
    //         console.log(error, "error while integrating cart data with fetched cart data");
    //     }
    // }
    const handleCrossIconPress = () => {
        navigation.navigate("Home")
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
                return; // Stop execution if email is invalid
            }

            if (!isPasswordValid()) {
                Alert.alert("Error", "Password must be at least 8 characters")
                return; // Stop execution if password is invalid
            }

            // Construct the request body
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
                // Successful login
                await AsyncStorage.setItem('customerData', JSON.stringify(data.customerData));
                // await AsyncStorage.setItem('loggedid', data.loggedid);

                // updateCartData(data?.customerData?.customer_id) // do it with redux persist
                dispatch(updateCustomerData(data?.customerData))
                updateCartData(data?.customerData?.customer_id)


                if (data.customerData.customer_interest !== null && data.customerData.customer_interest !== undefined && data.customerData.customer_interest.length > 0) {
                    // The customer_interest is not null, not undefined, and not empty
                    // You can proceed with your code here
                    navigation.navigate("Home")
                } else {
                    // The customer_interest is null, undefined, or empty
                    // Handle this case or execute code accordingly
                    navigation.navigate('Pick Interest')
                }
                await sendNotificationWithNavigation(`Great, ${data?.customerData?.given_name}`, 'You have logged in Successfully...✅')

            } else {
                // Handle the error based on the status code in data.status
                if (data.status === 401) {
                    // Unauthorized - Invalid email or password
                    Alert.alert("Error", data.message, [
                        { text: "OK", onPress: () => { } },
                    ]);
                } else if (data.status === 301) {
                    // Email sent for verification
                    navigation.navigate('Verification', data?.user)
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
                            Hi Welcome Back ! 👋
                        </Text>
                        <TouchableOpacity onPress={debounce(() => {
                            navigation.navigate("Home")
                        }, 500)}>
                            <MaterialCommunityIcons name="close" size={25} color={"black"} />
                        </TouchableOpacity>


                    </View>

                    <Text style={{
                        fontSize: 16,
                        color: COLORS.black
                    }}>Hello again you have been missed!</Text>
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

                <View style={{
                    flexDirection: 'row',
                    marginVertical: 6,
                    justifyContent: 'space-between'
                }}>
                    <View className="flex-row">
                        {/* <Checkbox
                            style={{ marginRight: 8 }}
                            value={isChecked}
                            onValueChange={setIsChecked}
                            color={isChecked ? COLORS.primary : undefined}
                        />

                        <Text>Remenber Me</Text> */}
                    </View>

                    <TouchableOpacity onPress={debounce(() => navigation.navigate('ForgotPassword'), 500)}>
                        <View>
                            <Text>Forgot Passowrd ?</Text>
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
                    <Text style={{ fontSize: 14 }}>Or Login with</Text>
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
                }}>
                    <TouchableOpacity
                        onPress={debounce(() => promptAsyncFacebook(), 500)}

                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            height: 52,
                            borderWidth: 1,
                            borderColor: COLORS.grey,
                            marginRight: 4,
                            borderRadius: 10
                        }}
                    >
                        <Image
                            source={require("../../assets/facebook.png")}
                            style={{
                                height: 36,
                                width: 36,
                                marginRight: 8
                            }}
                            resizeMode='contain'
                        />

                        <Text>Facebook</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={debounce(() => promptAsync(), 500)}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                            height: 52,
                            borderWidth: 1,
                            borderColor: COLORS.grey,
                            marginRight: 4,
                            borderRadius: 10
                        }}
                    >
                        <Image
                            source={require("../../assets/google.png")}
                            style={{
                                height: 36,
                                width: 36,
                                marginRight: 8
                            }}
                            resizeMode='contain'
                        />

                        <Text>Google</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    marginVertical: 22
                }}>
                    <Text style={{ fontSize: 16, color: COLORS.black }}>Don't have an account ? </Text>
                    <Pressable
                        onPress={debounce(() => navigation.navigate("Register"), 500)}
                    >
                        <Text style={{
                            fontSize: 16,
                            color: COLORS.primary,
                            fontWeight: "bold",
                            marginLeft: 6
                        }}>Register</Text>
                    </Pressable>
                </View>
            </View>

        </SafeAreaView>
    )
}

export default Login