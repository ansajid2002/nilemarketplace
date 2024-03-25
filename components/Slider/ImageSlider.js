import { FlatList, Animated, View, TouchableOpacity, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

const ImageSlider = ({ route, navigation }) => {
    const { item } = route.params;
    return (
        <SafeAreaView className="mt-8 " style={{ flex: 1}}>
            
            <TouchableOpacity
                onPress={debounce(() => navigation.goBack(), 500)}
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    width: 40,
                    height: 40,
                    zIndex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
            <View  style={{  flex:1 ,  width: "100%" }}>

                   <ReactNativeZoomableView
                   maxZoom={10} zoomStep={0.5}
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
        </SafeAreaView>
    );
};
export default ImageSlider;
