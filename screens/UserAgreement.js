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
                        navigation.replace("Home")
                        setIsLoading(false);

                        return
                    }
                    setIsLoading(false);

                    navigation.replace("Home")

                } else if (customerData && customerData.customer_term_accepted) {
                    const data = await sendAgreetoDb(customerData?.customer_id); // Call sendAgreetoDb function with customer_id
                    if (data) dispatch(updateCustomerData(data))
                    navigation.replace("Home")
                    setIsLoading(false);

                    navigation.replace("Home")
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
                <Text style={styles.userAgreementText}>Your User Agreement content here</Text>
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
                    <Text style={styles.buttonText}>Continue</Text>
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
