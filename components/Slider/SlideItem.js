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
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view'



const SlideItem = ({ width, item, singleData, heightCheck, redirect }) => {

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


      <Image  source={{
    uri: item?.url || "../../assets/noimage.jpg" // Use a placeholder image URL if item.url is undefined
  }}
  defaultSource={require('../../assets/noimage.jpg')}
  style={{ width, height: "100%" }}
  minScale={1}
  maxScale={30}

  resizeMode="contain"
/>

                    </TouchableOpacity> :
                    <View  style={{  flex:1 ,  width: "100%" }}>

                   <ReactNativeZoomableView
                   maxZoom={30}
                   // Give these to the zoomable view so it can apply the boundaries around the actual content.
                   // Need to make sure the content is actually centered and the width and height are
                   // dimensions when it's rendered naturally. Not the intrinsic size.
                   // For example, an image with an intrinsic size of 400x200 will be rendered as 300x150 in this case.
                   // Therefore, we'll feed the zoomable view the 300x150 size.
                   contentWidth={300}
                   contentHeight={150}
                 >
                   <Image
                     style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                     source={{
                        uri: item?.url || "../../assets/noimage.jpg" // Use a placeholder image URL if item.url is undefined
                      }}
                      defaultSource={require('../../assets/noimage.jpg')}
                   />
                 </ReactNativeZoomableView>
                 </View>
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
