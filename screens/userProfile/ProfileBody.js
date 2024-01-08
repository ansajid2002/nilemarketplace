import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, Modal, SafeAreaView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { HeaderBar } from '../../constant';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import defaultImage from "../../assets/images/dummy-profile-pic.png"
import { MaterialIcons } from "@expo/vector-icons";


export const ProfileBody = ({
    name,
    accountName,
    profileImage,
    post,
    followers,
    reviews,
}) => {

    return (
        <View>
            <View
                style={{
                    alignItems: 'center',
                }}>
                <Image
                    source={{ uri: profileImage }}
                    defaultSource={defaultImage}
                    style={{
                        resizeMode: 'cover',
                        width: 80,
                        height: 80,
                        borderRadius: 100,
                        marginTop: 25
                    }}
                />
                <Text
                    style={{
                        paddingVertical: 10,
                        fontWeight: 'bold',
                    }}>
                    {name}
                </Text>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    paddingVertical: 20,
                }}>

                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{post}</Text>
                    <Text>Products</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{followers || 0}</Text>
                    <Text>Followers</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{reviews}</Text>
                    <Text>Reviews</Text>
                </View>

            </View>
        </View>
    );
};

export const ProfileButtons = ({ phone, data, id }) => {
    const navigation = useNavigation();
    const { customerData } = useSelector((store) => store.userData)

    const [follow, setFollow] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = () => {
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };


    const handlePhoneIconPress = () => {
        Linking.openURL(`tel:${phone}`);
    };


    return (<>

        <View
            style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
            }}>
            <View style={{ width: '42%' }}>
                <TouchableOpacity
                    // onPress={() => {
                    //     setFollow(!follow);
                    //     openModal(); // Open the modal on TouchableOpacity press
                    // }}

                >
                    <View
                        style={{
                            width: '100%',
                            height: 35,
                            borderRadius: 5,
                            backgroundColor: '#3493D9',
                            borderColor: '#DEDEDE',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: 'white' }}>View Policies</Text>
                    </View>
                </TouchableOpacity>

                
            </View>
            <TouchableOpacity
                style={{ width: '42%' }}
                // onPress={debounce(() => {
                //     const screenName = customerData?.length > 0 ? 'InboxChatScreen' : 'Login';
                //     navigation.navigate(screenName, { data });
                // }, 300)}
                onPress={debounce(() => navigation.navigate("Reviews", { type: 'seller', vendor_id: id || null, selectedRating: 3, data }), 500)}
            >
                <View
                    style={{
                        width: '100%',
                        height: 35,
                        borderWidth: 1,
                        borderColor: '#DEDEDE',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                    }}>
                    <Text>Write a Review</Text>
                </View>
            </TouchableOpacity>

            {/* <View
                    style={{
                        width: '10%',
                        height: 35,
                        borderWidth: 1,
                        borderColor: '#DEDEDE',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 5,
                    }}>

                    <TouchableOpacity onPress={debounce(handlePhoneIconPress, 500)}>
                        <Feather
                            name="phone"
                            style={{ fontSize: 20, color: 'black' }}
                        />
                    </TouchableOpacity>
                </View> */}
        </View>
    </>
    );
};


{/* <Modal
                    animationType="slide" // Change the animation type if needed
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={closeModal}
                >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#00000098" }}>
                        <View
                            className="bg-white w-[300px] p-3"
                            style={{
                                padding: 8,
                                borderRadius: 10,
                                // alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 4,
                                elevation: 5,
                            }}
                        >
                        <View className="flex-row items-center justify-between mt-1 mb-4">

                            <Text className="text-lg font-medium">Business Policy</Text>
                            <TouchableOpacity onPress={closeModal} className=" ">
                                <MaterialIcons name="close" size={22} color="black" />
                            </TouchableOpacity>
                        </View>
                            {policyContent && <Text>{policyContent}</Text>}
                        </View>
                    </View>
                </Modal> */}