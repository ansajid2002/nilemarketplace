import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Image,
    ScrollView,
    TextInput,
    Button,
    ActivityIndicator,
} from 'react-native';
import { AdminUrl, HeaderBar } from '../../constant';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Video } from 'expo-av';
import { useSelector } from 'react-redux';

const AddRaiseTicket = ({ navigation }) => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loader, setLoader] = useState(false);
    const [description, setDescription] = useState('');
    const { customerData } = useSelector((store) => store.userData)

    const customer_id = customerData?.[0].customer_id

    const handleImageSelection = async () => {
        const maxImageCount = 8;
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

    const handleVideoSelection = async () => {
        const maxVideoCount = 1;
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            // Set the selected video
            setSelectedVideo(result.uri);
        }
    };

    const handleSubmission = async () => {
        try {
            setLoader(true)
            if (selectedImages?.length === 0 || !selectedVideo) return alert("Select Image and Video...");
            if (description?.trim() === '') return alert("Add Some Additional Description...");

            // Prepare the FormData for sending files
            const formData = new FormData();

            // Append each selected image
            // selectedImages.forEach((image, index) => {
            //     formData.append(`image_${index}`, {
            //         uri: image,
            //         type: 'image/jpeg',
            //         name: `image_${index}.jpg`,
            //     });
            // });

            if (selectedImages.length > 0) {
                selectedImages.forEach((imageFile, index) => {
                    formData.append(`image`, {
                        uri: imageFile,
                        type: 'image/jpeg',
                        name: 'image.jpeg'
                    });
                });
            }
            // Append the selected video
            if (selectedVideo) {
                formData.append('video', {
                    uri: selectedVideo,
                    type: 'video/mp4',
                    name: 'video.mp4',
                });
            }

            formData.append("customer_id", customer_id);

            // Append the description
            formData.append('additionalText', description);

            // Make a POST request to the backend endpoint
            const response = await fetch(`${AdminUrl}/api/Customer_claims`, {
                method: 'POST',
                body: formData,
                headers: {
                    // Add any additional headers if needed
                    'Content-Type': 'multipart/form-data',
                    // Include any authentication headers if required
                },
            });

            // Check if the request was successful (status code 2xx)
            if (response.ok) {
                // Handle success (e.g., show a success message)
                console.log('Data submitted successfully!');
                navigation.navigate("RaiseTicket")
            } else {
                // Handle errors (e.g., show an error message)
                console.log('Failed to submit data:', response.status, response.statusText);
            }
        } catch (error) {
            // Handle general errors
            console.error('Error submitting data:', error.message || error);
        } finally {
            setLoader(false)
        }
    };


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <HeaderBar
                goback={true}
                navigation={navigation}
                title={'Raise a Ticket'}
                searchEnable={false}
            />

            <ScrollView style={{ padding: 16 }}>
                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={handleImageSelection}>
                        <Text className="p-3 " style={{ borderWidth: 1, borderColor: 'blue', color: 'blue', borderRadius: 5 }}>Select Images (Up to 8)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleVideoSelection}>
                        <Text className="p-3 " style={{ borderWidth: 1, borderColor: 'blue', color: 'blue', borderRadius: 5 }}>Select Video (Only 1)</Text>

                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedImages.map((image, index) => (
                        <View key={index} style={{ padding: 8 }}>
                            <Image
                                source={{ uri: image }}
                                style={{ width: 100, height: 100 }}
                            />
                        </View>
                    ))}
                </View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedVideo && (
                        <View style={{ marginTop: 16, padding: 8 }}>
                            <Video
                                source={{ uri: selectedVideo }}
                                rate={1.0}
                                volume={1.0}
                                isMuted={false}
                                resizeMode="cover"
                                shouldPlay
                                isLooping
                                style={{ width: 100, height: 100 }}
                            />
                        </View>
                    )}
                </View>

                <View style={{ marginTop: 30 }}>
                    <TextInput
                        placeholder="Enter Description"
                        multiline
                        numberOfLines={4}
                        value={description}
                        onChangeText={(text) => setDescription(text)}
                        style={{
                            borderWidth: 1,
                            borderColor: '#313131',
                            borderRadius: 8,
                            padding: 10,
                            color: '#010101',
                            textAlignVertical: 'top', // Align text to the top vertically
                            minHeight: 120, // Set a minimum height to ensure four rows are visible
                        }}
                    />
                </View>


                {
                    loader ? <ActivityIndicator color={'black'} className="mt-10" /> : <View className="mt-10">
                        <Button title="Submit" onPress={handleSubmission} />
                    </View>
                }
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddRaiseTicket;
