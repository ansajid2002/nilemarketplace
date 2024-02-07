import React from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Ionicons, EvilIcons } from '@expo/vector-icons';

export default function SlideToAction({ text, onSwipe }) {
    const [translateX] = React.useState(new Animated.Value(0));
    const [showLog, setShowLog] = React.useState(false);
    const [backgroundColor, setBackgroundColor] = React.useState(new Animated.Value(0));
    const [showCheckIcon, setShowCheckIcon] = React.useState(false);
    const [showSwipeToPay, setShowSwipeToPay] = React.useState(true);

    const panResponder = React.useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onPanResponderMove: (_, gestureState) => {
                    if (gestureState.dx >= 0 && gestureState.dx <= Dimensions.get('window').width) {
                        translateX.setValue(gestureState.dx);
                        // Change background color to green when the icon reaches 100% slide
                        if (gestureState.dx >= 100) {
                            setShowSwipeToPay(false);
                            if (gestureState.dx >= Dimensions.get('window').width - 200) {
                                Animated.spring(backgroundColor, {
                                    toValue: 1,
                                    useNativeDriver: false,
                                }).start();
                            }
                        } else {
                            setBackgroundColor(new Animated.Value(0)); // Reset to original color if not fully slid
                            setShowSwipeToPay(true);
                        }
                    }
                },
                onPanResponderRelease: (_, gestureState) => {
                    if (gestureState.dx >= Dimensions.get('window').width / 2) {
                        setShowLog(true);
                        setShowCheckIcon(true);
                        Animated.spring(translateX, {
                            toValue: Dimensions.get('window').width,
                            useNativeDriver: false,
                        }).start();
                        onSwipe(true); // Send response to parent component
                        // Perform action here
                    } else {
                        Animated.spring(translateX, {
                            toValue: 0,
                            useNativeDriver: false,
                        }).start();
                        setShowSwipeToPay(true); // Show "Swipe to Pay" when not fully slid
                    }
                },
            }),
        [translateX]
    );

    return (
        <View className="flex-row justify-center w-full">
            <TouchableOpacity onPress={() => setShowLog(false)} activeOpacity={0.9}>
                <Animated.View
                    style={[styles.buttonContainer, {
                        backgroundColor: backgroundColor.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['#00008b', 'green'],
                        })
                    }]}
                >
                    {showCheckIcon && (
                        <Animated.View
                            style={[styles.checkIcon, {
                                opacity: translateX.interpolate({
                                    inputRange: [Dimensions.get('window').width / 2, Dimensions.get('window').width],
                                    outputRange: [0, 1],
                                    extrapolate: 'clamp',
                                })
                            }]}
                        >
                            {/* <Ionicons name="spin" size={50} color="white" /> */}
                            <EvilIcons name="spinner" size={50} color="white" className="animate-pulse bg-red-500"/>
                        </Animated.View>
                    )}
                    <Animated.View
                        style={[styles.button, { transform: [{ translateX }] }]}
                        {...panResponder.panHandlers}
                    >
                        <AntDesign name="doubleright" size={32} color="white" style={styles.arrowIcon} />
                    </Animated.View>
                    {showSwipeToPay && <Text style={styles.defaultText}>{text}</Text>}
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        width: Dimensions.get('window').width - 20,
        height: 60,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: '#00008b', // Default background color
        position: 'relative',
    },
    button: {
        position: 'absolute',
        left: 0,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    arrowIcon: {
        marginLeft: 10,
    },
    checkIcon: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 1,
    },
    defaultText: {
        color: 'white',
        fontSize: 16,
    },
});
