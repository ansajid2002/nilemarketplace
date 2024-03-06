import { View, Text, Image, KeyboardAvoidingView } from 'react-native';
import React, { useEffect } from 'react';
import { AdminUrl, HeaderBar } from '../constant';
import StarRating from '../components/FiveStarRating';
import { TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
// import { updateReviewlistener } from '../store/slices/reviewSlice';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import FullPageLoader from '../components/FullPageLoader';
import { debounce } from "lodash";
import { SafeAreaView } from 'react-native';
import defaultImage from "../assets/images/dummy-profile-pic.png"
import SellerRating from './SellerRating';
import { useTranslation } from 'react-i18next';
import { productUrl } from '../constant'

const Reviews = ({ navigation, route }) => {
    const { product_name = '', product_image = '', order_id = '' } = route.params.item || [];
    const { selectedRating } = route.params;
    const { customerData } = useSelector((store) => store.userData)
    const rate = route.params?.data?.[0]
    const [reviewData, setreviewData] = useState(null)
    const [reviewText, setReviewText] = useState(reviewData?.review_text || "");
    const { t } = useTranslation()

    console.log(rate?.id);
    const fetchOrderRATING = async () => {
        try {
            if (!rate?.id) return
            const response = await fetch(`${AdminUrl}/api/fetchRatings?rate_id=${rate?.id}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data, "data new api called*****************************************************************************");
                setreviewData(data?.ratingsData?.[0])
                setReviewText(data?.ratingsData?.[0]?.review_text || '')
            } else {
                // console.error('Failed to fetch ratings:', response.status);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            setTimeout(() => {
                setLoader(false)
            }, 500);
        }
    };

    useEffect(() => {
        !reviewData && fetchOrderRATING()
    }, [reviewData, rate])

    const isReviewEmpty = reviewText?.trim() === '';
    const [formDataArray, setformDataArray] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [loader, setLoader] = useState(false);
    const [showSellerReview, setShowSellerReview] = useState(route.params.type === 'seller' ? true : false)
    const [vendorSelleId, setVendorId] = useState(route.params.vendor_id || reviewData?.vendor_id)

    const customer_id = customerData?.[0]?.customer_id || null

    useEffect(() => {
        if (!customer_id) return navigation.navigate('Login')
        if (route.params.vendor_id) {
            setVendorId(route.params.vendor_id)
        } else {
            setVendorId(reviewData?.vendor_id || null)
        }
    }, [route])
    useEffect(() => {
        const loadImagesToSelectedImages = () => {
            if (reviewData && reviewData?.medias && Array.isArray(reviewData?.medias)) {
                setLoader(true)

                const images = reviewData.medias.map((media) => {
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
                    formData.append('rate_id', rate?.id);
                    return formData;
                });
                setformDataArray(formDataArray);
                setLoader(false)
            }
        };

        loadImagesToSelectedImages()
    }, [reviewData])

    ////////////////////////////////product review update///////////////////////////////////////////////////////////////////// 
    const handleSkip = () => {
        // Handle the skip action
        // You can navigate or perform any other action here
        navigation.navigate('My Orders')

    };

    const handleSubmit = async () => {
        console.log(rate);
        try {
            setLoader(true)
            // Prepare the data to send to the server
            const data = {
                reviewText: reviewText,
                id: rate?.id,
                customer_id: customer_id || '',
                // Add any other data you want to send to the server
            };

            // Step 1: Send the review data
            const reviewResponse = await fetch(`${AdminUrl}/api/addReview`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // You may need to include authentication headers if required
                },
                body: JSON.stringify(data),
            });

            if (!reviewResponse.ok) {
                throw new Error('Review request failed with status: ' + reviewResponse.status);
            }

            // const reviewData_Response = await reviewResponse.json();
            // dispatch(updateReviewlistener(reviewData?.rating));
        } catch (error) {
            console.error('Error in sending review data:', error);
            // Handle any network or other errors for the review request
        }

        try {
            const emptyMediasResponse = await fetch(`${AdminUrl}/api/emptyReviewMedia`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // You may need to include authentication headers if required
                },
                body: JSON.stringify({ id: rate?.id }),
            });

            if (emptyMediasResponse.ok) {
                // Emptying the medias column was successful
                for (const formData of formDataArray) {
                    try {
                        const imageResponse = await fetch(`${AdminUrl}/api/uploadReviewMedia`, {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        });

                        if (imageResponse.ok) {
                            await imageResponse.json();
                            setLoader(false)
                        } else {
                            throw new Error('Image upload failed');
                        }
                    } catch (error) {
                        console.error('Error in sending images:', error);
                        // Handle any network or other errors for the image requests
                    }
                }
                navigation.navigate('My Orders', { update: true })
            } else {
                throw new Error('Emptying medias failed');
            }
        } catch (error) {
            console.error('Error in emptying medias:', error);
            // Handle any network or other errors for the initial request
        }
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

                const formData = new FormData();
                formData.append('pictures', {
                    uri: image.uri,
                    type: 'image/jpeg', // Adjust the type based on the image type
                    name: 'image.jpg', // Adjust the name as needed
                });

                formData.append('customer_id', customer_id);
                formData.append('rate_id', 0);
                formData.append('vendor_id', reviewData?.vendor_id || null)
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

    console.log(rate?.id, 'reviewData');
    const removeImage = (index) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(index, 1);

        const updatedFormDataArray = [...formDataArray];
        updatedFormDataArray.splice(index, 1);

        setSelectedImages(updatedImages);
        setformDataArray(updatedFormDataArray);
    };

    const handleSellerInfo = () => {

        setShowSellerReview(true)
    }

    return (
        <SafeAreaView className="flex-1 bg-white" >
            <HeaderBar title={showSellerReview ? "Review Seller" : "Review Product"} goback={true} navigation={navigation} />
            {
                loader ? <FullPageLoader /> :
                    <>
                        {
                            route.params.type !== 'seller' && <View className="flex-row items-center bg-white ">
                                <TouchableOpacity className={`flex-1 py-2 ${!showSellerReview && "bg-gray-200"} border border-gray-300 rounded-md m-2`} onPress={() => {
                                    route.params.type !== 'seller' && setShowSellerReview(false)
                                }} ><Text className={`text-center text-base  `}>Review Product</Text></TouchableOpacity>
                                <TouchableOpacity className={`flex-1 py-2 ${showSellerReview && "bg-gray-200"} border  border-gray-300 rounded-md m-2`} onPress={() => handleSellerInfo()}><Text className={`text-center text-base  `}>Review Seller</Text></TouchableOpacity>
                            </View>
                        }
                        {
                            showSellerReview && vendorSelleId ?
                                <SellerRating order_id={order_id} vendor_id={vendorSelleId} />
                                :
                                <>
                                    <View className="flex-1 bg-white">
                                        <View className="flex-row p-2 ml-2   border-gray-200">
                                            <Image
                                                resizeMode='contain'
                                                source={{ uri: `${productUrl}/${product_image}` }} // Set the image source from your data
                                                style={{ width: 40, height: 40, borderRadius: 8 }}
                                            />
                                            <View className="ml-4">
                                                <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">
                                                    {product_name}
                                                </Text>
                                                <StarRating order_id={order_id} enable={true} reviewButton={false} size="lg" rating={selectedRating} onRatingChange={() => { }} item={route.params.item} />
                                            </View>
                                        </View>
                                        <View className="p-2 border border-t-2 border-b-0 border-l-0 border-r-0 border-gray-200 h-[80vh]">
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

                                    </View>
                                    <KeyboardAvoidingView
                                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                                </>
                        }


                    </>
            }
        </SafeAreaView>

    );
};

export default Reviews;
