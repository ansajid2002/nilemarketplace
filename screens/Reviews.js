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
import { debounce } from "lodash";
import { SafeAreaView } from 'react-native';
import defaultImage from "../assets/images/dummy-profile-pic.png"

const Reviews = ({ navigation, route }) => {
    const { product_name, product_image } = route.params.item;
    const { selectedRating, data, item } = route.params;
    const { id } = data
    const { customerData } = useSelector((store) => store.userData)
    const reviewItems = route.params.data

    const reviewData = reviewItems.find((rdata, i) => Number(rdata.product_uniqueid) == item.product_uniqueid)
    // console.log(reviewItems.find((rdata, i) => Number(rdata.product_uniqueid) == item.product_uniqueid),"truefalse",item.product_uniqueid,data,item);
    const [reviewText, setReviewText] = useState(reviewData?.review_text || "");
    const isReviewEmpty = reviewText?.trim() === '';
    const [formDataArray, setformDataArray] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [loader, setLoader] = useState(false);
    const [showSellerReview, setShowSellerReview] = useState(false)
    const [vendorInfo, setVendorInfo] = useState(null)
    console.log('id');
    console.log(reviewData.id);
    console.log('id');
    //////////////--------------------------------- SELLER REVIEW ------------------------------///////////////////////////
    const [sellerreviewItems, setsellerReviewItems] = useState(null)
    const [sellerreviewText, setsellerReviewText] = useState(sellerreviewItems?.review_text || "");
    const issellerReviewEmpty = sellerreviewText?.trim() === '';
    const [sellerformDataArray, setsellerformDataArray] = useState([]);
    const [sellerselectedImages, setsellerSelectedImages] = useState([]);
    const [sellerselectedRating, setSellerselectedRating] = useState(0)

    //////////////--------------------------------- SELLER REVIEW ------------------------------///////////////////////////


    const dispatch = useDispatch()

    const customer_id = customerData?.[0].customer_id

    useEffect(() => {
        const loadImagesToSelectedImages = () => {
            // console.log(reviewData?.id, 'in image');
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
                    formData.append('rate_id', reviewData.id);
                    return formData;
                });
                console.log(formDataArray, 'form data');
                setformDataArray(formDataArray);
                setLoader(false)
            }
        };

        loadImagesToSelectedImages()
    }, [reviewItems])

    const fetchsellerRatings = async () => {
        console.log("FETCHING__________________________________________________________", customer_id, reviewData.vendor_id);
        try {
            const response = await fetch(`${AdminUrl}/api/fetchRatings?customer_id=${customer_id}&vendorid=${reviewData.vendor_id}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data.ratingsData, "data new api called*****************************************************************************");
                setsellerReviewItems(data?.ratingsData?.[0])
                setSellerselectedRating(data?.ratingsData[0].rating)
                setsellerReviewText(data?.ratingsData[0].reviewText)
                // setReviewItems(data.ratingsData)
            } else {
                console.error('Failed to fetch ratings:', response.status);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        } finally {
            //   setLoading(false)
        }
    };

    const fetchVendordata = async () => {
        console.log("fetching vendors data --------------------------------------------", reviewData.vendor_id);

        try {
            setLoader(true)
            const data = {
                vendorid: reviewData.vendor_id
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
            setLoader(false)

        }
    }

    useEffect(() => {
        if (!vendorInfo && reviewItems && showSellerReview) {
            fetchVendordata()
            fetchsellerRatings()
        }
    }, [vendorInfo, showSellerReview, sellerreviewItems])

    ////////////////////////////////product review update///////////////////////////////////////////////////////////////////// 
    const handleSkip = () => {
        // Handle the skip action
        // You can navigate or perform any other action here
    };

    // console.log(reviewData.id, 'reviewData.id');
    const handleSubmit = async () => {

        try {
            setLoader(true)
            // Prepare the data to send to the server
            const data = {
                reviewText: showSellerReview ? sellerreviewText : reviewText,
                id: reviewData?.id,
                customer_id,
                vendor_id: reviewData?.vendor_id || null
                // Add any other data you want to send to the server
            };

            console.log(data, 'data asasa');

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
                body: JSON.stringify({ id: reviewData?.id }),
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
                        console.log(imageResponse.ok, "imageresponse");
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
                formData.append('rate_id', reviewData.id);
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

    const removeImage = (index) => {
        const updatedImages = [...selectedImages];
        updatedImages.splice(index, 1);

        const updatedFormDataArray = [...formDataArray];
        updatedFormDataArray.splice(index, 1);

        setSelectedImages(updatedImages);
        setformDataArray(updatedFormDataArray);
    };

    ////////////////////////////////seller review update///////////////////////////////////////////////////////////////////// 
    const handlesellerSkip = () => {
        // Handle the skip action
        // You can navigate or perform any other action here
    };


    const handleSellerSubmit = async () => {

        try {
            setLoader(true)
            // Prepare the data to send to the server
            const data = {
                reviewText: reviewText,
                id: reviewData?.id,
                customer_id,
                // Add any other data you want to send to the server
            };

            // console.log(data, review_id, 'data asasa');

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
                body: JSON.stringify({ id: reviewData?.id }),
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
                        console.log(imageResponse.ok, "imageresponse");
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

    const uploadsellerImage = async (mode) => {
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
                        maxSelections: 5 - sellerselectedImages.length, // Adjust max allowed images
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
                formData.append('rate_id', reviewData.id);
                formDataArrays.push(formData);
                selectedImagesData.push(image);
            }

            // Append new data to formDataArray without copying the previous data
            setformDataArray((prevData) => prevData.concat(formDataArrays));

            // Append new data to selectedImages without copying the previous data
            setsellerSelectedImages((prevImages) => prevImages.concat(selectedImagesData));
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const removesellerImage = (index) => {
        const updatedImages = [...sellerselectedImages];
        updatedImages.splice(index, 1);

        const updatedFormDataArray = [...formDataArray];
        updatedFormDataArray.splice(index, 1);

        setsellerSelectedImages(updatedImages);
        setformDataArray(updatedFormDataArray);
    };


    let imageUrl // Default to the placeholder image URL
    if (vendorInfo?.vendor_profile_picture_url?.images[0]) {
        // If brand logo image exists, use its URL
        imageUrl = `${AdminUrl}/uploads/vendorProfile/${vendorInfo?.vendor_profile_picture_url?.images[0]}`;
    }

    const handleSellerInfo = () => {

        setShowSellerReview(true)
    }

    console.log(sellerreviewItems, 'sellerreviewItems');

    return (
        <SafeAreaView className="flex-1" >

            <HeaderBar title={showSellerReview ? "Review Seller" : "Review Product"} goback={true} navigation={navigation} />
            {
                loader ? <FullPageLoader /> :
                    <>
                        <View className="flex-row items-center bg-white ">
                            <TouchableOpacity className={`flex-1 py-2 ${!showSellerReview && "bg-gray-200"} border border-gray-300 rounded-md m-2`} onPress={() => setShowSellerReview(false)} ><Text className={`text-center text-base  `}>Review Product</Text></TouchableOpacity>
                            <TouchableOpacity className={`flex-1 py-2 ${showSellerReview && "bg-gray-200"} border  border-gray-300 rounded-md m-2`} onPress={() => handleSellerInfo()}><Text className={`text-center text-base  `}>Review Seller</Text></TouchableOpacity>
                        </View>
                        {
                            showSellerReview ?
                                <View className="flex-1 bg-white">
                                    <View className="">
                                        <View className="flex-row p-2 ml-2 bg-white  border-gray-200">
                                            <Image
                                                resizeMode='contain'
                                                source={{ uri: imageUrl }} // Set the image source from your data
                                                style={{ width: 40, height: 40, borderRadius: 8 }}
                                                defaultSource={defaultImage}
                                            />
                                            <View className="ml-4">
                                                <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">
                                                    {vendorInfo?.brand_name}
                                                </Text>
                                                {
                                                    sellerreviewItems && <StarRating enable={true} reviewButton={false} size="lg" rating={sellerreviewItems?.rating} onRatingChange={() => { }} item={{ label: null, product_uniqueid: "vendor", customer_id, vendor_id: reviewData.vendor_id }} />
                                                }
                                            </View>
                                        </View>
                                        {

                                            <View className="p-2 bg-white border border-t-2 border-b-0 border-l-0 border-r-0 border-gray-200 h-[80vh]">
                                                {/* Add the "Photo or Video" button */}
                                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'rgba(0,0,0,0.9)', marginBottom: 10, marginTop: 10 }} numberOfLines={1} ellipsizeMode="tail">
                                                    Add Photo or Video
                                                </Text>
                                                <View className="flex-row">
                                                    <TouchableOpacity
                                                        onPress={debounce(() => {
                                                            if (sellerselectedImages.length < 5) {
                                                                console.log("CLICKEEED2")
                                                                uploadsellerImage('gallery');
                                                            }
                                                        }, 500)}
                                                        disabled={sellerselectedImages.length >= 5}

                                                    >
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }} className="border p-2 rounded-md border-gray-300">
                                                            <AntDesign name="camerao" size={24} color={sellerselectedImages.length >= 5 ? 'gray' : 'blue'} />
                                                            <Text style={{ color: sellerselectedImages.length >= 5 ? 'gray' : 'blue', marginLeft: 8 }}>From Gallary</Text>
                                                        </View>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={debounce(() => {
                                                            if (sellerselectedImages.length < 5) {
                                                                uploadsellerImage();
                                                            }
                                                        }, 500)}
                                                        disabled={sellerselectedImages.length >= 5}
                                                    >
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }} className="border p-2 rounded-md border-gray-300 ml-2">
                                                            <MaterialCommunityIcons name="video" size={24} color={sellerselectedImages.length >= 5 ? 'gray' : 'blue'} />
                                                            <Text style={{ color: sellerselectedImages.length >= 5 ? 'gray' : 'blue', marginLeft: 8 }}>From Camera</Text>
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
                                                    value={sellerreviewText || ''}
                                                    onChangeText={(text) => setsellerReviewText(text)}
                                                />

                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                    {sellerselectedImages && sellerselectedImages.map((image, index) => (
                                                        <View key={index} style={{ margin: 4 }}>
                                                            <Image
                                                                resizeMode='contain'
                                                                source={{ uri: image.uri }}
                                                                style={{ width: 100, height: 100 }}
                                                            />
                                                            <TouchableOpacity
                                                                onPress={debounce(() => removesellerImage(index), 500)}
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
                                        }
                                    </View>

                                </View>
                                :
                                <View className="flex-1 bg-white">
                                    <View className="flex-row p-2 ml-2   border-gray-200">
                                        <Image
                                            resizeMode='contain'
                                            source={{ uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${product_image}` }} // Set the image source from your data
                                            style={{ width: 40, height: 40, borderRadius: 8 }}
                                        />
                                        <View className="ml-4">
                                            <Text style={{ fontSize: 16 }} numberOfLines={1} ellipsizeMode="tail">
                                                {product_name}
                                            </Text>
                                            <StarRating enable={true} reviewButton={false} size="lg" rating={selectedRating} onRatingChange={() => { }} item={route.params.item} />
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
                                                        console.log("CLICKEEED2")
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
                        }
                        <View className="" style={{ justifyContent: 'flex-end', alignItems: 'flex-end', marginRight: 16, marginBottom: 16 }}>
                            {isReviewEmpty ? (
                                <TouchableOpacity onPress={debounce(handleSkip, 500)}>
                                    <Text style={{ color: 'blue', marginTop: 8 }}>Skip</Text>
                                </TouchableOpacity>
                            ) : (
                                <Button title="Submit" onPress={debounce(handleSubmit, 500)} />
                            )}
                        </View>

                    </>
            }
        </SafeAreaView>

    );
};

export default Reviews;
