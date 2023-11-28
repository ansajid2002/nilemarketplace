import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, BackHandler, SafeAreaView, StatusBar } from "react-native";
import { Colors, Fonts, Sizes } from "../constants/styles";
import HomeScreen from "../screens/home/homeScreen";
import SearchScreen from "../screens/search/searchScreen";
import ChatsScreen from "../screens/chats/chatsScreen";
import AccountScreen from "../screens/account/accountScreen";
import NotificationsScreen from "../screens/notifications/notificationsScreen";
import { useFocusEffect } from "@react-navigation/native";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { changeSearchFocus } from "../store/slices/counterslice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

const BottomTabBarScreen = ({ navigation }) => {
    const { bottomtabbarIndex } = useSelector((state) => state.bottomtabbar);
    const dispatch = useDispatch()
    const { customerData } = useSelector((store) => store.userData)

    const customerId = customerData[0]?.customer_id

    const backAction = () => {
        backClickCount == 1 ? BackHandler.exitApp() : _spring();
        return true;
    }

    useFocusEffect(
        useCallback(() => {
            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
        }, [backAction])
    );

    function _spring() {
        updateState({ backClickCount: 1 });
        setTimeout(() => {
            updateState({ backClickCount: 0 })
        }, 1000)
    }

    const [state, setState] = useState({
        currentIndex: bottomtabbarIndex,
        backClickCount: 0
    });


    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    const { currentIndex, backClickCount } = state;

    const cartItems = useSelector((state) => state.cart.cartItems);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1, backgroundColor: Colors.bodyBackColor }}>
                {currentIndex == 1 ?
                    <HomeScreen navigation={navigation} /> :
                    currentIndex == 2 ?
                        <SearchScreen navigation={navigation} />
                        :
                        currentIndex == 4 ?
                            <ChatsScreen navigation={navigation} />
                            :
                            currentIndex == 5 ?
                                <NotificationsScreen navigation={navigation} />
                                :
                                <AccountScreen navigation={navigation} />
                }
                <View style={styles.bottomTabBarStyle}>
                    <View style={{ width: '30%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        {bottomTabBarItem({
                            index: 1,
                            tabImage: require('../assets/images/icons/home.png'),
                            name: "Home"
                        })}
                        {bottomTabBarItem({
                            index: 2,
                            tabImage: require('../assets/images/icons/category.png'),
                            name: "Categories"
                        })}
                    </View>
                    <View style={{ alignSelf: 'center', }} className="" >
                        {bottomTabBarItem({
                            index: 3,
                            tabImage: require('../assets/images/icons/account.png'),
                            name: "Profile"
                        })}
                    </View>
                    <View style={{ width: '30%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                        <View style={styles.ribbonContainer}>
                            {bottomTabBarItem({
                                index: 4,
                                tabImage: require('../assets/images/icons/chat.png'),
                                name: "Cart"
                            })}
                            <Text className="ml-0.5">{cartItems?.length}</Text>
                        </View>
                        {bottomTabBarItem({
                            index: 5,
                            tabImage: require('../assets/images/icons/camera.png'),
                            name: "Notifications"
                        })}
                    </View>
                </View>
            </View>
            {
                backClickCount == 1
                    ?
                    <View style={[styles.animatedView]}>
                        <Text style={{ ...Fonts.whiteColor12Medium }}>
                            Press Back Once Again to Exit
                        </Text>
                    </View>
                    :
                    null
            }
        </SafeAreaView>
    )

    function bottomTabBarItem({ index, tabImage, name }) {
        return (
            <View style={{ alignItems: 'center' }}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={debounce(() => {
                        updateState({ currentIndex: index })
                        dispatch(changeSearchFocus(false))
                    }, 500)}
                >
                    {/* <Text className="text-[1px]">{name}</Text> */}
                    {
  currentIndex === index ? (
    <View >
      <Image
      className=" scale-110"
        source={tabImage}
        style={{
          width: 26.0,
          height: 26.0,
          resizeMode: 'contain',
          tintColor: Colors.primaryColor,
        }}
      />
    </View>
  ) : (
    <Image
      source={tabImage}
      style={{
        width: 24.0,
        height: 24.0,
        resizeMode: 'contain',
        tintColor: currentIndex === index ? Colors.primaryColor : "#36383a",
      }}
    />
  )
}
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    bottomTabBarStyle: {
        position: 'absolute',
        bottom: 0.0,
        left: 0.0,
        right: 0.0,
        height: 50.0,
        backgroundColor: Colors.whiteColor,
        borderTopColor: '#ececec',
        borderTopWidth: 1.0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Sizes.fixPadding * 2,
        elevation: 10.0,
    },
    animatedView: {
        backgroundColor: "#333333",
        position: "absolute",
        bottom: 0,
        alignSelf: 'center',
        borderRadius: Sizes.fixPadding * 2.0,
        paddingHorizontal: Sizes.fixPadding + 5.0,
        paddingVertical: Sizes.fixPadding,
        justifyContent: "center",
        alignItems: "center",
    },
    uploadIconWrapStyle: {
        backgroundColor: Colors.whiteColor,
        width: 45.0,
        height: 45.0,
        // borderColor: Colors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22.5,
        position: 'relative'
    },
    ribbonContainer: {
        position: 'relative',
        flexDirection: 'row', // Align items horizontally
    },
    ribbon: {
        position: 'absolute',
        top: 0,
        right: -24,
        backgroundColor: 'blue',
        width: 20, // Adjust the size of the circle
        height: 20, // Adjust the size of the circle
        borderRadius: 50,
        zIndex: 1,
        color: '#fff',
        fontSize: 14, // Adjust the font size as needed
    },
});

export default BottomTabBarScreen;