import { Animated, FlatList, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import Slides from './data';
import SlideItem from './SlideItem';
import Pagination from './Pagination';
import { AdminUrl } from '../../constant';
import { Dimensions } from 'react-native';
import { productUrl } from '../../constant'

const { width, height } = Dimensions.get('window');

const Slider = ({ singleData }) => {
    const [index, setIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const images = singleData.images?.[0] && singleData.images?.map((item, index) => ({
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
        setIndex(viewableItems[0].index);
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    return (
        <View >
            {/* <Text>Helo</Text> */}
            <FlatList
                data={images || []}
                renderItem={({ item }) => <SlideItem item={item || []} width={width} singleData={singleData || []} redirect="ImageSldier" heightCheck={height * 0.6} />}
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