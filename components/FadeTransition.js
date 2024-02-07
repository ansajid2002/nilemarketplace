// FadeTransition.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    withTiming,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
} from 'react-native-reanimated';

const FadeTransition = ({ children, isVisible }) => {
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: withTiming(isVisible ? 1 : 0, {
                duration: 500,
                easing: Easing.inOut(Easing.ease),
            }),
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        zIndex: 9999
    },
});

export default FadeTransition;
