import React, { useState, useEffect, useRef } from "react";
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

import { SafeAreaView, View, StatusBar, ScrollView, TouchableOpacity, TextInput, FlatList, Image, StyleSheet, Text, PermissionsAndroid, PixelRatio, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { updateadsList } from "../../store/slices/myAdsSlice";
import * as MediaLibrary from 'expo-media-library';
import * as Animatable from 'react-native-animatable';
import Modal from 'react-native-modal';
import { debounce } from "lodash";



const AdDetailScreen = ({ navigation }) => {
    const dispatch = useDispatch()

    const States = require('country-state-city').State
    const Country = require('country-state-city').Country


    const reduxcity = useSelector((state) => state.locations.locationcity)
    const reduxcountry = useSelector((state) => state.locations.locationcountry)
    const reduxstate = useSelector((state) => state.locations.locationstate)
    const statestodisplay = States.getStatesOfCountry(`${reduxcountry}`)


    const a = statestodisplay.filter((single) => {
        let t
        if (single.isoCode === reduxstate) {
            t = single.name
        }
        return t
    })
    const defaultstate = a[0].name
    const countriestodisplay = Country.getAllCountries()

    const b = countriestodisplay.filter((single) => {
        let t
        if (single.isoCode === reduxcountry) {
            t = single.name
        }
        return t
    })
    const defaultcountry = b[0].name


    /////////////////////////////// LOGIC FOR GETTING STATE AND COUNTRY NAME USING CODES RESPECTIVELY/////////////////////


    const [selectedCurrency, setSelectedCurrency] = useState();

    const { adsList } = useSelector((store) => store.adPosting)

    const [itemPhotosList, setItemPhotosList] = useState(adsList.images);
    const [newItemPhotosList, setNewItemPhotosList] = useState(
        itemPhotosList.map((image, index) => ({
            id: index,
            image: image,
        }))
    )

    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const toggleModal = (imageUri) => {
        setSelectedImage(imageUri);
        setModalVisible(!isModalVisible);
    }

    const togglecamera = () => {
        if (adsList.images.length < 8) {
            getPermissions()
            setShowCamera((prev) => !prev);
        } else {
            // Display a message to the user (e.g., using a notification or alert)
            alert('You can only upload upto 8 Photos');
        }
    }

    const postDetails = () => {

        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
        ];
        for (const key in state) {

            if (state.hasOwnProperty(key)) {
                const value = state[key];

                if (adsList.hasOwnProperty(key)) {
                    dispatch(updateadsList({ key: key, value: value }));
                }
            }
        }
        dispatch(updateadsList({ key: "uniquepid", value: new Date().getTime() }));
        dispatch(updateadsList({ key: "date", value: `${new Date().getDate()} ${monthNames[new Date().getMonth()]} ,${new Date().getFullYear()}  ` }));
        // navigation.push('ReviewItem')
    }


    // ////////////////////////////      CAMERA PERMISSION        ////////////////////////////////////////////

    let cameraRef = useRef()
    const [hasCameraPermission, setHasCameraPermission] = useState()
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState()
    const [photo, setPhoto] = useState()
    const [showCamera, setShowCamera] = useState(false)


    const getPermissions = async () => {
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
        setHasCameraPermission(cameraPermission.status === 'granted');
        setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    };



    const takePic = async () => {
        if (cameraRef.current) {
            let options = {
                quality: 0.5,
                base64: true,
                exif: false,
            };

            let newPhoto = await cameraRef.current.takePictureAsync(options);
            setPhoto(newPhoto);

        }
    };

    const savePhoto = () => {
        if (photo) {
            MediaLibrary.saveToLibraryAsync(photo.uri)
                .then(() => {
                    setNewItemPhotosList((prev) => [
                        ...prev,
                        {
                            id: new Date().getTime(),
                            image: photo.uri,
                        },
                    ]);

                    dispatch(updateadsList({ key: "images", value: [...adsList.images, photo.uri] }));

                })
                .then(() => {
                    setPhoto(undefined);
                })
                .then(() => {
                    setShowCamera(false)
                })
        }
    };

    ///////////////////////////   USING GALLARY   /////////////////////////////////////////////

    const [image, setImage] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const selectedImageUri = result.assets[0].uri;

            setNewItemPhotosList((prev) => [
                ...prev,
                {
                    id: new Date().getTime(),
                    image: selectedImageUri,
                },
            ]);

            dispatch(updateadsList({ key: "images", value: [...adsList.images, selectedImageUri] }));

            setImage(selectedImageUri); // Set the image URI after the state updates
            setShowCamera(false)

        }
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////

    const [state, setState] = useState({
        uniquepid,
        ad_title: null,
        description: null,
        currency_symbol: "SOS",
        price: null,

        locationcity: reduxcity,
        locationstate: defaultstate,
        locationcountry: defaultcountry,
        vendorId: null,
        brand: null,

    })

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    const {
        uniquepid,
        ad_title,
        description,
        currency_symbol,
        price,
        locationcity,
        locationstate,
        locationcountry,
        vendorId,
        brand,
    } = state;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Sizes.fixPadding }}>
                    {itemPhotosInfo()}
                    {divider()}
                    {itemInfo()}
                    {nextButton()}
                </ScrollView>

            </View>
        </SafeAreaView>
    )

    function nextButton() {
        return (
            <TouchableOpacity className="mt-4"
                activeOpacity={0.9}

                onPress={debounce(postDetails, 500)}

                style={styles.nextButtonStyle}
            >
                <Text style={{ ...Fonts.whiteColor16Bold }}>
                    NEXT
                </Text>
            </TouchableOpacity>
        )
    }

    function itemInfo() {
        return (
            <View style={{ marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <Text style={{ ...Fonts.blackColor16SemiBold }}>
                    Item Info
                </Text>
                {/* {itemBrandInfo()} */}
                {adTitleInfo()}
                {/* {adDescriptionInfo()} */}
                {itemPriceInfo()}
                {/* {purchashedOnInfo()} */}
                {/* {conditionInfo()} */}
                {locationInfo()}
                {descriptionInfo()}
            </View>
        )
    }

    function descriptionInfo() {
        return (
            <View style={{ marginVertical: Sizes.fixPadding, }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Write Short Description About Item
                </Text>
                <TextInput
                    placeholder="Write here..."
                    style={[styles.textFieldWrapStyle,
                    touched.description && errors.description && { borderColor: 'red', borderWidth: 1 },
                    ]}
                    selectionColor={Colors.primaryColor}

                    multiline={true}
                    numberOfLines={5}
                    textAlignVertical="top"
                    value={values.description}
                    // onChangeText={(value) => updateState({ description: value })}
                    onChangeText={(value) => {
                        handleChange('description')(value);
                        updateState({ description: value });
                    }}
                    onBlur={handleBlur('description')}
                />
                {touched.description && errors.description && (
                    <Text className="mt-1" style={{ color: 'red' }}>{errors.description}</Text>
                )}
            </View>
        )
    }

    function locationInfo() {
        return (
            <View>

                <View className="flex-row ">
                    <View className="flex-1" style={{ marginVertical: Sizes.fixPadding - 5.0, marginHorizontal: Sizes.fixPadding - 5.0 }}>
                        <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                            Select City
                        </Text>
                        <TextInput
                            placeholder="Select City"
                            style={styles.textFieldWrapStyle}
                            selectionColor={Colors.primaryColor}
                            value={locationcity}
                            onChangeText={(value) => updateState({ locationcity: value })}
                        />

                    </View>
                    <View className="flex-1" style={{ marginVertical: Sizes.fixPadding - 5.0, marginHorizontal: Sizes.fixPadding - 5.0 }}>
                        <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                            Select State
                        </Text>
                        <TextInput
                            placeholder="Select State"
                            style={styles.textFieldWrapStyle}
                            selectionColor={Colors.primaryColor}
                            value={locationstate}
                            onChangeText={(value) => updateState({ locationstate: value })}
                        />

                    </View>
                </View>




                <View style={{ marginVertical: Sizes.fixPadding - 5.0, }}>
                    <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                        Select Country
                    </Text>
                    <TextInput
                        placeholder="Select Country"
                        style={styles.textFieldWrapStyle}
                        selectionColor={Colors.primaryColor}
                        value={locationcountry}
                        onChangeText={(value) => updateState({ locationcountry: value })}
                    />

                </View>




            </View>
        )
    }

    function conditionInfo() {
        return (
            <View style={{ marginVertical: Sizes.fixPadding }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Condition
                </Text>
                <TextInput
                    placeholder="New"
                    style={styles.textFieldWrapStyle}
                    selectionColor={Colors.primaryColor}
                    value={condition}
                    onChangeText={(value) => updateState({ condition: value })}
                />
            </View>
        )
    }



    function itemPriceInfo() {

        return (
            <View style={{ marginVertical: Sizes.fixPadding }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Set Item Price
                </Text>
                <View style={styles.textFieldWrapStyle} className="border border-gray-300 p-0  rounded-md flex-row items-center">
                    <Picker
                        selectedValue={selectedCurrency}
                        onValueChange={(itemValue, itemIndex) => {
                            setSelectedCurrency(itemValue)
                            updateState({ currency_symbol: itemValue })
                        }}


                        style={{
                            flex: .55,
                            borderWidth: 1,       // Add border width
                            borderColor: 'red', // Adjust border color
                            borderRadius: 5,     // Add border radius if desired
                            padding: 5,
                            // Add padding if desired
                        }}
                    >
                        <Picker.Item label="(S)  Somali Shilling " value="SOS" />
                        <Picker.Item label="($)  US Dollar " value="USD" />
                        <Picker.Item label="(€)  Euro " value="EUR" />
                        <Picker.Item label="(Br)  Ethiopian Birr " value="ETB" />
                        <Picker.Item label="(Ksh)  Kenyan Shilling " value="KES" />

                    </Picker>
                    <TextInput
                        className="flex-1"
                        placeholder="Enter the Price"
                        style={styles.textFieldWrapStyle}
                        selectionColor={Colors.primaryColor}
                        value={price}
                        onChangeText={(value) => updateState({ price: Number(value) })}
                    />
                </View>
            </View>
        )
    }

    function adTitleInfo() {
        return (
            <View style={{ marginVertical: Sizes.fixPadding - 5.0, }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Ad Title
                </Text>
                <TextInput
                    placeholder="Enter Ad Name"
                    style={[styles.textFieldWrapStyle,
                    touched.ad_title && errors.ad_title && { borderColor: 'red', borderWidth: 1 },
                    ]}
                    selectionColor={Colors.primaryColor}
                    value={values.ad_title}
                    onChangeText={(value) => {
                        handleChange('ad_title')(value);
                        updateState({ ad_title: value });
                    }}
                    onBlur={handleBlur('ad_title')}
                />
                {touched.ad_title && errors.ad_title && (
                    <Text className="mt-1 ml-2" style={{ color: 'red' }}>{errors.ad_title}</Text>
                )}
            </View>
        )
    }

    function itemBrandInfo() {
        return (
            <View style={{ marginVertical: Sizes.fixPadding, }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Item Brand
                </Text>
                <TextInput
                    placeholder="IPhone"
                    style={styles.textFieldWrapStyle}
                    selectionColor={Colors.primaryColor}
                    value={brand}
                    onChangeText={(value) => updateState({ brand: value })}
                />
            </View>
        )
    }

    function divider() {
        return (
            <View style={{ backgroundColor: Colors.lightGrayColor, height: 1.0, margin: Sizes.fixPadding * 2.0, }} />
        )
    }

    function itemPhotosInfo() {

        const renderItem = ({ item }) => {


            return (
                <View className="mt-4">
                    <TouchableOpacity onPress={debounce(() => toggleModal(item.image), 500)}>
                        <View style={{ alignItems: 'center' }} className="mr-4">
                            <Image
                                resizeMode="contain"
                                source={{ uri: item.image }}
                                style={{ width: 80.0, height: 80.0, borderRadius: Sizes.fixPadding - 5.0 }}
                            />


                        </View>

                    </TouchableOpacity>

                    <Modal className="bg-[rgba(0,0,0,0.6)]" isVisible={isModalVisible}>
                        <Image
                            resizeMode="contain"
                            source={{ uri: selectedImage }}
                            style={{
                                width: "100%", // Set your desired width
                                height: undefined, // Let the height be calculated based on the aspect ratio
                                aspectRatio: 4 / 3, // Set the aspect ratio as per your image's aspect ratio
                                borderRadius: Sizes.fixPadding - 1.0,
                            }}
                            imageIndex={0}
                            isVisible={isModalVisible}
                            onClose={() => toggleModal(null)}

                        />


                        <TouchableOpacity onPress={debounce(() => toggleModal(null), 500)} style={{ position: 'absolute', top: 10, right: 10 }}>
                            <MaterialIcons name="close" size={32} color="#fff" />
                        </TouchableOpacity>
                    </Modal>
                </View>
            )
        }

        return (
            <View className="">
                <View style={styles.itemPhotosTitleWrapStyle}>
                    <Text style={{ ...Fonts.blackColor16SemiBold }}>
                        Item Photos <Text className="text-[12px]  text-gray-400"> (upto 8 Photos)</Text>
                    </Text>
                    <Text style={{ ...Fonts.grayColor10SemiBold }}>
                        <MaterialIcons name="add-a-photo" size={35} color="#00008b" onPress={debounce(togglecamera, 500)} />
                    </Text>


                </View>
                {/* /////////////////////////////CAMERA COMPONENT ///////////////////////////////////////////// */}

                {
                    showCamera ?
                        <Camera ref={cameraRef} className="aspect-[3/4] w-full flex justify-between mb-0 mt-2">
                            <View style={styles.buttonContainer}>
                                {/* Add an empty view to push the button to the bottom */}
                            </View>
                            <View className="absolute bottom-0 left-0 p-4 py-5 flex-row">
                                <TouchableOpacity onPress={debounce(pickImage, 500)}>
                                    <Animatable.View animation="fadeIn" duration={500}>
                                        <MaterialIcons name="photo-library" color={Colors.whiteColor} size={42} />
                                    </Animatable.View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={debounce(takePic, 500)}>
                                    <Animatable.View animation="bounceIn" duration={500}>
                                        <Text className="bg-white rounded-full pr-0.5 pt-0.5 pl-0.5 pb-0.5 ml-[120px]">
                                            <MaterialIcons name="circle" color={Colors.blackColor} size={42} />
                                        </Text>
                                    </Animatable.View>
                                </TouchableOpacity>
                            </View>
                        </Camera> :
                        <TouchableOpacity></TouchableOpacity>
                }



                {photo && (
                    <View>
                        <Image resizeMode="contain" style={styles.preview} source={{ uri: `data:image/jpg;base64,${photo.base64}` }} />

                        {hasMediaLibraryPermission && <Button title="Save" onPress={debounce(savePhoto, 500)} />}
                        <Button title="Discard" onPress={debounce(() => setPhoto(undefined), 500)} />
                    </View>
                )}
                {/* ///////////////////////////////////////////////////////////////////////////////////////////////////////////// */}


                {/* {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />} */}

                <FlatList
                    data={newItemPhotosList}
                    keyExtractor={(item) => `${item.id}`}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: Sizes.fixPadding * 2.0, }}

                />
            </View>
        )
    }

    function header() {
        return (
            <View style={styles.headerWrapStyle}>
                <MaterialIcons
                    name="arrow-back-ios"
                    color={Colors.whiteColor}
                    size={22}
                    onPress={debounce(() => navigation.pop(), 500)}
                />
                <Text style={{ marginLeft: Sizes.fixPadding - 5.0, flex: 1, ...Fonts.whiteColor18SemiBold }}>
                    Create Your Own Ad
                </Text>
            </View>
        )
    }

}


const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 2.0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        borderBottomLeftRadius: Sizes.fixPadding + 5.0,
        borderBottomRightRadius: Sizes.fixPadding + 5.0,
    },
    itemPhotosTitleWrapStyle: {
        marginTop: Sizes.fixPadding * 2.0,
        marginBottom: Sizes.fixPadding,
        marginHorizontal: Sizes.fixPadding * 2.0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    addPhotoIconWrapStyle: {
        width: 80.0,
        height: 80.0,
        borderRadius: Sizes.fixPadding - 5.0,
        backgroundColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textFieldWrapStyle: {
        ...Fonts.blackColor16SemiBold,
        backgroundColor: Colors.whiteColor,
        borderRadius: Sizes.fixPadding - 5.0,
        padding: Sizes.fixPadding,
        borderColor: '#ececec',
        borderWidth: 1.0,
        elevation: 2.0,
    },
    nextButtonStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        paddingVertical: Sizes.fixPadding + 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        elevation: 5.0,
        shadowColor: Colors.primaryColor,
        marginHorizontal: Sizes.fixPadding * 2.0,
        marginBottom: Sizes.fixPadding * 2.0,
        borderColor: 'rgba(75, 44, 32, 0.5)',
        borderWidth: 1.0,
    },
    buttonContainer: {
        backgroundColor: "#fff",
        alignSelf: "flex-end"
    },
    preview: {
        alignSelf: "stretch",
        flex: 1
    }
});

export default AdDetailScreen;