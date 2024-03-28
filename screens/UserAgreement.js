import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { appLogo, appName } from '../constant';

console.log(appLogo,"APPLLOOGO");
const UserAgreement = ({ navigation }) => {
   

    const handleContinue = async () => {
        try {
            await AsyncStorage.setItem("@agreed","1")
            navigation.replace('Home');
        } catch (error) {
            console.error('Error setting agreement:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: 12 }}>
                    <Image source={appLogo} className="w-20 h-20 mx-auto mt-10 rounded-lg" />
                    <Text className="text-base text-center mt-4" >Welcome to </Text>
                    <Text className="text-xl text-center mb-6 font-semibold tracking-wider" >{appName}</Text>

                    <Text className="text-base" style={{ marginBottom: 10 }}>
                        We are committed to ensuring that the app is as useful and efficient as possible. For that reason, we reserve the right to make changes to the app or to charge for its services, at any time and for any reason. We will never charge you for the app or its services without making it very clear to you exactly what you’re paying for.
                    </Text>
                    <Text className="text-base" style={{ marginBottom: 10 }}>
                        The NGMP app stores and processes personal data that you have provided to us, in order to provide our Service. It’s your responsibility to keep your phone and access to the app secure. We therefore recommend that you do not jailbreak or root your phone, which is the process of removing software restrictions and limitations imposed by the official operating system of your device. It could make your phone vulnerable to malware/viruses/malicious programs, compromise your phone’s security features and it could mean that the NGMP app won’t work properly or at all.
                    </Text>
                    <Text className="text-base" style={{ marginBottom: 10 }}>
                        We cannot always take responsibility for the way you use the app i.e. You need to make sure that your device stays charged – if it runs out of battery and you can’t turn it on to avail the Service, we cannot accept responsibility.
                    </Text>
                    <Text className="text-base" style={{ marginBottom: 10 }}>
                        At some point, we may wish to update the app. The app is available for both Android and iOS– the requirements for the system (and for any additional systems we decide to extend the availability of the app to) may change, and you’ll need to download the updates if you want to keep using the app. It is your responsibility to keep the app version up to date. We do not promise that it will always update the app so that it is relevant to you and/or works with the version that you have installed on your device. However, you promise to always accept updates to the application when offered to you, we may also wish to stop providing the app, and may terminate use of it at any time without giving notice of termination to you.
                    </Text>
                    <Text className="text-base" style={{ marginBottom: 10 }}>
                        We strongly recommend that you only download the NGMP applications from the Play Store or App Store. Doing so will ensure that your apps are legitimate and safe from malicious software.
                    </Text>
                </View>
            </ScrollView>
            <View className="pt-4" >
                <TouchableOpacity onPress={handleContinue} className="bg-[#ff5722] py-2.5 mx-14 rounded-full mb-2 " >
                    <Text className="text-center mx-4" style={styles.buttonText}>Agree and Continue</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = {
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 0.8,
        paddingHorizontal: 16,
    },
    userAgreementText: {
        fontSize: 14,
        lineHeight: 24,
    },
    buttonContainer: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'gray',
    },
    continueButton: {
        backgroundColor: '#FF5722',
        padding: 10,
        borderRadius: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
};

export default UserAgreement;
