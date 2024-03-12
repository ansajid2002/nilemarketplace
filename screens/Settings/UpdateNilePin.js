import React, { useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { AdminUrl, HeaderBar } from '../../constant';
import { t } from 'i18next';
import axios from 'axios';
import { useSelector } from 'react-redux';

const UpdateNilePin = ({ navigation }) => {
    const [previousPin, setPreviousPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [loader, setLoader] = useState(false);
    const { customerData } = useSelector((store) => store.userData);

    const customer_id = customerData?.[0]?.customer_id

    const handleUpdatePin = async () => {
        if (!isValidPin(previousPin)) {
            Alert.alert('Error', 'Previous Nile Pin must be a 4-digit number');
            return;
        }
        if (!isValidPin(newPin)) {
            Alert.alert('Error', 'New Pin must be a 4-digit number');
            return;
        }
        if (!isValidPin(confirmPin)) {
            Alert.alert('Error', 'Confirm Pin must be a 4-digit number');
            return;
        }
        if (newPin !== confirmPin) {
            Alert.alert('Error', 'New Pin and Confirm Pin must match');
            return;
        }

        setLoader(true)
        try {
            const response = await axios.post(`${AdminUrl}/api/updateCustomerPin`, {
                previousPin: previousPin,
                newPin: newPin,
                customer_id
            });

            if (response?.data?.status) {
                Alert.alert(
                    'Success',
                    response?.data?.message,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(), // Navigate back on "OK" press
                        },
                    ]
                );
            } else {
                Alert.alert('Error', response?.data?.error || 'An error occurred while updating the PIN');
            }
        } catch (error) {
            console.error('Error updating PIN:', error);
            Alert.alert('Error', 'An error occurred while updating the PIN. Please try again later.');
        } finally {
            setLoader(false)
        }
    };


    const isValidPin = (pin) => {
        return /^\d{4}$/.test(pin);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
            <HeaderBar title={t("Update Nile Pin")} goback={true} searchEnable={false} cartEnable={false} navigation={navigation} />
            <View style={{ paddingHorizontal: 20, paddingTop: 20 }} className="flex-1 bg-white">
                <View className="py-2">
                    <Text className="py-2 text-gray-500 tracking-wide text-xs">Previous Nile Pin</Text>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                        onChangeText={text => setPreviousPin(text)}
                        value={previousPin}
                        keyboardType="numeric"
                        secureTextEntry={true}
                    />
                </View>
                <View className="py-2">
                    <Text className="py-2 text-gray-500 tracking-wide text-xs">New Pin</Text>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                        onChangeText={text => setNewPin(text)}
                        value={newPin}
                        keyboardType="numeric"
                        secureTextEntry={true}
                    />
                </View>
                <View className="py-2">
                    <Text className="py-2 text-gray-500 tracking-wide text-xs">Confirm Pin</Text>
                    <TextInput
                        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                        onChangeText={text => setConfirmPin(text)}
                        value={confirmPin}
                        keyboardType="numeric"
                        secureTextEntry={true}
                    />
                </View>
                <View>
                    {
                        loader ? <ActivityIndicator /> : <Button title="Update Pin" onPress={handleUpdatePin} />
                    }
                </View>
            </View>
        </SafeAreaView>
    );
}

export default UpdateNilePin;
