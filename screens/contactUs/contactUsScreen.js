import React, { useState } from "react";
import { SafeAreaView, View, ScrollView, TextInput, StatusBar, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons } from '@expo/vector-icons';
import { debounce } from "lodash";
import { HeaderBar } from "../../constant";

const ContactUsScreen = ({ navigation }) => {

    const [state, setState] = useState({
        name: '',
        email: '',
        support: '',
    })

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    const {
        name,
        email,
        support,
    } = state;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: Sizes.fixPadding * 2.0 }}
                >
                    {nameTextField()}
                    {emailTextField()}
                    {supportTextField()}
                    {submitButton()}
                </ScrollView>
            </View>
        </SafeAreaView>
    )

    function submitButton() {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={debounce(() => navigation.pop(), 500)}
                style={styles.submitButtonStyle}
            >
                <Text style={{ ...Fonts.whiteColor16Bold }}>
                    SUBMIT
                </Text>
            </TouchableOpacity>
        )
    }

    function supportTextField() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding + 3.0, }}>
                <TextInput
                    placeholder="Write your message"
                    multiline={true}
                    numberOfLines={6}
                    mode="outlined"
                    value={support}
                    onChangeText={text => updateState({ support: text })}
                    style={styles.textFieldStyle}
                    cursorColor={Colors.primaryColor}
                    textAlignVertical="top"
                />
            </View>

        )
    }

    function emailTextField() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding + 3.0 }}>
                <TextInput
                    placeholder="Email"
                    mode="outlined"
                    value={email}
                    onChangeText={text => updateState({ email: text })}
                    style={{
                        ...styles.textFieldStyle,
                        paddingVertical: Sizes.fixPadding + 2.0,
                    }}
                    cursorColor={Colors.primaryColor}
                    keyboardType="email-address"
                />
            </View>
        )
    }

    function nameTextField() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding + 3.0 }}>
                <TextInput
                    placeholder="Full Name"
                    mode="outlined"
                    value={name}
                    onChangeText={text => updateState({ name: text })}
                    style={{
                        ...styles.textFieldStyle,
                        paddingVertical: Sizes.fixPadding + 2.0,
                    }}
                    cursorColor={Colors.primaryColor}
                />
            </View>
        )
    }

    function header() {
        return (
            <HeaderBar title="Contact us" goback={true} navigation={navigation} />
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
    textFieldStyle: {
        ...Fonts.blackColor14Medium,
        marginHorizontal: Sizes.fixPadding * 2.0,
        backgroundColor: Colors.whiteColor,
        elevation: 1.0,
        borderRadius: Sizes.fixPadding - 5.0,
        borderColor: '#ececec',
        borderWidth: 1.0,
        padding: Sizes.fixPadding,
    },
    submitButtonStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        paddingVertical: Sizes.fixPadding + 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        elevation: 5.0,
        shadowColor: Colors.primaryColor,
        marginHorizontal: Sizes.fixPadding * 2.0,
        marginTop: Sizes.fixPadding,
        marginBottom: Sizes.fixPadding * 2.0,
        borderColor: 'rgba(75, 44, 32, 0.5)',
        borderWidth: 1.0,
    },
});

export default ContactUsScreen;