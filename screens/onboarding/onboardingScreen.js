import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, SafeAreaView, View, StatusBar, StyleSheet, Image, Dimensions, Text, TouchableOpacity } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";

import Onboarding from 'react-native-onboarding-swiper';

const OnboardingScreen = ({ navigation }) => {

    const Done = ({ ...props }) => (
        <TouchableOpacity
            {...props}
        >
            <Text className="text-white font-bold" style={{ fontSize: 16, marginHorizontal: 20 }}>Done</Text>
        </TouchableOpacity>
    )
    const Dots = ({ selected }) => {
        let backgroundColor;
        backgroundColor = selected ? '#5757ff' : 'black'
        return (
            <View
                style={{
                    width: 24,
                    height: 6,
                    marginHorizontal: 3,
                    backgroundColor
                }}
            />
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Onboarding
                //To handle the navigation to the Homepage if Skip is clicked
                onSkip={() => navigation.replace("Home")}
                DotComponent={Dots}
                //To handle the navigation to the Homepage after Done is clicked
                onDone={() => navigation.replace("Home")}
                DoneButtonComponent={Done}
                
                pages={[
                    {
                        backgroundColor: '#00008b',
                        image: <Image source={require('../../assets/images/onboardings/onboarding1.png')} />,
                        title: 'Welcome to Nile Marketplace!',
                        subtitle: 'Elevate Your Shopping Experience: Discover, Buy, and Sell with Confidence!',
                    },
                    {
                        backgroundColor: '#3737ff',
                        image: <Image source={require('../../assets/images/onboardings/onboarding2.png')} />,
                        title: 'Explore Local and Global Deals',
                        subtitle: 'Discover a world of possibilities with Nile Marketplace, where you can find both local and international deals. Shop from your neighborhood or across the globe!',
                    },
                    {
                        backgroundColor: '#00008b',
                        image: <Image source={require('../../assets/images/onboardings/onboarding3.png')} />,
                        title: 'Buy New and Refurbished Products',
                        subtitle: 'Get access to a wide selection of products, including brand new items and quality-refurbished goods. Choose what suits your budget and preferences.',
                    },
                    {
                        backgroundColor: '#3737ff',
                        image: <Image source={require('../../assets/images/onboardings/onboarding4.png')} />,
                        title: 'Safe and Secure Transactions',
                        subtitle: 'Rest easy knowing that Nile Marketplace prioritizes your safety. Our secure payment system ensures worry-free transactions for both buyers and sellers.',
                    },
                    
                ]}
            />
        </SafeAreaView>
    )


}

export default OnboardingScreen;