import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Dimensions, Animated } from 'react-native';
import { AdminUrl } from '../constant';
import Pagination from './Slider/Pagination';
import { Image } from 'expo-image';

const ImageCarousel = () => {
    const { width } = Dimensions.get('window');
    const [activeSlide, setActiveSlide] = useState(0);
    const [banners, setBanners] = useState([]);
    const scrollX = useRef(new Animated.Value(0)).current;

    // const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

    // Create an Animated.Value to control the dot scaling animation
    const dotScale = new Animated.Value(1);

    useEffect(() => {
        const fetchBanners = () => {
            // Replace 'backendBannersUrl' with the actual endpoint to fetch banners
            const backendBannersUrl = `${AdminUrl}/api/getBanners`;

            axios.get(backendBannersUrl)
                .then((response) => {
                    // Filter banners with non-empty 'banner_url' before updating the state
                    const filteredBanners = response.data.filter(item => item.banner_url);
                    setBanners(filteredBanners);
                })
                .catch((error) => {
                    console.error('Failed to fetch banners:', error);
                });
        };

        // Fetch banners from the backend when the component mounts
        fetchBanners();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            if (activeSlide < banners.length - 1) {
                setActiveSlide(activeSlide + 1);
            } else {
                setActiveSlide(0);
            }
        }, 3000); // Change images every 3 seconds

        return () => {
            clearInterval(timer);
        };
    }, [activeSlide]);

    // Create a function to animate the dot scaling
    const animateDot = () => {
        Animated.sequence([
            Animated.timing(dotScale, {
                toValue: 1.2, // Increase size when active
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(dotScale, {
                toValue: 1, // Restore the original size
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    };

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

    return (
        <View>
            <FlatList
                data={banners}
                horizontal
                pagingEnabled
                onScroll={handleOnScroll}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()} // Make sure to use a string for key
                renderItem={({ item, index }) => (
                    <Image
                        source={{ uri: `${AdminUrl}/uploads/Banners/${item.banner_url}` }}
                        style={{ width, height: 200 }}
                        // placeholder={blurhash}
                        transition={1000}
                        contentFit='cover'
                    />
                )}
                onMomentumScrollEnd={(event) => {
                    const slideWidth = event.nativeEvent.layoutMeasurement.width;
                    const slideIndex = event.nativeEvent.contentOffset.x / slideWidth;
                    setActiveSlide(Math.round(slideIndex));
                    animateDot(); // Call the animation function when the slide changes
                }}
            />


            <View >
                {/* {banners.map((_, index) => (
                    <Animated.View
                        key={index}
                        style={{
                            width: 8,
                            height: 8,
                            backgroundColor: index === activeSlide ? '#00008b' : 'gray',
                            margin: 5,
                            borderRadius: 4,
                            transform: [{ scale: index === activeSlide ? dotScale : 1 }], // Apply scaling to the active dot
                        }}
                    />
                ))} */}
                <Pagination data={banners || []} scrollX={scrollX} index={1} />
            </View>

        </View>
    );
};

export default ImageCarousel;
