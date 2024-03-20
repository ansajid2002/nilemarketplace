import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import Slides from './data';
import SlideItem from './SlideItem';
import Pagination from './Pagination';
import { AdminUrl } from '../../constant';
import { Dimensions } from 'react-native';
import { productUrl } from '../../constant'
import { Video } from 'expo-av';
import VideoComponent from '../VideoComponent';

const { width, height } = Dimensions.get('window');

const Slider = ({ singleData }) => {
    const [index, setIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    let videos = singleData?.videourl || ""; // Remove all spaces from the string
    videourl = videos.replace(/\s/g, '');
    
    // Split the string into an array of strings using comma as the delimiter
    const videoArray = videourl.trim() === "" ? [] : videourl.split(',');
    const images = (singleData.images || []).map((item, index) => ({
        id: index.toString(),
        url: `${productUrl}/${item}`,
    }));
    
    const handleOnScroll = event => {
        Animated.event(
            [
                {
                    nativeEvent: {
                        contentOffset: {
                            x: scrollX,
                        },
                    },
                },
            ],
            {
                useNativeDriver: false,
            },
        )(event);
    };

    const handleOnViewableItemsChanged = useRef(({ viewableItems }) => {
        setIndex(viewableItems[0]?.index);
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;
    const renderItem = ({ item, index }) => {
        if (index < images?.length) {
            return (
                <SlideItem item={item} width={width} singleData={singleData} redirect="ImageSldier" heightCheck={height * 0.6} />
            );
        } else if (index === images?.length && videoArray?.length > 0) {
            return (
                // Render your video component here
                <View className="flex-row flex-1 ">
                    {
                        videoArray?.map((v) => {
                            console.log(v,"outer v");
                            if (v !== "None") {

                            
                            return (
                                <VideoComponent vid={v} />
                            )}
                        })
                    }
                </View>
                
            );
        }
        return null;
    };
    return (
        <View >
            <FlatList
                data={[...images, ...(videoArray?.length > 0 ? [{}] : [])]}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                onScroll={handleOnScroll}
                onViewableItemsChanged={handleOnViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            
            <Pagination data={images || []} scrollX={scrollX} index={index} />
        </View>
    );
};

export default Slider;

const styles = StyleSheet.create({});