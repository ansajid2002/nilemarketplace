import { View, Text, SafeAreaView, StatusBar } from 'react-native';
import React from 'react';

const CancelOrder = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <Text>CancelOrder</Text>
        </SafeAreaView>
    );
};

export default CancelOrder;
