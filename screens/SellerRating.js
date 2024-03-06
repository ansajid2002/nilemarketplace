import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Text } from 'react-native'
import defaultImage from "../assets/images/dummy-profile-pic.png"
import { View } from 'react-native'
import { AdminUrl } from '../constant'
import { Ionicons } from '@expo/vector-icons';
import StarRating from '../components/FiveStarRating'
import { useSelector } from 'react-redux'
import * as ImagePicker from 'expo-image-picker';
import { TouchableOpacity } from 'react-native'
import { debounce } from 'lodash'
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native';
import { Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAvoidingView } from 'react-native'

const SellerRating = ({ vendor_id }) => {
    const navigation = useNavigation()
    const [loader, setLoader] = useState(false)
    const [ButtonLoading, setButtonLoading] = useState(false)
    const [vendorInfo, setVendorInfo] = useState(null)
    const [sellerRatingInfo, setSellerRating] = useState(null)
    const [formDataArray, setformDataArray] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [reviewText, setReviewText] = useState(sellerRatingInfo?.review_text || "");
    const isReviewEmpty = reviewText?.trim() === '';

    const { customerData } = useSelector((store) => store.userData)
    const customer_id = customerData?.[0]?.customer_id || null

    // console.log(vendor_id, 'ratin');
    useEffect(() => {
        const fetchVendordata = async () => {
            if (!vendor_id) return
            try {
                setLoader(true)
                const data = {
                    vendorid: vendor_id
                }

                const vendorResponse = await fetch(`${AdminUrl}/api/vendorProfile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // You may need to include authentication headers if required
                    },
                    body: JSON.stringify(data),
                });

                if (!vendorResponse.ok) {
                    throw new Error('Review request failed with status: ' + vendorResponse.status);
                }

                const vendorData = await vendorResponse.json();
                console.log(vendorData, "VENDORDATA");
                setVendorInfo(vendorData)
            } catch (error) {
                console.error('Error in sending vendor review data s:', error);
                // Handle any network or other errors for the review request
            } finally {
                setTimeout(() => {
                    setLoader(false)
                }, 500);
            }
        }

        const fetchsellerRatings = async () => {
            if (!customer_id) return
            try {
                const response = await fetch(`${AdminUrl}/api/fetchRatings?customer_id=${customer_id}&vendorid=${vendor_id}`);
                if (response.ok) {
                    const data = await response.json();
                    setSellerRating(data?.ratingsData?.[0] || null)
                    setReviewText(data?.ratingsData?.[0]?.review_text || '')
                } else {
                    console.error('Failed to fetch ratings:', response.status);
                }
            } catch (error) {
                console.error('Error fetching ratings:', error);
            } finally {
                setTimeout(() => {
                    setLoader(false)
                }, 500);
            }
        };

        if (!vendorInfo) {
            fetchVendordata()
        }

        if (!sellerRatingInfo) {
            fetchsellerRatings()
        }
    }, [vendor_id, sellerRatingInfo, vendorInfo])

    let imageUrl // Default to the placeholder image URL
    if (vendorInfo?.vendor_profile_picture_url?.images[0]) {
        // If brand logo image exists, use its URL
        imageUrl = `${AdminUrl}/uploads/vendorProfile/${vendorInfo?.vendor_profile_picture_url?.images[0]}`;
    }

    useEffect(() => {
        const loadImagesToSelectedImages = () => {
            // console.log(reviewData?.id, 'in image');
            if (sellerRatingInfo && sellerRatingInfo?.medias && Array.isArray(sellerRatingInfo?.medias)) {
                setLoader(true)

                const images = sellerRatingInfo.medias.map((media) => {
                    return { uri: `${AdminUrl}/uploads/ReviewImages/${media}` };
                });
                setSelectedImages(images);
                // Create formDataArray from selectedImages
                const formDataArray = images.map((image) => {
                    const formData = new FormData();
                    formData.append('pictures', {
                        uri: image.uri,
                        type: 'image/jpeg', // Adjust the type based on the image type
                        name: 'image.jpg', // Adjust the name as needed
                    });
                    formData.append('customer_id', customer_id);
                    formData.append('rate_id', sellerRatingInfo.id);
                    return formData;
                });
                console.log(formDataArray, 'form data');
                setformDataArray(formDataArray);
                setLoader(false)
            }
        };

        loadImagesToSelectedImages()
    }, [sellerRatingInfo])
    console.log(sellerRatingInfo, 'sellerRatingInfo');

    const removeImage = (index) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(index, 1);

        const updatedFormDataArray = [...formDataArray];
        updatedFormDataArray.splice(index, 1);

        setSelectedImages(updatedImages);
        setformDataArray(updatedFormDataArray);
    };

    const uploadImage = async (mode) => {
        try {
            let results = [];
            let permissionsGranted = false;
            if (mode === 'gallery') {
                const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                permissionsGranted = mediaLibraryPermission.status === 'granted';

                if (permissionsGranted) {
                    results = await ImagePicker.launchImageLibraryAsync({
                        allowsMultipleSelection: true,
                        aspect: [1, 1],
                        quality: 0.6,
                        maxSelections: 5 - selectedImages.length, // Adjust max allowed images
                    });
                }
            } else {
                const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                permissionsGranted = cameraPermission.status === 'granted';

                if (permissionsGranted) {
                    results = await ImagePicker.launchCameraAsync({
                        aspect: [1, 1],
                        quality: 0.6,
                    });
                }
            }

            if (!permissionsGranted) {
                throw new Error('Permissions not granted');
            }

            if (results.canceled) {
                return;
            }

            const formDataArrays = [];
            const selectedImagesData = [];

            for (const image of results.assets) {
                console.log(image.fileSize / (100 * 1024));

                const formData = new FormData();
                formData.append('pictures', {
                    uri: image.uri,
                    type: 'image/jpeg', // Adjust the type based on the image type
                    name: 'image.jpg', // Adjust the name as needed
                });
                formData.append('customer_id', customer_id);
                formData.append('rate_id', sellerRatingInfo.id);
                formData.append('vendor_id', sellerRatingInfo?.vendor_id || null)
                formDataArrays.push(formData);
                selectedImagesData.push(image);
            }

            // Append new data to formDataArray without copying the previous data
            setformDataArray((prevData) => prevData.concat(formDataArrays));

            // Append new data to selectedImages without copying the previous data
            setSelectedImages((prevImages) => prevImages.concat(selectedImagesData));
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleSubmit = async () => {
        setButtonLoading(true)
        try {
            const data = {
                reviewText: reviewText,
                id: sellerRatingInfo?.id,
                customer_id,
                vendor_id: sellerRatingInfo?.vendor_id || null
                // Add any other data you want to send to the server
            };

            console.log(sellerRatingInfo);
            const reviewResponse = await fetch(`${AdminUrl}/api/addReview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!reviewResponse.ok) {
                throw new Error('Review request failed with status: ' + reviewResponse.status);
            }

            try {
                const emptyMediasResponse = await fetch(`${AdminUrl}/api/emptyReviewMedia`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // You may need to include authentication headers if required
                    },
                    body: JSON.stringify({ id: sellerRatingInfo?.id }),
                });

                if (emptyMediasResponse.ok) {
                    // Emptying the medias column was successful
                    for (const formData of formDataArray) {
                        console.log('formData');
                        console.log(formData);
                        console.log("formData");
                        try {
                            const imageResponse = await fetch(`${AdminUrl}/api/uploadReviewMedia`, {
                                method: 'POST',
                                body: formData,
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });

                            if (imageResponse.ok) {
                                const imageData = await imageResponse.json();
                                setLoader(false)

                            } else {
                                throw new Error('Image upload failed');
                            }
                        } catch (error) {
                            console.error('Error in sending images:', error);
                            // Handle any network or other errors for the image requests
                        }
                    }
                    navigation.navigate('My Orders')
                } else {
                    throw new Error('Emptying medias failed');
                }
            } catch (error) {
                console.error('Error in emptying medias:', error);
                // Handle any network or other errors for the initial request
            }
        } catch (error) {
            console.log(error);
        } finally {
            setButtonLoading(false)
        }
    }

    const handleSkip = () => {
        // Handle the skip action
        // You can navigate or perform any other action here
        navigation.navigate('My Orders')
    };

    return (
        loader ? (
            <View className="p-2 flex-row gap-2">
                <View style={{ borderRadius: 50, width: 50, height: 50, backgroundColor: '#ddd' }} ></View>
                <View className="flex-col gap-2 w-full">
                    <View className="w-full" style={{ borderRadius: 50, height: 12, backgroundColor: '#ddd' }} ></View>
                    <View className="w-1/2" style={{ borderRadius: 50, height: 12, backgroundColor: '#ddd' }} ></View>
                </View>
            </View>
        ) : (
            <>
                <View className="flex-row items-center p-2 gap-2" style={{ padding: 2, marginLeft: 2, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: 'gray' }}>
                    <Image
                        resizeMode='contain'
                        source={{ uri: imageUrl }} // Set the image source from your data; use defaultImage if imageUrl is falsy
                        style={{ width: 40, height: 40, borderRadius: 8 }}
                        defaultSource={defaultImage}
                    />
                    <View style={{ marginLeft: 0 }}>
                        <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">
                            {vendorInfo?.brand_name}
                        </Text>
                        <StarRating enable={true} reviewButton={false} size="lg" rating={sellerRatingInfo?.rating || 0} onRatingChange={() => { }} item={{ vendor_id, customer_id, product_uniqueid: 'vendor', label: null }} />

                        {/* Add your StarRating component here */}
                    </View>

                </View>
                <View className="p-2 border border-t-2 border-b-0 border-l-0 border-r-0 border-gray-200 h-[80vh]">
                    <View className="flex-1">
                        {/* Add the "Photo or Video" button */}
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'rgba(0,0,0,0.9)', marginBottom: 10, marginTop: 10 }} numberOfLines={1} ellipsizeMode="tail">
                            Add Photo or Video
                        </Text>
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={debounce(() => {
                                    if (selectedImages.length < 5) {
                                        uploadImage('gallery');
                                    }
                                }, 500)}
                                disabled={selectedImages.length >= 5}

                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }} className="border p-2 rounded-md border-gray-300">
                                    <AntDesign name="camerao" size={24} color={selectedImages.length >= 5 ? 'gray' : 'blue'} />
                                    <Text style={{ color: selectedImages.length >= 5 ? 'gray' : 'blue', marginLeft: 8 }}>From Gallary</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={debounce(() => {
                                    if (selectedImages.length < 5) {
                                        uploadImage();
                                    }
                                }, 500)}
                                disabled={selectedImages.length >= 5}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }} className="border p-2 rounded-md border-gray-300 ml-2">
                                    <MaterialCommunityIcons name="video" size={24} color={selectedImages.length >= 5 ? 'gray' : 'blue'} />
                                    <Text style={{ color: selectedImages.length >= 5 ? 'gray' : 'blue', marginLeft: 8 }}>From Camera</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <Text className="py-2 tracking-wider leading-5 mt-4">Upload photos/videos related to the product like Unboxing, Installation, Product Usage, etc.</Text>

                        {/* Add the input area for writing a review */}
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: 'gray',
                                marginTop: 8,
                                padding: 10, // Add padding for better aesthetics
                                minHeight: 100, // Set a minimum height to display 4 lines of text
                                textAlignVertical: 'top', // Start text from the first line
                            }}
                            multiline={true}
                            numberOfLines={4}
                            placeholder="Write a review..."
                            value={reviewText || ''}
                            onChangeText={(text) => setReviewText(text)}
                        />

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {selectedImages && selectedImages.map((image, index) => (
                                <View key={index} style={{ margin: 4 }}>
                                    <Image
                                        resizeMode='contain'
                                        source={{ uri: image.uri }}
                                        style={{ width: 100, height: 100 }}
                                    />
                                    <TouchableOpacity
                                        onPress={debounce(() => removeImage(index), 500)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            backgroundColor: 'red',
                                            padding: 5,
                                            borderRadius: 50,
                                        }}
                                    >
                                        <Ionicons name="md-close" size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        {/* Your other UI components */}

                        <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 16, marginBottom: 16 }}>
                            {isReviewEmpty ? (
                                <TouchableOpacity onPress={debounce(handleSkip, 500)}>
                                    <Text style={{ color: 'blue', marginTop: 8 }}>Skip</Text>
                                </TouchableOpacity>
                            ) : (
                                <Button title="Submit" onPress={debounce(handleSubmit, 500)} />
                            )}
                        </View>
                    </KeyboardAvoidingView>

                </View>
            </>
        )
    )

}

export default SellerRating