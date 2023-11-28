import {
    StyleSheet,
    View,
    Dimensions,
    Animated,
    Easing,
    Text,
    ActivityIndicator, // Import Text component
} from 'react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { debounce } from 'lodash';

const SlideItem = ({ width, item, singleData, heightCheck, redirect }) => {
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    if (width === undefined) {
        width = Dimensions.get('window').width;
    }
    const translateYImage = new Animated.Value(40);
    Animated.timing(translateYImage, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.bounce,
    }).start();

    const navigation = useNavigation(); // Hook to access navigation

    const handleImagePress = () => {
        navigation.navigate('ImageSlider', { singleData }); // Pass it as an object in the navigation call
    };

    return (
        <View style={[styles.container, { width, height: heightCheck }]} >
            {
                redirect != '' ?
                    <TouchableOpacity onPress={debounce(handleImagePress, 500)}>

                        {imageError && (
                            <ActivityIndicator size="large" color="gray" style={styles.loadingIndicator} />
                        )}
                        <Image
                            resizeMode="contain"
                            source={
                                { uri: item?.url }
                            }
                            style={{ width, height: "100%" }}
                            onLoadStart={() => setLoading(true)}
                            onLoadEnd={() => setLoading(false)}
                            onError={() => {
                                setLoading(false);
                                setImageError(true);
                            }}
                        />
                    </TouchableOpacity> :
                    <Animated.Image
                        source={{ uri: item?.url }}
                        resizeMode="contain"
                        style={{ width, height: "100%" }}
                    />
            }



        </View>
    );
};

export default SlideItem;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 12,
    },

    content: {
        flex: 0.4,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    description: {
        fontSize: 18,
        marginVertical: 12,
        color: '#333',
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
    },
});
