import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { HeaderBar } from '../../constant';
import { debounce } from 'lodash';
export const ProfileBody = ({
    name,
    accountName,
    profileImage,
    post,
    followers,
    reviews,
}) => {
    const navigation = useNavigation()

    return (
        <View>
            {accountName ? (
                <HeaderBar goback={true} title={accountName} navigation={navigation} />
            ) : null}

            <View
                style={{
                    alignItems: 'center',
                }}>
                <Image
                    source={{ uri: profileImage }}
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
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{followers}</Text>
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

export const ProfileButtons = ({ phone, data }) => {
    const navigation = useNavigation();
    const [follow, setFollow] = useState(follow);

    const handlePhoneIconPress = () => {
        Linking.openURL(`tel:${phone}`);
    };
    return (
        <>
            <View
                style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                }}>
                <TouchableOpacity
                    onPress={debounce(() => setFollow(!follow), 500)}
                    style={{ width: '42%' }}>
                    <View
                        style={{
                            width: '100%',
                            height: 35,
                            borderRadius: 5,
                            backgroundColor: follow ? null : '#3493D9',
                            borderWidth: follow ? 1 : 0,
                            borderColor: '#DEDEDE',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Text style={{ color: follow ? 'black' : 'white' }}>
                            {follow ? 'Following' : 'Follow'}
                        </Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={{ width: '42%' }} onPress={debounce(() => navigation.push('InboxChatScreen', { data }), 300)}>
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
                        <Text>Message Seller</Text>
                    </View>
                </TouchableOpacity>
                <View
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
                </View>
            </View>
        </>
    );
};