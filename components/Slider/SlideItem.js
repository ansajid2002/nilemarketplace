import {
    StyleSheet,
    View,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native';
import { debounce } from 'lodash';

const SlideItem = ({ width, item,  heightCheck }) => {
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

    const handleImagePress = (item) => {
        console.log(item,"pressedsajid");
        navigation.navigate('ImageSlider', { item }); // Pass it as an object in the navigation call
    };

    return (
        <View style={[styles.container, { width, height: heightCheck }]} >
                <TouchableOpacity onPress={debounce(() => handleImagePress(item), 500)}>
      <Image  source={{
    uri: item?.url || "../../assets/noimage.jpg" // Use a placeholder image URL if item.url is undefined
  }}
  defaultSource={require('../../assets/noimage.jpg')}
  style={{ width, height: "100%" }}
  minScale={1}
  maxScale={30}

  resizeMode="contain"
/>
                    </TouchableOpacity> 
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
