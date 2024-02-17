import { View, Text, StyleSheet, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { TextInput } from 'react-native'
import { Colors } from '../../constants/styles'
import { useFormik } from 'formik'
import { addresFormSchema, sportsoutdoorSchema } from '../../schema'
import { TouchableOpacity } from 'react-native'
import { addAddress, changeCurrentAddress } from '../../store/slices/customerSlice'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { COLORS } from '../auth/registerScreen'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { t } from 'i18next'
import { ActivityIndicator } from 'react-native'
import { Alert } from 'react-native'
import { AdminUrl } from '../../constant'
import axios from 'axios'
import FullPageLoader from '../../components/FullPageLoader'
import { SafeAreaView } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { KeyboardAvoidingView } from 'react-native'

const Addaddress = ({ route, navigation }) => {
    const [locationloader, setLocationloader] = useState(false)
    const [loading, setloading] = useState(false)
    const dispatch = useDispatch()
    const { customerData } = useSelector((store) => store.userData)
    const customerId = customerData[0]?.customer_id
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);


    const getLocation = async () => {
        try {
            setloading(true)

            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});

            if (location) {
                const apiKey = 'AIzaSyAUnaIS0v-yOzJmGfrl6bXdGWuLE_l3NME';

                const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${apiKey}`;

                const response = await fetch(geocodingApiUrl);
                const data = await response.json();
                setLocation(data)
                fetchCurrentLocation(data)
            }

            // Log the results
        } catch (error) {
            console.error('Error getting location:', error.message);
            setErrorMsg('Error getting location');
        } finally {
            setloading(false)
        }
    };

    // const [currentLocation, setCurrentLocation] = useState(null);

    const fetchCurrentLocation = async (data) => {
        try {
            setloading(true)
            
            let updatedAddress;
            if (data) {

                const { formatted_address } = data?.results?.[0]
                const addressComponents = data?.results?.[0].address_components;

                const postalCode = addressComponents[addressComponents.length - 1]?.long_name;
                const countryCode = `${addressComponents[addressComponents.length - 2]?.long_name}`;
                const region = `${addressComponents[0]?.long_name}, ${addressComponents[1]?.long_name}`;
                const subregion = `${addressComponents[addressComponents.length - 3]?.long_name}`;
                const city = `${addressComponents[addressComponents.length - 4]?.long_name}`;


                // const { name, city, postalCode, country, subregion, region } = geocode[0];
                // setCurrentLocation({ latitude, longitude, name, city });

                if (customerData.length > 0) {
                    updatedAddress = {
                        city_address: city,
                        country_address: countryCode,
                        region_address: region,
                        subregion_address: subregion,
                        apt_address: formatted_address,
                        zip_address: postalCode,
                        given_name_address: customerData[0].given_name,
                        family_name_address: customerData[0].family_name,
                        email_address: customerData[0].email,
                        phone_address: customerData[0].phone_number,
                        address_id: null
                    };
                }

                const backendurl = `${AdminUrl}/api/manageAddressCustomer`;
                axios.post(backendurl, { ...updatedAddress, customerId })
                    .then((response) => {
                        // Filter banners with non-empty 'banner_url' before updating the state
                        if (response.data) {
                            navigation.navigate('Address');
                            setloading(false)
                            dispatch(changeCurrentAddress(response.data?.data));

                        }
                    })
                    .catch((error) => {
                        console.error('Failed to fetch Address:', error);
                    });



                navigation.goBack();
            } else {
                // setCurrentLocation({ latitude, longitude });
            }


        } catch (error) {
            console.log('Error getting current location:', error.message);
        } finally {
            setloading(false)
        }
        // Do not navigate here
        setLocationloader(false)
    };

    const [state, setState] = useState({
        address_id: route.params ? route.params.address_id : null,
        given_name_address: route.params ? route.params.given_name_address : null,
        family_name_address: route.params ? route.params.family_name_address : null,
        country_address: route.params ? route.params.country_address : null,
        apt_address: route.params ? route.params.apt_address : null,
        city_address: route.params ? route.params.city_address : null,
        region_address: route.params ? route.params.region_address : null,
        subregion_address: route.params ? route.params.subregion_address : null,
        zip_address: route.params ? route.params.zip_address : null,
        email_address: route.params ? route.params.email_address : null,
        note_address: route.params ? route.params.note_address : null,
        phone_address: route.params ? route.params.phone_address.trim().replace(/\s+/g, '') : null,
    })

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    const {
        address_id,
        given_name_address,
        family_name_address,
        country_address,
        region_address,
        subregion_address,
        apt_address,
        phone_address,
        apartment,
        city_address,
        country,
        selected_state,
        zip_address,
        email_address,
        phone_code,
        note_address,
    } = state;


    const { values, errors, handleBlur, handleSubmit, handleChange, touched } = useFormik({
        initialValues: {
            ...state
        },
        validationSchema: addresFormSchema,
        onSubmit: (values, { setSubmitting }) => {
            if (!phone_address || isNaN(parseInt(phone_address, 10)) || phone_address.length < 7 || phone_address.length > 13) {
                Alert.alert("Enter a Valid Phone Number");
            }
            else {
                const backendurl = `${AdminUrl}/api/manageAddressCustomer`;
                setloading(true)
                axios.post(backendurl, { ...values, customerId })
                    .then((response) => {
                        // Filter banners with non-empty 'banner_url' before updating the state
                        if (response.data) {
                            dispatch(addAddress(response.data.data))
                            navigation.navigate('Address');
                            setSubmitting(false);
                            setloading(false)
                        }
                    })
                    .catch((error) => {
                        console.error('Failed to fetch Address:', error);
                    });

                    navigation.navigate("Address")
            };

        }

    })


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height mt-10'}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

                {loading && <FullPageLoader />}
                <View className="p-2 bg-white" style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Icon name="arrow-back" size={30} color="black" />
                        </TouchableOpacity>
                    }
                    <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 600 }}>{t("Add delivery Address")}</Text>

                </View>
                <ScrollView className="pb-4 bg-white" showsVerticalScrollIndicator={false}>

                    {/* <Text className="text-xl font-semibold tracking-wide mt-4 mb-6 ml-3">{t("Your Delivery Address")}</Text> */}
                    <View>
                        {
                            locationloader ?
                                <TouchableOpacity className="flex-row px-4 border-b border-t  border-gray-300 py-2.5 h-14">

                                    <View className="bg-white  flex-row items-center">
                                        <ActivityIndicator size="large" color="#00008b" />
                                        <Text className="text-gray-400 ml-2 text-[14px]">{t("Fetching Location Data")}...</Text>
                                    </View></TouchableOpacity> :

                                <TouchableOpacity className="flex-row px-4 border-b border-t items-center  border-gray-300 py-4 h-14" onPress={debounce(() => getLocation(), 500)}>
                                    <MaterialCommunityIcons
                                        name="crosshairs-gps"
                                        size={20}
                                        color="#00008b"
                                    />
                                    <View className="flex-row items-center -mt-0.5 ">
                                        <Text className="text-base font-bold text-[#3535a3] ml-1.5  ">{t("Use My Current Location")}</Text>
                                        {/* <Text className="text-sm ml-2 mt-0 text-gray-500">Enable Location</Text> */}
                                    </View>
                                </TouchableOpacity>
                        }
                    </View>
                    <View>

                        <View className="flex-row">

                            <View className=" m-2 flex-1">
                                <Text className=" text-base mb-1 font-semibold tracking-wide">First Name</Text>
                                <TextInput className="text-[14px] border  flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md h-10"
                                    value={values.given_name_address}
                                    style={[
                                        touched.given_name_address && errors.given_name_address && { borderColor: 'red', borderWidth: 1 },
                                    ]}
                                    onChangeText={(value) => {
                                        handleChange('given_name_address')(value);
                                        updateState({ given_name_address: value });
                                    }}
                                    onBlur={handleBlur('given_name_address')}
                                />
                                {/* {touched.given_name_address && errors.given_name_address && (
                            <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.given_name_address}</Text>
                        )} */}
                            </View>
                            <View className=" m-2 flex-1">
                                <Text className=" text-base mb-1 font-semibold tracking-wide">Last Name</Text>
                                <TextInput className="text-[14px] border  flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md h-10"
                                    value={values.family_name_address}
                                    style={[
                                        touched.family_name_address && errors.family_name_address && { borderColor: 'red', borderWidth: 1 },
                                    ]}
                                    onChangeText={(value) => {
                                        handleChange('family_name_address')(value);
                                        updateState({ family_name_address: value });
                                    }}
                                    onBlur={handleBlur('family_name_address')}
                                />
                                {/* {touched.family_name_address && errors.family_name_address && (
                            <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.family_name_address}</Text>
                        )} */}
                            </View>
                        </View>

                        <View className="m-3">
                            <Text className="  text-base mb-1 font-semibold tracking-wide">Email Address</Text>
                            <TextInput className="text-[14px] h-10   flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md"
                                value={values.email_address}
                                style={[
                                    touched.email_address && errors.email_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                onChangeText={(value) => {
                                    handleChange('email_address')(value);
                                    updateState({ email_address: value });
                                }}
                                onBlur={handleBlur('email_address')}
                            />
                            {/* {touched.email_address && errors.email_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.email_address}</Text>
                    )} */}

                        </View>
                        <View style={{ marginBottom: 12 }} className="mx-4">
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 400,
                                marginVertical: 8
                            }}>Mobile Number</Text>



                            <TextInput
                                className="text-[14px] border flex-1 h-10 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md"
                                placeholder='Enter your phone number'
                                placeholderTextColor={COLORS.black}
                                keyboardType='numeric'
                                style={[
                                    touched.phone_address && errors.phone_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                value={values.phone_address}
                                onChangeText={(value) => {
                                    handleChange('phone_address')(value);
                                    updateState({ phone_address: value });
                                }}
                            />

                            {/* {touched.phone_address && errors.phone_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.phone_address}</Text>
                    )} */}

                        </View>
                        <View className="m-3">
                            <Text className="  text-base mb-1 font-semibold tracking-wide">Apartment, unit etc.</Text>
                            <TextInput className="text-[14px] border flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md h-10"
                                value={values.apt_address}
                                style={[
                                    touched.apt_address && errors.apt_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                onChangeText={(value) => {
                                    handleChange('apt_address')(value);
                                    updateState({ apt_address: value });
                                }}
                                onBlur={handleBlur('apt_address')}
                            />
                            {/* {touched.apt_address && errors.apt_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.apt_address}</Text>
                    )} */}

                        </View>

                        <View className="m-3">
                            <Text className=" text-base mb-1 font-semibold tracking-wide">Country</Text>
                            <TextInput className="text-[14px] border  flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md h-10"
                                value={values.country_address}
                                style={[
                                    touched.country_address && errors.country_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                onChangeText={(value) => {
                                    handleChange('country_address')(value);
                                    updateState({ country_address: value });
                                }}
                                onBlur={handleBlur('country_address')}
                            />
                            {/* {touched.country_address && errors.country_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.country_address}</Text>
                    )} */}
                        </View>

                        <View className="m-3">
                            <Text className="  text-base mb-1 font-semibold tracking-wide">Postcode / ZIP</Text>
                            <TextInput className="text-[14px] border h-10  flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md"
                                value={values.zip_address}
                                style={[
                                    touched.zip_address && errors.zip_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                onChangeText={(value) => {
                                    handleChange('zip_address')(value);
                                    updateState({ zip_address: value });
                                }}
                                onBlur={handleBlur('zip_address')}
                            />
                            {/* {touched.zip_address && errors.zip_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.zip_address}</Text>
                    )} */}

                        </View>
                        <View className="m-3">
                            <Text className="  text-base mb-1 font-semibold tracking-wide">Town/City</Text>
                            <TextInput className="text-[14px] border h-10  flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md"
                                value={values.city_address}
                                style={[
                                    touched.city_address && errors.city_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                onChangeText={(value) => {
                                    handleChange('city_address')(value);
                                    updateState({ city_address: value });
                                }}
                                onBlur={handleBlur('city_address')}
                            />
                            {/* {touched.city_address && errors.city_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.city_address}</Text>
                    )} */}

                        </View>
                        <View className="m-3">
                            <Text className="  text-base mb-1 font-semibold tracking-wide" >Subregion</Text>
                            <TextInput className="text-[14px] border h-10  flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md"
                                value={values.subregion_address}
                                style={[
                                    touched.subregion_address && errors.subregion_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                onChangeText={(value) => {
                                    handleChange('subregion_address')(value);
                                    updateState({ subregion_address: value });
                                }}
                                onBlur={handleBlur('subregion_address')}
                            />
                            {/* {touched.subregion_address && errors.subregion_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.subregion_address}</Text>
                    )} */}

                        </View>
                        <View className="m-3">
                            <Text className="  text-base mb-1 font-semibold tracking-wide" >Region</Text>
                            <TextInput className="text-[14px] border h-10  flex-1 px-3 py-2 bg-white rounded-md tracking-wider focus:shadow-md"
                                value={values.region_address}
                                style={[
                                    touched.region_address && errors.region_address ? { borderColor: 'red', borderWidth: 1 } : { borderColor: 'black', borderWidth: 1 },
                                ]}
                                onChangeText={(value) => {
                                    handleChange('region_address')(value);
                                    updateState({ region_address: value });
                                }}
                                onBlur={handleBlur('region_address')}
                            />
                            {/* {touched.region_address && errors.region_address && (
                        <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.region_address}</Text>
                    )} */}

                        </View>

                        <View className="m-3">
                            <Text className="  text-base mb-1 font-semibold tracking-wide">Note (Optional)</Text>

                            <TextInput
                                placeholder="Write here..."
                                // style={styles.textFieldWrapStyle}
                                selectionColor={Colors.primaryColor}
                                className=" text-[14px] border  flex-1 px-3 py-2 mb-4 bg-white tracking-wider rounded-md focus:shadow-md h-10"
                                multiline={true}
                                numberOfLines={5}
                                textAlignVertical="top"

                                value={values.note_address}
                                style={
                                    { borderColor: 'black', borderWidth: 1 }
                                }
                                onChangeText={(value) => {
                                    handleChange('note_address')(value);
                                    updateState({ note_address: value });
                                }}
                                onBlur={handleBlur('note_address')}
                            />



                        </View>
                    </View>

                </ScrollView>
                <TouchableOpacity onPress={debounce(handleSubmit, 500)} className="bg-[#00008b] py-1 ">
                    <Text className=" text-2xl m-2 mt-1 text-white text-center font-bold tracking-widest">{t("Save")}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </KeyboardAvoidingView>

    )
}

export default Addaddress