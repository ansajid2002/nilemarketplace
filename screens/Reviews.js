import { View, Text, ScrollView, Image, Alert } from 'react-native';
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
import { updateReviewlistener } from '../store/slices/reviewSlice';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import FullPageLoader from '../components/FullPageLoader';

const Reviews = ({ navigation, route }) => {
    const { product_uniqueid, product_name, product_image } = route.params.item;
    const { selectedRating, data } = route.params;
    const { id, review_text } = data
    const { customerData } = useSelector((store) => store.userData)
    const { reviewItems } = useSelector((store) => store.reviews)

    const reviewData = reviewItems.find((item, i) => item.id == id)
    const [reviewText, setReviewText] = useState(reviewData?.review_text || "");
    const isReviewEmpty = reviewText.trim() === '';
    const [formDataArray, setformDataArray] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [loader, setLoader] = useState(false);

    const dispatch = useDispatch()

    const customer_id = customerData?.[0].customer_id

    useEffect(() => {
        const loadImagesToSelectedImages = () => {

            if (reviewData?.medias && Array.isArray(reviewData.medias)) {
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
                    formData.append('rate_id', id);
                    return formData;
                });
                setformDataArray(formDataArray);
                setLoader(false)
            }
        };


        loadImagesToSelectedImages()
    }, [reviewData, reviewItems])

    const handleSkip = () => {
        // Handle the skip action
        // You can navigate or perform any other action here
    };

    const handleSubmit = async () => {
        try {
            setLoader(true)
            // Prepare the data to send to the server
            const data = {
                reviewText: reviewText,
                id,
                customer_id,
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

            const reviewData = await reviewResponse.json();
            dispatch(updateReviewlistener(reviewData?.rating));
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
                body: JSON.stringify({ id }),
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


    };


    const uploadImage = async (mode) => {
        try {
            const maxAllowedImages = 5 - selectedImages.length;
            let results = [];

            if (mode === 'gallery') {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
                results = await ImagePicker.launchImageLibraryAsync({
                    allowsMultipleSelection: true,
                    aspect: [1, 1],
                    quality: 1,
                    maxSelections: maxAllowedImages,
                });
            } else {
                await ImagePicker.requestCameraPermissionsAsync();
                results = await ImagePicker.launchCameraAsync({
                    aspect: [1, 1],
                    quality: 1,
                });
            }

            if (results.cancelled) {
                setUploadStatus({ success: false, message: 'No images selected or cancelled' });
                return;
            }

            const formDataArrays = [];
            const selectedImagesData = [];

            for (const image of results.assets) {
                if (image.fileSize > 100 * 1024) {
                    // Skip images larger than 100KB
                    continue;
                }

                const formData = new FormData();
                formData.append('pictures', {
                    uri: image.uri,
                    type: 'image/jpeg', // Adjust the type based on the image type
                    name: 'image.jpg', // Adjust the name as needed
                });
                formData.append('customer_id', customer_id);
                formData.append('rate_id', id);
                formDataArrays.push(formData);
                selectedImagesData.push(image);

            }

            // Append new data to formDataArray without copying the previous data
            setformDataArray((prevData) => prevData.concat(formDataArrays));

            // Append new data to selectedImages without copying the previous data
            setSelectedImages((prevImages) => prevImages.concat(selectedImagesData));


        } catch (error) {
            setUploadStatus({ success: false, message: error.message });
        }
    };

    const removeImage = (index) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(index, 1);

        const updatedFormDataArray = [...formDataArray];
        updatedFormDataArray.splice(index, 1);

        setSelectedImages(updatedImages);
        setformDataArray(updatedFormDataArray);
    };

    return (
        <>
            <HeaderBar title="Review Product" goback={true} navigation={navigation} />
            {
                loader ? <FullPageLoader /> : <>
                    <View className="flex-row p-2 ml-2 bg-white border border-t-2 border-b-0 border-l-0 border-r-0 border-gray-200">
                        <Image
                            resizeMode='contain'
                            source={{ uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${product_image}` }} // Set the image source from your data
                            style={{ width: 40, height: 40, borderRadius: 8 }}
                        />
                        <View className="ml-4">
                            <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">
                                {product_name}
                            </Text>
                            <StarRating enable={false} reviewButton={false} size="lg" rating={selectedRating} onRatingChange={() => { }} item={route.params.item} />
                        </View>
                    </View>
                    <View className="p-2 bg-white border border-t-2 border-b-0 border-l-0 border-r-0 border-gray-200 h-[80vh]">
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
                                    <Text style={{ color: selectedImages.length >= 5 ? 'gray' : 'blue', marginLeft: 8 }}>Add Photo</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Add Video button with Expo icons */}
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

                        {/* Conditional "Skip" or "Submit" button based on review text */}
                        <View className="flex-1 " style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 16, marginBottom: 16 }}>
                            {isReviewEmpty ? (
                                <TouchableOpacity onPress={debounce(handleSkip, 500)}>
                                    <Text style={{ color: 'blue', marginTop: 8 }}>Skip</Text>
                                </TouchableOpacity>
                            ) : (
                                <Button title="Submit" onPress={debounce(handleSubmit, 500)} />
                            )}
                        </View>

                    </View></>
            }
        </>
    );
};

export default Reviews;
