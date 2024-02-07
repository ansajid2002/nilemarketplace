import { FlatList, Animated, View, TouchableOpacity } from 'react-native';
import React, { useRef, useState } from 'react';
import SlideItem from './SlideItem';
import Pagination from './Pagination';
import { AdminUrl } from '../../constant';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';
import { productUrl } from '../../constant';


const ImageSlider = ({ route, navigation }) => {
    const { singleData } = route.params;
    const [index, setIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const { height } = Dimensions.get('window');

    let images;
    if (singleData[0]?.url) {
        images = singleData;
    } else {
        images = singleData.images.map((item, index) => ({
            id: index.toString(),
            url: `${productUrl}/${item}`,
        }));
    }

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
                useNativeDriver: false, // Make sure to set useNativeDriver to false
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
        <SafeAreaView className="mt-8 " style={{ flex: 1, }}>
            
            {/* Header with back button */}
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
                
            <FlatList
                data={images}
                renderItem={({ item }) => <SlideItem item={item} heightCheck={height} redirect={''} />}
                horizontal
                pagingEnabled
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                onScroll={handleOnScroll}
                onViewableItemsChanged={handleOnViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
            />
            <Pagination data={images} scrollX={scrollX} index={index} />
        </SafeAreaView>
    );
};

export default ImageSlider;
