import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const FullPageLoader = ({ bgcolor = true }) => {
    return (
        <View style={[styles.container, { backgroundColor: bgcolor ? 'white' : 'transparent' }]}>
            <ActivityIndicator size="large" color="#00008b" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999

    },
});

export default FullPageLoader;
