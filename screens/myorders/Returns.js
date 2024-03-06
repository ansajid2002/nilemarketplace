import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, TextInput, ActivityIndicator, StatusBar, View, Text, ScrollView, Image, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/styles';
import { AdminUrl, HeaderBar, productUrl } from '../../constant';
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';

import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

const Returns = ({ navigation, route }) => {
    const orderData = route.params
    const { product_image, product_name, orderid, order_id } = orderData
    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth * 0.2;
    const contentWidth = screenWidth * 0.8;
    const [detail, setDetails] = useState('')
    const [laoder, setLoader] = useState(false)
    const [selectedImages, setSelectedImages] = useState([]);

    const reasons = [
        { id: 1, reason: 'Ordered by mistake', photosRequired: false },
        { id: 2, reason: 'Arrived damaged', photosRequired: true },
        { id: 3, reason: 'Don’t like it', photosRequired: false },
        { id: 4, reason: 'Missing parts or pieces', photosRequired: true },
        { id: 5, reason: 'Changed my mind', photosRequired: false },
        { id: 6, reason: 'Item is defective', photosRequired: true },
        { id: 7, reason: 'Received the wrong item', photosRequired: true },
        { id: 8, reason: 'Doesn’t fit', photosRequired: false },
        { id: 9, reason: 'Found a better price', photosRequired: false },
        { id: 10, reason: 'Doesn’t match description or photos', photosRequired: true }
    ];

    const [selectedReason, setSelectedReason] = useState(reasons?.[0]);

    useEffect(() => {
        const fetchReturn = async () => {
            try {
                const response = await fetch(`${AdminUrl}/api/getReturnByOrder_id/${order_id}`);
                if (response.ok) {
                    const returnData = await response.json();
                    if (returnData.length > 0) {
                        const { detail_text, reason_return } = returnData[0];
                        setDetails(detail_text);
                        const data_reason = reasons.filter(item => item.reason === reason_return);
                        setSelectedReason(data_reason[0]);
                    } else {
                        console.log('No return found for this order ID');
                    }
                } else if (response.status === 404) {
                    console.log('No return found for this order ID');
                } else {
                    console.error('Error fetching return data:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching return data:', error);
            }
        };

        if (order_id) {
            fetchReturn();
        }
    }, [order_id]);

    const handleReasonSelect = (reason) => {
        setSelectedReason(reason);
        bottomSheetModalRef.current.dismiss()
    };

    const [containerStyles, setContainerStyles] = useState({});

    // ref
    const bottomSheetModalRef = useRef(null);


    const handleSheetChanges = useCallback((index) => {
        if (index >= 0) {
            setContainerStyles(styles.container);
        } else {
            setContainerStyles({});
        }
    }, []);

    const openBottomSheet = () => {
        bottomSheetModalRef.current?.present();
    }

    const renderBackdrop = useCallback(
        (props) => <BottomSheetBackdrop {...props} />,
        []
    );

    const handleImageSelection = async () => {
        const maxImageCount = 10;
        let results = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
            allowsMultipleSelection: true,
            maxSelected: maxImageCount - selectedImages.length, // Adjust max allowed images
        });

        if (!results.cancelled) {
            // Resize and add new images to the existing selected images
            const newImages = await Promise.all(
                results.assets.map(async (image) => {
                    const resizedImage = await ImageManipulator.manipulateAsync(
                        image.uri,
                        [{ resize: { width: 400 } }],
                        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
                    );
                    return resizedImage.uri;
                })
            );

            setSelectedImages((prevImages) => [...prevImages, ...newImages.slice(0, maxImageCount)]);
        }
    };

    const handleReturn = async () => {
        if (laoder) return

        // Check if photos are required for the selected reason
        if (selectedReason.photosRequired && selectedImages.length === 0) {
            console.log("Please provide photos.");
            Alert.alert("Error", 'Please provide photos.')
            return;
        }

        // Check if details are provided
        if (!detail.trim()) {
            console.log("Please provide details.");
            Alert.alert("Error", 'Please provide details.')

            return;
        }

        // Create a new FormData object
        const formData = new FormData();
        // Append reason to the form data
        formData.append('reason', selectedReason.reason);
        formData.append('order_id', orderData?.order_id);
        // Append details to the form data
        formData.append('details', detail);
        // Append images to the form data
        selectedImages.forEach((image, index) => {
            formData.append(`images`, {
                uri: image,
                type: 'image/jpeg', // Adjust the type if necessary
                name: `image${index + 1}.jpg`
            });
        });

        setLoader(true)

        try {
            // Send data to the backend
            const response = await fetch(`${AdminUrl}/api/updateReturn`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Check if the request was successful
            if (response.ok) {
                const responseData = await response.json();
                // Process the response data
                console.log("Response from backend:", responseData);
                navigation.navigate('My Orders')
            } else {
                console.log("Error:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoader(false)
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <ScrollView >
                <StatusBar barStyle="dark-content" backgroundColor="transparent" />

                <HeaderBar title={'Return Item'} goback={true} navigation={navigation} searchEnable={false} cartEnable={false} />

                <View className="flex-row justify-between h-24 m-4">
                    {/* Flex container for image */}
                    <View style={[{ width: imageWidth }]} className="h-24">
                        <Image className="w-full h-full rounded-md" source={{ uri: `${productUrl}/${product_image}` }} resizeMode="cover" />
                    </View>
                    {/* Flex container for content */}
                    <View style={[{ width: contentWidth }]} className="px-4 py-2 gap-y-2">
                        <Text numberOfLines={2} className="text-base tracking-widest font-semibold text-black">
                            {product_name}
                        </Text>
                        <Text className="text-sm tracking-widest text-black">
                            Order - {orderid}
                        </Text>
                    </View>
                </View>

                <View className="p-4">
                    <View>
                        <Text className="text-xl font-semibold tracking-wide">Why are you returning this item?</Text>
                        <TouchableOpacity onPress={openBottomSheet}>
                            <View className="bg-gray-200 px-4 py-1 my-2 border-2 border-gray-400 rounded-lg">
                                <Text className="tracking-wide text-gray-800">Reason for return</Text>
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-lg font-semibold text-gray-700">{selectedReason?.reason}</Text>
                                    <FontAwesome name="angle-down" size={28} color="black" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View className="mt-4">
                        <Text className="text-xl font-semibold tracking-wide">Add Details</Text>
                        <TextInput
                            multiline={true}
                            numberOfLines={6}
                            placeholder='Give us a little more info'
                            value={detail}
                            style={{
                                backgroundColor: '#E5E7EB',
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                marginTop: 8,
                                borderColor: '#D1D5DB',
                                borderWidth: 2,
                                borderRadius: 8,
                                textAlignVertical: 'top', // This will align the text at the top
                                paddingTop: 16 // This will add padding at the top to push the text downwards
                            }}
                            onChangeText={text => setDetails(text)}
                        />

                    </View>

                </View>

                {selectedReason?.photosRequired && (
                    <View className="p-4">
                        <Text className="text-xl font-semibold tracking-wide">Add up to 10 photos</Text>

                        <TouchableOpacity onPress={handleImageSelection}>
                            <View className="border w-24 h-24 my-4 border-gray-400 border-dashed flex-row justify-center items-center">
                                <AntDesign name="pluscircle" size={36} color={'blue'} />
                            </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {selectedImages.map((image, index) => (
                                <View key={index} style={{ padding: 8 }}>
                                    <Image
                                        source={{ uri: image }}
                                        style={{ width: 50, height: 50 }}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <TouchableOpacity style={{ padding: 16 }} onPress={handleReturn}>
                    <View style={{ backgroundColor: '#D1D5DB', padding: 16, borderRadius: 9999 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4B5563', textAlign: 'center' }}>
                            {
                                laoder ? <ActivityIndicator color='black' /> : 'Confirm return'
                            }
                        </Text>
                    </View>
                </TouchableOpacity>


            </ScrollView>


            <BottomSheetModalProvider>
                <View style={containerStyles}>
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={["90%", "90%", "100%"]}

                        onChange={handleSheetChanges}
                        backdropComponent={renderBackdrop}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="p-4 flex-row justify-between">
                                <Text className="text-xl font-semibold tracking-wide">Reason for return</Text>
                                <Entypo name="circle-with-cross" size={24} color="black" onPress={() => { bottomSheetModalRef.current.dismiss() }} />
                            </View>
                            {reasons.map((reason) => (
                                <TouchableOpacity
                                    key={reason.id}
                                    onPress={() => handleReasonSelect(reason)}
                                    className="px-4 py-3 flex-row justify-between border-b border-gray-200"
                                >
                                    <Text className={`text-lg tracking-wide ${selectedReason?.reason === reason?.reason ? 'text-blue-500 ' : 'text-gray-800'}`}>{reason.reason}</Text>

                                    {selectedReason?.reason === reason?.reason && <AntDesign name="check" size={24} color={'blue'} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </BottomSheetModal>
                </View>
            </BottomSheetModalProvider>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        flex: 1,
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },

})

export default Returns;
