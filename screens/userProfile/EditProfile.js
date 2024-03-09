import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
    Alert,
    Modal, StyleSheet,
    Button,
    Linking,
} from 'react-native';
import Ionic from 'react-native-vector-icons/Ionicons';
import { AdminUrl } from '../../constant';
import { updateCustomerData } from '../../store/slices/customerData';
import { useDispatch } from 'react-redux';
import FullPageLoader from '../../components/FullPageLoader';
import { debounce, isEqual } from 'lodash';
import * as ImagePicker from "expo-image-picker"
import { AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';

const EditProfile = ({ route, navigation }) => {
    const { given_name, family_name, email, bio, phone_number, verified_with, picture, google_id, customer_id } = route.params?.[0];
    const [profileImage, setImage] = useState('../../assets/avatarplaceholder.png');

    const dispatch = useDispatch()
    const { t } = useTranslation()
    // State to manage the user profile
    const [userProfile, setUserProfile] = useState({
        given_name,
        family_name,
        email,
        bio,
        phone_number
    });

    // State to manage the OTP modal visibility
    const [isOTPModalVisible, setOTPModalVisible] = useState(false);

    // State to manage OTP input
    const [otpInput, setOtpInput] = useState('');
    const [loader, setloader] = useState(false);
    const [originalUserProfile, setOriginalUserProfile] = useState({ ...userProfile });
    const [formValueChanged, setFormValueChanged] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalVisibledel, setModalVisibledel] = useState(false);

    const handleDeleteAccount = () => {
        // Perform delete account action
        Linking.openURL('mailto:info@nilegmp.com');
        setModalVisibledel(false);
    };
    const [imageOptions] = useState([
        { label: <AntDesign name="camera" size={24} color="white" />, value: 'camera' },
        { label: <MaterialIcons name="perm-media" size={24} color="white" />, value: 'gallery' },
        // { label: <Feather name="trash" size={24} color="white" />, value: 'remove' },
    ]);

    useEffect(() => {
        if (picture) {
            if (google_id && google_id.trim() !== "" && !picture.startsWith("https")) {
                console.log('in');
                setImage(`${AdminUrl}/uploads/customerProfileImages/${picture}`);
            } else {
                console.log('out');
                setImage(picture);
            }
        } else {
            setImage('../../assets/avatarplaceholder.png');
        }
    }, [picture]);


    console.log(profileImage, 'profileImage');
    useEffect(() => {
        // Compare the current form values with the original values
        const hasFormValueChanged = !isEqual(userProfile, originalUserProfile);

        // Enable or disable the "ProfileSubmit" button accordingly
        setFormValueChanged(hasFormValueChanged);
    }, [userProfile, originalUserProfile]);


    const handleProfileChange = (field, value) => {
        setUserProfile({
            ...userProfile,
            [field]: value,
        });
        // Mark that the form values have changed
        setFormValueChanged(true);
    };

    const handleProfileSubmit = async () => {
        setOtpInput('')
        setloader(true)
        // Check if required fields are empty
        if (!userProfile.given_name || !userProfile.family_name || !userProfile.email || !userProfile.phone_number) {
            setloader(false)
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailPattern.test(userProfile.email)) {
            setloader(false)

            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        try {
            const response = await fetch(`${AdminUrl}/api/AppUserProfileOTP`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userProfile.email,
                    family_name: userProfile.family_name,
                    given_name: userProfile.given_name,
                    customer_id,
                }),
            });

            if (response.ok) {
                // Request was successful
                // Show a success message
                // Open the OTP modal here
                setOTPModalVisible(true);
            } else {
                // Request failed
                // Handle the error based on the response status code
                if (response.status === 400) {
                    // Handle specific error, such as duplicate email
                    Alert.alert('Error', 'Email already registered');
                } else {
                    // Handle other errors
                    throw new Error('Failed to send OTP. Please try again.');
                }
            }
            setloader(false)

        } catch (error) {
            // Handle any exceptions or network errors
            Alert.alert('Error', error.message);
        } finally {
            setloader(false)
        }

    };

    const handleSendRequest = () => {
        Linking.openURL('mailto:info@nilegmp.com');
    };


    const handleOTPVerification = async () => {
        // Check if OTP is a 4-digit number
        if (/^\d{4}$/.test(otpInput)) {
            // OTP is valid, proceed with sending it to the backend

            try {
                const response = await fetch(`${AdminUrl}/api/EditProfileAfterVerification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        otp: otpInput, // Send the OTP to the backend
                        customer_id,
                        userProfile: userProfile, // Send the userProfile data
                    }),
                });

                if (response.ok) {
                    // Request was successful, handle success response
                    // For example, you can show a success message
                    const data = await response.json()
                    dispatch(updateCustomerData(data?.updatedProfile))
                    setOTPModalVisible(false); // Close the OTP modal
                    navigation.goBack()

                } else {
                    // Request failed, handle the error
                    throw new Error('Failed to verify OTP. Please try again.');
                }
            } catch (error) {
                // Handle any exceptions or network errors
                Alert.alert('Error', error.message);
            }
        } else {
            // OTP is not a 4-digit number, show an error message
            Alert.alert('Error', 'Please enter a 4-digit OTP code.');
        }
    };

    const uploadImage = async (mode) => {
        try {
            let result;
            if (mode === "gallery") {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });
            } else {
                await ImagePicker.requestCameraPermissionsAsync();
                result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 1,
                });
            }

            if (!result.canceled) {
                const formData = new FormData();
                formData.append('picture', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg', // Adjust the type based on the image type
                    name: 'image.jpg', // Adjust the name as needed
                });
                formData.append("key", customer_id);

                const response = await fetch(`${AdminUrl}/api/uploadCustomerProfileImage`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.ok) {
                    // Image upload was successful
                    const data = await response.json();
                    setImage(`${AdminUrl}/uploads/customerProfileImages/${data?.picture}`)
                    dispatch(updateCustomerData(data?.updatedRows[0]))
                } else {
                    // Handle upload failure
                    console.error('Image upload failed');
                }
                setModalVisible(false)
            }
        } catch (error) {
            console.log(error);
        }
    };
    const ConfirmationModal = ({ visible, onRequestClose, onConfirm }) => {
        return (
            <Modal
                visible={visible}
                onRequestClose={onRequestClose}
                animationType="slide"
                transparent={true}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to delete your account?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={onConfirm}

                            >
                                <Text style={styles.buttonText}>Send Request</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onRequestClose}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };
    return (
        !loader ?
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

                <ScrollView>
                    <View style={{ flex: 1, backgroundColor: 'white' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Ionic name="close-outline" style={{ fontSize: 35 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{t("Edit Profile")}</Text>
                            <TouchableOpacity
                                onPress={debounce(() => handleProfileSubmit(), 500)}
                                disabled={!formValueChanged}
                            >
                                <Ionic name="checkmark" style={{ fontSize: 35, color: formValueChanged ? '#3493D9' : 'gray' }} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={debounce(() => setModalVisible(true), 500)}>
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Image resizeMode='contain' source={{ uri: profileImage }} style={{ width: 80, height: 80, borderRadius: 100 }} />
                                <Text style={{ color: '#3493D9' }}>{t("Change profile photo")}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={{ padding: 10 }}>
                            <InputField label="First Name *" placeholder="First Name" value={userProfile.given_name} onChangeText={(text) => handleProfileChange('given_name', text)} />
                            <InputField label="Last Name *" placeholder="Last Name" value={userProfile.family_name} onChangeText={(text) => handleProfileChange('family_name', text)} />
                            <InputField label="Bio" placeholder="Bio" value={userProfile.bio} onChangeText={(text) => handleProfileChange('bio', text)} />
                            <InputField label="Email *" placeholder="Email" value={userProfile.email} onChangeText={(text) => handleProfileChange('email', text)} />
                            <InputField label="Mobile Number *" placeholder="Mobile Number with Country Code" value={userProfile.phone_number} onChangeText={(text) => handleProfileChange('phone_number', text)} />
                        </View>


                        <View className="m-2 border border-gray-200 bg-gray-100 p-3 rounded-md">
                            <Text className="text-base text-justify mt-2">If you wish to delete your account and all related data from Nile Global Marketplace (NGMP), please send an email to our administrators at admin@nilegmp.com with the subject line "Account Deletion Request". Please include your account details and the reason for your request in the email.</Text>
                            <Text className="text-base text-justify mt-2">
                                Please note that account deletion is irreversible and will result in the permanent loss of all data associated with your account, including your profile information, posts, and any other data you have shared on NGMP. Once your account is deleted, you will not be able to recover it or access any of your data.
                            </Text>
                            <Text className="text-base text-justify mt-2">
                                We will process your request as soon as possible, but please allow up to [7 days] for the complete deletion of your account and data from our systems.
                            </Text>
                            <Text className="text-base text-justify mt-2">
                                If you have any questions or need further assistance, please feel free to contact us.
                            </Text>
                            <Text className="text-base text-justify mt-2">
                                Thank you, Regards The Nile Global Marketplace Team
                            </Text>
                            <TouchableOpacity className="mt-2"
                                style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}
                                onPress={() => setModalVisibledel(true)}
                            >
                                <Text className="text-center" style={{ color: 'white', fontWeight: 'bold' }}>Delete My Account</Text>
                            </TouchableOpacity>
                            <ConfirmationModal
                                visible={modalVisibledel}
                                onRequestClose={() => setModalVisibledel(false)}
                                onConfirm={handleDeleteAccount}
                            />
                        </View>
                    </View>

                    {/* OTP Modal */}
                    <Modal
                        visible={isOTPModalVisible}
                        transparent={true}
                        animationType="slide">
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                            <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, width: 250 }} >
                                <Text className="font-bold text-xl text-gray-700">{t("Enter OTP")}</Text>
                                <Text className="text-sm text-gray-700 mb-5">{t("A verification code has been sent to your email.")}</Text>
                                <TextInput
                                    placeholder="Enter OTP"
                                    value={otpInput}
                                    onChangeText={(text) => setOtpInput(text)}
                                    style={{ fontSize: 16, borderBottomWidth: 1, borderColor: '#CDCDCD', marginBottom: 10 }}
                                />
                                <View className="flex-row w-1/2">
                                    <TouchableOpacity onPress={debounce(() => setOTPModalVisible(false), 500)} className="flex-row justify-center w-full">
                                        <Text style={{ fontSize: 16, color: '#313131' }}>{t("Cancel")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={debounce(() => handleOTPVerification(), 500)} className="flex-row justify-center w-full">
                                        <Text style={{ fontSize: 16, color: '#3493D9' }}>{t("Verify")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View className="flex-1 justify-center items-center bg-black/40">
                            <View className="space-x-6  bg-white rounded-md flex-row justify-center items-center h-18 p-4">
                                {imageOptions.map((option) => {
                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={debounce(() => {
                                                uploadImage(option.value);
                                            }, 500)}
                                            className='p-2  bg-blue-400 rounded text-white'
                                        >
                                            <Text className='text-center'>{option.label}</Text>
                                            <Text className='text-center capitalize mt-1 text-white'>{option.value}</Text>
                                        </TouchableOpacity>
                                    );
                                })}

                            </View>
                            <TouchableOpacity className="mt-4" onPress={debounce(() => setModalVisible(false), 500)}>
                                <AntDesign name="close" size={24} color="black" />
                            </TouchableOpacity>

                        </View>
                    </Modal>
                </ScrollView>
            </SafeAreaView> : <FullPageLoader />
    );
};

const InputField = ({ label, placeholder, value, onChangeText }) => {
    return (
        <View style={{ paddingVertical: 10 }}>
            <Text style={{ opacity: 0.5 }}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                style={{ fontSize: 16, borderBottomWidth: 1, borderColor: '#CDCDCD' }}
            />
        </View>
    );
};

export default EditProfile;
const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmButton: {
        backgroundColor: 'rgb(180,180,180)',
    },
    cancelButton: {
        backgroundColor: 'gray',
    },
});