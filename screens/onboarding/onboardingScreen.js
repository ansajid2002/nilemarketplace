import React, { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, SafeAreaView, View, StatusBar, StyleSheet, Image, Dimensions, Text } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import Carousel, { Pagination } from 'react-native-snap-carousel-v4';
import { useFocusEffect } from "@react-navigation/native";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get('window');

const onboardingScreenList = [
    {
        id: '1',
        onboardingImage: require('../../assets/images/onboardings/onboarding1.png'),
        title: 'Welcome to Nile Marketplace!',
        description: `
        "Elevate Your Shopping Experience: Discover, Buy, and Sell with Confidence!"`,
    },
    {
        id: '2',
        onboardingImage: require('../../assets/images/onboardings/onboarding2.png'),
        title: 'Explore Local and Global Deals',
        description: `Discover a world of possibilities with Nile Marketplace, where you can find both local and international deals. Shop from your neighborhood or across the globe!`,
    },
    {
        id: '3',
        onboardingImage: require('../../assets/images/onboardings/onboarding3.png'),
        title: 'Buy New and Refurbished Products',
        description: `Get access to a wide selection of products, including brand new items and quality-refurbished goods. Choose what suits your budget and preferences.`,
    },
    {
        id: '4',
        onboardingImage: require('../../assets/images/onboardings/onboarding4.png'),
        title: 'Safe and Secure Transactions',
        description: `Rest easy knowing that Nile Marketplace prioritizes your safety. Our secure payment system ensures worry-free transactions for both buyers and sellers.`,
    },
];

const OnboardingScreen = ({ navigation }) => {
    const backAction = () => {
        backClickCount == 1 ? BackHandler.exitApp() : _spring();
        return true;
    }
    const { t } = useTranslation()
    useEffect(() => {
        const checkOnboarding = async () => {
            const onboarding = await AsyncStorage.getItem('onboarding');
            if (onboarding === '1') {
                navigation.navigate('Home');
            }
        };

        checkOnboarding();
    }, []);

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
        }, [backAction])
    );

    function _spring() {
        setBackClickCount(1);
        setTimeout(() => {
            setBackClickCount(0)
        }, 1000)
    }

    const [backClickCount, setBackClickCount] = useState(0);

    const [onboardingScreens, setOnboardingScreen] = useState(onboardingScreenList);
    const [activeSlide, setActiveSlide] = useState(0);

    const flatListRef = useRef();

    const renderItem = ({ item }) => {
        return (
            <>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
                    <Image
                        resizeMode="contain"
                        source={item.onboardingImage}
                        style={{ width: width - 40.0, height: height / 2.5, }}
                    />
                    <View style={{ marginBottom: Sizes.fixPadding, marginHorizontal: Sizes.fixPadding * 2.0, }}>
                        <Text style={{ textAlign: 'center', ...Fonts.blackColor18SemiBold }}>
                            {item.title}
                        </Text>
                        <Text style={{ marginTop: Sizes.fixPadding - 5.0, textAlign: 'center', ...Fonts.grayColor14Regular }}>
                            {item.description}
                        </Text>
                    </View>
                </View>
            </>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1, backgroundColor: "white" }}>
                <>
                    <Carousel
                        ref={flatListRef}
                        data={onboardingScreens}
                        sliderWidth={width}
                        itemWidth={width}
                        renderItem={renderItem}
                        showsHorizontalScrollIndicator={false}
                        onSnapToItem={(index) => setActiveSlide(index)}
                        autoplay={true}
                        loop={true}
                        autoplayInterval={4000}
                        slideStyle={{ width: width }}
                    />
                    {pagination()}
                    {skipNextAndLogin()}
                </>
            </View>
            {
                backClickCount == 1
                    ?
                    <View style={[styles.animatedView]}>
                        <Text style={{ ...Fonts.whiteColor12Medium }}>
                            {t("Press Back Once Again to Exit")}
                        </Text>
                    </View>
                    :
                    null
            }
        </SafeAreaView>
    )

    function skipNextAndLogin() {
        return (
            <View style={styles.skipAndLoginWrapStyle}>
                {activeSlide != 3
                    ?
                    <Text
                        onPress={debounce(async () => {
                            await AsyncStorage.setItem('onboarding', '1')
                            navigation.replace('Home')
                        }, 500)}
                        style={{ ...Fonts.grayColor14SemiBold }}>
                        {t("Skip")}
                    </Text>
                    :
                    <Text>
                    </Text>
                }
                {
                    activeSlide == 3
                        ?
                        <Text
                            onPress={debounce(async () => {
                                await AsyncStorage.setItem('onboarding', '1')
                                navigation.replace('Home')
                            }, 500)}
                            style={{ ...Fonts.primaryColor14SemiBold }}
                        >{t("Login")}</Text>
                        :
                        <Text
                            onPress={debounce(() => {
                                if (activeSlide == 0) {
                                    flatListRef.current.snapToItem(1);
                                }
                                else if (activeSlide == 1) {
                                    flatListRef.current.snapToItem(2);
                                }
                                else if (activeSlide == 2) {
                                    flatListRef.current.snapToItem(3);
                                }
                            }, 500)}
                            style={{ ...Fonts.primaryColor14SemiBold }}
                        >{t("Next")}</Text>
                }
            </View>
        )
    }

    function pagination() {
        return (
            <Pagination
                dotsLength={onboardingScreens.length}
                activeDotIndex={activeSlide}
                containerStyle={{
                    position: 'absolute',
                    bottom: 0.0,
                    alignSelf: 'center'
                }}
                dotStyle={styles.activeDotStyle}
                inactiveDotStyle={styles.dotStyle}
                inactiveDotScale={1}
            />
        );
    }
}

const styles = StyleSheet.create({
    dotStyle: {
        backgroundColor: Colors.lightGrayColor,
        marginHorizontal: Sizes.fixPadding - 15.0,
        width: 16.0,
        height: 8.0,
        borderRadius: Sizes.fixPadding,
    },
    activeDotStyle: {
        backgroundColor: Colors.primaryColor,
        borderRadius: Sizes.fixPadding,
        height: 8.0,
        width: 26.0,
        marginHorizontal: Sizes.fixPadding - 15.0,
    },
    skipAndLoginWrapStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: 25.0,
        left: 20.0,
        right: 20.0,
    },
    nextAndLoginButtonStyle: {
        backgroundColor: Colors.primaryColor,
        borderRadius: Sizes.fixPadding - 5.0,
        paddingHorizontal: Sizes.fixPadding * 2.0,
        paddingVertical: Sizes.fixPadding - 3.0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    animatedView: {
        backgroundColor: "#333333",
        position: "absolute",
        bottom: 20,
        alignSelf: 'center',
        borderRadius: Sizes.fixPadding * 2.0,
        paddingHorizontal: Sizes.fixPadding + 5.0,
        paddingVertical: Sizes.fixPadding,
        justifyContent: "center",
        alignItems: "center",
    }
});

export default OnboardingScreen;