import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminUrl } from '../constant';
import { updateCustomerData } from '../store/slices/customerData';

export const sendAgreetoDb = async (customerId) => {
    try {
        if (!customerId) {
            await AsyncStorage.setItem('@agreed', JSON.stringify(true));
            return null;
        }

        // Construct the request body with the customer ID
        const requestBody = JSON.stringify({ customerId });

        const response = await fetch(`${AdminUrl}/api/setUserAgreement`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });

        if (!response.ok) {
            throw new Error('Failed to send agreement to the server');
        }

        const data = await response.json();
        await AsyncStorage.setItem('@agreed', JSON.stringify(true));

        return data?.customer;
    } catch (error) {
        console.error('Error sending agreement:', error);
        throw error;
    }
};

const UserAgreement = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch()
    useEffect(() => {
        const checkAgreement = async () => {
            try {
                const customerDataAsync = await AsyncStorage.getItem('customerData');
                const agreedAsync = await AsyncStorage.getItem('@agreed');
                const customerData = JSON.parse(customerDataAsync);
                console.log(agreedAsync, 'agreedAsync');


                if (agreedAsync) {
                    if (customerData && customerData.customer_term_accepted) {
                        const data = await sendAgreetoDb(customerData?.customer_id); // Call sendAgreetoDb function with customer_id
                        if (data) dispatch(updateCustomerData(data))
                        setIsLoading(false);

                        return
                    }
                    setIsLoading(false);

                }

                else if (customerData && customerData.customer_term_accepted) {
                    const data = await sendAgreetoDb(customerData?.customer_id); // Call sendAgreetoDb function with customer_id
                    if (data) dispatch(updateCustomerData(data))
                    setIsLoading(false);

                }

                setIsLoading(false);

            } catch (error) {
                console.error('Error checking agreement:', error);
                setIsLoading(false);
            }
        };

        checkAgreement();
    }, [navigation]);

    const handleContinue = async () => {
        try {
            const customerDataAsync = await AsyncStorage.getItem('customerData');
            const customerData = JSON.parse(customerDataAsync);
            const customer_id = customerData?.customer_id;

            const data = await sendAgreetoDb(customer_id); // Call sendAgreetoDb function with customer_id
            if (data) dispatch(updateCustomerData(data))


            navigation.replace('Home');
        } catch (error) {
            console.error('Error setting agreement:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <ScrollView style={styles.contentContainer}>
                <View style={{ paddingHorizontal: 16 }}>
                    <Text className="text-xl" >USER AGREEMENT</Text>
                    <Text style={{ marginBottom: 10 }}>
                        We are committed to ensuring that the app is as useful and efficient as possible. For that reason, we reserve the right to make changes to the app or to charge for its services, at any time and for any reason. We will never charge you for the app or its services without making it very clear to you exactly what you’re paying for.
                    </Text>
                    <Text style={{ marginBottom: 10 }}>
                        The NGMP app stores and processes personal data that you have provided to us, in order to provide our Service. It’s your responsibility to keep your phone and access to the app secure. We therefore recommend that you do not jailbreak or root your phone, which is the process of removing software restrictions and limitations imposed by the official operating system of your device. It could make your phone vulnerable to malware/viruses/malicious programs, compromise your phone’s security features and it could mean that the NGMP app won’t work properly or at all.
                    </Text>
                    <Text style={{ marginBottom: 10 }}>
                        We cannot always take responsibility for the way you use the app i.e. You need to make sure that your device stays charged – if it runs out of battery and you can’t turn it on to avail the Service, we cannot accept responsibility.
                    </Text>
                    <Text style={{ marginBottom: 10 }}>
                        At some point, we may wish to update the app. The app is available for both Android and iOS– the requirements for the system (and for any additional systems we decide to extend the availability of the app to) may change, and you’ll need to download the updates if you want to keep using the app. It is your responsibility to keep the app version up to date. We do not promise that it will always update the app so that it is relevant to you and/or works with the version that you have installed on your device. However, you promise to always accept updates to the application when offered to you, we may also wish to stop providing the app, and may terminate use of it at any time without giving notice of termination to you.
                    </Text>
                    <Text style={{ marginBottom: 10 }}>
                        We strongly recommend that you only download the NGMP applications from the Play Store or App Store. Doing so will ensure that your apps are legitimate and safe from malicious software.
                    </Text>
                </View>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
                    <Text style={styles.buttonText}>Accept and Continue</Text>
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
