import React, { useState } from "react";
import { SafeAreaView, View, Image, ScrollView, StatusBar, TextInput, TouchableOpacity, StyleSheet, Text, } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheet } from '@rneui/themed';
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import { AdminUrl, HeaderBar } from "../../constant";

const AccountSettingsScreen = ({ navigation }) => {
    const { customerData } = useSelector((store) => store.userData)
    const { family_name, given_name, city, country, picture, google_id } = customerData?.[0]
    const [profileImage, setImage] = useState('../../assets/avatarplaceholder.png');

    const [state, setState] = useState({
        family_name: 'Sajid Ansari',
        given_name: 'ansajid@gmail.com',
        mobileNo: '+91 1236547890',
        password: '12345678901',
        showBottomSheet: false,
    })

    useEffect(() => {
        if (picture) {
            if (google_id && google_id.trim() !== "" || !picture.startsWith("https")) {
                setImage(`${AdminUrl}/uploads/customerProfileImages/${picture}`);
            } else {
                setImage(picture);
            }
        } else {
            setImage('../../assets/avatarplaceholder.png');
        }
    }, [customerData, picture, google_id]);

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {changeProfilePic()}
                    {nameInfo()}
                    {emailInfo()}
                    {mobileNumberInfo()}
                    {passwordInfo()}
                    {updateInfoButton()}
                </ScrollView>
                {changeProfilePicOptionsSheet()}
            </View>
        </SafeAreaView>
    )

    function changeProfilePicOptionsSheet() {
        return (
            <BottomSheet
                isVisible={state.showBottomSheet}
                containerStyle={{ backgroundColor: 'rgba(0.5, 0.50, 0, 0.50)' }}
                onBackdropPress={() => { updateState({ showBottomSheet: false }) }}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={debounce(() => updateState({ showBottomSheet: false }), 500)}
                    style={styles.changeProfilePicBottomSheetStyle}
                >
                    <Text style={{ marginBottom: Sizes.fixPadding + 5.0, ...Fonts.blackColor16SemiBold, textAlign: 'center' }}>
                        Choose Option
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <MaterialIcons
                            name="photo-camera"
                            color={Colors.blackColor}
                            size={17}
                        />
                        <Text style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold, }}>
                            Take a picture
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: Sizes.fixPadding + 5.0 }}>
                        <MaterialCommunityIcons
                            name="image-area"
                            color={Colors.blackColor}
                            size={17}
                        />
                        <Text style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold, }}>
                            Select from gallery
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <MaterialIcons
                            name="delete"
                            color={Colors.blackColor}
                            size={17}
                        />
                        <Text style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold, }}>
                            Remove Profile Picture
                        </Text>
                    </View>
                </TouchableOpacity>
            </BottomSheet>
        )
    }

    function updateInfoButton() {
        return (
            <TouchableOpacity className="mt-2"
                activeOpacity={0.9}
                onPress={debounce(() => navigation.pop(), 500)}
                style={styles.updateInfoButtonStyle}
            >
                <Text className="rounded-[50px]" style={{ ...Fonts.whiteColor16Bold }}>
                    UPDATE INFO
                </Text>
            </TouchableOpacity>
        )
    }

    function passwordInfo() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding + 10.0, marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Password
                </Text>
                <View style={styles.textFieldWrapStyle}>
                    {/* <TextInput
                        value={password}
                        onChangeText={(value) => updateState({ password: value })}
                        style={{ ...Fonts.blackColor14Medium, height: 20.0 }}
                        secureTextEntry={true}
                        selectionColor={Colors.primaryColor}
                    /> */}
                </View>
            </View>
        )
    }

    function mobileNumberInfo() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding + 10.0, marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Mobile Number
                </Text>
                <View style={styles.textFieldWrapStyle}>
                    {/* <TextInput
                        selectionColor={Colors.primaryColor}
                        value={mobileNo}
                        onChangeText={(value) => updateState({ mobileNo: value })}
                        style={{ ...Fonts.blackColor14Medium, height: 20.0 }}
                        keyboardType="phone-pad"
                    /> */}
                </View>
            </View>
        )
    }

    function emailInfo() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding + 10.0, marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Email
                </Text>
                <View style={styles.textFieldWrapStyle}>
                    {/* <TextInput
                        value={email}
                        onChangeText={(value) => updateState({ email: value })}
                        style={{ ...Fonts.blackColor14Medium, height: 20.0 }}
                        selectionColor={Colors.primaryColor}
                        keyboardType="email-address"
                    /> */}
                </View>
            </View>
        )
    }

    function nameInfo() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding + 10.0, marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <Text style={{ marginBottom: Sizes.fixPadding - 5.0, ...Fonts.grayColor12SemiBold }}>
                    Full Name
                </Text>
                <View style={styles.textFieldWrapStyle}>
                    <TextInput
                        value={given_name}
                        onChangeText={(value) => updateState({ name: value })}
                        style={{ ...Fonts.blackColor14Medium, height: 20.0 }}
                        selectionColor={Colors.primaryColor}
                    />
                </View>
            </View>
        )
    }

    function changeProfilePic() {
        const placeholderImageUrl = 'https://www.sfb1425.uni-freiburg.de/wp-content/uploads/2021/05/dummy-profile-pic-360x360.png';

        let imageUrl = placeholderImageUrl; // Default to the placeholder image URL

        if (picture) {
            // If brand logo image exists, use its URL
            imageUrl = `${AdminUrl}/uploads/customerProfileImages/${picture}`;
        }
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={debounce(() => updateState({ showBottomSheet: true }), 500)}
                style={{ margin: Sizes.fixPadding * 2.0, alignItems: 'center' }}
            >
                <Image
                    resizeMode="contain"
                    source={require('../../assets/images/users/user1.png')}
                    style={{ width: 80.0, height: 80.0, borderRadius: 40.0, }}
                />
                <View className="p-.05 pb-1" style={styles.changeOptionWrapStyle}>
                    <MaterialIcons
                        name="photo-camera"
                        color={Colors.whiteColor}
                        size={14}
                    />
                    <Text className="" style={{ marginLeft: Sizes.fixPadding - 5.0, ...Fonts.whiteColor12Bold }}>
                        Change
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    function header() {
        return (
            <HeaderBar goback={true} title="Profile" navigation={navigation} />
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
    changeOptionWrapStyle: {
        position: 'absolute',
        bottom: -13.0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        borderColor: Colors.whiteColor,
        borderWidth: 1.0,
        elevation: 10.0,
        shadowColor: Colors.primaryColor,
        borderRadius: Sizes.fixPadding * 2.0,
        paddingHorizontal: Sizes.fixPadding - 3.0,
        paddingVertical: Sizes.fixPadding - 8.0,
    },
    textFieldWrapStyle: {
        backgroundColor: Colors.whiteColor,
        elevation: 1.0,
        borderRadius: Sizes.fixPadding - 5.0,
        paddingHorizontal: Sizes.fixPadding,
        paddingVertical: Sizes.fixPadding + 5.0,
        borderColor: '#ececec',
        borderWidth: 1.0,
    },
    updateInfoButtonStyle: {
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
    changeProfilePicBottomSheetStyle: {
        backgroundColor: Colors.whiteColor,
        paddingVertical: Sizes.fixPadding + 5.0,
        paddingHorizontal: Sizes.fixPadding * 2.0,
        borderTopLeftRadius: Sizes.fixPadding + 5.0,
        borderTopRightRadius: Sizes.fixPadding + 5.0,
    },
});

export default AccountSettingsScreen;