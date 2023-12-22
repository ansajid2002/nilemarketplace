import React, { useEffect, useState } from "react";
import { SafeAreaView, View, ScrollView, StatusBar, Image, StyleSheet, Text, TouchableOpacity, Linking } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { Overlay } from "@rneui/themed";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emptyCart } from "../../store/slices/cartSlice";
import { emptyCustomer } from "../../store/slices/customerData";
import { MaterialIcons } from '@expo/vector-icons';
import { emptyAddress } from "../../store/slices/customerSlice";
import { AdminUrl, HeaderBar } from "../../constant";
import { emptyOrder } from "../../store/slices/myordersSlice";
import { emptyWishlist } from "../../store/slices/wishlistSlice";
import FullPageLoader from "../../components/FullPageLoader";
import { Link, useNavigation } from "@react-navigation/native";


const AccountScreen = ({ navigation }) => {
    const dispatch = useDispatch()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const { selectedLangname } = useSelector((store) => store.selectedLang)
    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const { customerData } = useSelector((store) => store.userData)
    const { appcountry } = useSelector((store) => store.selectedCurrency)
    const { t } = useTranslation();
    const wishlistItems = useSelector((state) => state.wishlist.wishlistItems)

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 500);
    }, [])

    return (
        <>
            {
                loading ? <FullPageLoader /> : <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
                    <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
                    <View style={{ flex: 1 }}>
                        {
                            customerData?.length > 0 ?
                                <>
                                    <HeaderBar title={'Account'} navigation={navigation} goback={false} />

                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingBottom: Sizes.fixPadding * 1.0, }}
                                    >
                                        {accountInfo()}

                                        {accountOptions()}
                                        {logoutOption()}
                                    </ScrollView>
                                    {logoutDialog()}
                                </>
                                : <>
                                    <Text className="font-medium text-xl text-center mt-4 mb-1">Sign In For Better Experience</Text>
                                    <View className="bg-[#fb7701] rounded-full mb-3 mx-4 mt-3">

                                        <TouchableOpacity className=" mx-auto flex-row items-center">
                                            {/* <MaterialCommunityIcons name="login" size={25} color={Colors.whiteColor} /> */}
                                            <Text className="text-xl px-4 py-2.5 text-white font-bold rounded "
                                                onPress={debounce(() => navigation.push("Login"), 500)}>Sign in / Register</Text>
                                        </TouchableOpacity>

                                    </View>
                                    <ScrollView showsVerticalScrollIndicator={false}
                                        contentContainerStyle={{ paddingBottom: Sizes.fixPadding * 7.0, }}>
                                        {accountOptions()}
                                    </ScrollView>
                                </>
                        }
                    </View>
                </SafeAreaView>
            }
        </>
    )

    function logoutDialog() {
        return (
            <Overlay
                isVisible={showLogoutDialog}
                onBackdropPress={() => setShowLogoutDialog(false)}
                overlayStyle={{ width: '80%', padding: 0.0, borderRadius: Sizes.fixPadding - 5.0 }}
            >
                <View style={styles.dialogWrapStyle}>
                    <Text style={{ ...Fonts.blackColor16SemiBold, }}>
                        {t("Sure you want to Logout?")}
                    </Text>
                    <View style={{ marginHorizontal: Sizes.fixPadding, marginTop: Sizes.fixPadding * 2.0, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={debounce(() => setShowLogoutDialog(false), 500)}
                            style={styles.cancelButtonStyle}
                        >
                            <Text style={{ ...Fonts.primaryColor14Bold }}>
                                {("CANCEL")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={debounce(async () => {
                                // Clear both AsyncStorage values
                                try {
                                    // await AsyncStorage.removeItem('loggedid');
                                    await AsyncStorage.removeItem('customerData');
                                    await AsyncStorage.removeItem('cartData');
                                    dispatch(emptyCustomer())
                                    dispatch(emptyCart())
                                    dispatch(emptyOrder())
                                    dispatch(emptyAddress())
                                    dispatch(emptyWishlist())
                                    setShowLogoutDialog(false);
                                    // navigation.push('Login');
                                } catch (error) {
                                    console.error('Error clearing AsyncStorage:', error);
                                }
                            }, 500)}
                            style={styles.logoutButtonStyle}
                        >
                            <Text style={{ ...Fonts.whiteColor14Bold }}>{("LOGOUT")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Overlay>
        )
    }

    function logoutOption() {
        return (
            <TouchableOpacity onPress={debounce(() => setShowLogoutDialog(true), 500)}
                activeOpacity={0.9}

                className="ml-2 px-4 py-4 "
                style={{ flexDirection: 'row', alignItems: 'center' }}
            >
                <Image
                    resizeMode="contain"
                    source={require('../../assets/images/icons/logout.png')}
                    style={{ width: 18.0, height: 18.0, resizeMode: 'contain' }}
                />
                <TouchableOpacity >

                    <Text style={{ marginLeft: Sizes.fixPadding, ...Fonts.primaryColor14SemiBold }}>{t("Logout")}</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        )
    }

    function accountOptions() {
        return (
            <>

                {accountOptionsSort({
                    icon: <MaterialIcons name="person" color={Colors.blackColor} size={20} />,
                    option: 'Profile',
                    navigateTo: customerData?.length > 0 ? 'EditProfile' : "Login"
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="forward-to-inbox" color={Colors.blackColor} size={20} />,
                    option: 'Inbox',
                    navigateTo: customerData?.length > 0 ? 'Inbox' : "Login"
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="map" color={Colors.blackColor} size={20} />,
                    option: `${t("Manage Address")}`,
                    navigateTo: customerData?.length > 0 ? 'Checkout Address' : "Login"
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="store" size={20} color={Colors.blackColor} />,
                    option: 'Become a Seller'
                })}


                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="assignment" size={20} color={Colors.blackColor} />,
                    option: 'My Orders',
                    navigateTo: customerData?.length > 0 ? 'My Orders' : "Login"
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="favorite" size={20} color={Colors.blackColor} />,
                    option: `${t("Wishlist")} (${wishlistItems?.length})`,
                    navigateTo: customerData?.length > 0 ? 'Wishlist' : 'Login'
                })}
                {divider()}
                {customerData?.length > 0 && (
                    accountOptionsSort({
                        icon: <MaterialIcons name="check-circle" size={20} color={Colors.blackColor} />,
                        option: 'My Interests',
                        navigateTo: 'Pick Interest'
                    })
                )}
                {divider()}
                {/* {accountOptionsSort({
                    icon: <MaterialIcons name="notifications" size={18} color={Colors.blackColor} />,
                    option: 'Notifications',
                    navigateTo: 'Notifications'
                })}
                {divider()} */}
                {accountOptionsSort({
                    icon: <MaterialIcons name="public" size={20} color={Colors.blackColor} />,
                    option: `${t("Country / Region")}`,
                    navigateTo: 'SelectCountry',
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="language" size={20} color={Colors.blackColor} />,
                    option: 'Language',
                    navigateTo: 'SelectLanguage',
                })}
                {divider()}
                {/* {accountOptionsSort({
                    icon: <MaterialIcons name="attach-money" size={18} color={Colors.blackColor} />,
                    option: 'Currency',
                    navigateTo: 'SelectCurrency',
                })}
                {divider()} */}
                {accountOptionsSort({
                    icon: <MaterialIcons name="info" size={20} color={Colors.blackColor} />,
                    option: 'About us',
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="email" size={20} color={Colors.blackColor} />,
                    option: 'Contact us',
                })}
                {divider()}
            </>
        )
    }

    function accountOptionsSort({ icon, option, navigateTo }) {
        if (option === "Become a Seller") {
            return (
                <TouchableOpacity className=""
                    activeOpacity={0.9}
                    onPress={debounce(async () => {
                        setLoading(true);
                        try {
                            const externalURL = 'https://admin.nilegmp.com/seller'; // Replace with your URL
                            const supported = await Linking.canOpenURL(externalURL);
                            if (supported) {
                                await Linking.openURL(externalURL);
                            } else {
                                console.log("Can't handle URL: " + externalURL);
                            }
                        } catch (error) {
                            console.error('Error opening URL:', error);
                        }
                        setLoading(false);
                    }, 500)}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
                >
                    {icon}
                    <View  className="flex-row ">
                        <Text className="" style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold }}>
                            {t(`${option}`)}
                        </Text>
                    </View>

                </TouchableOpacity>
            )
        }
        else if (option === "About us") {
            return (
                <TouchableOpacity
                activeOpacity={0.9}
                className=""
                onPress={debounce(async () => {
                    setLoading(true);
                    try {
                        const externalURL = 'https://stg.nilegmp.com/company/about-us'; // Replace with your URL
                        const supported = await Linking.canOpenURL(externalURL);
                        if (supported) {
                            await Linking.openURL(externalURL);
                        } else {
                            console.log("Can't handle URL: " + externalURL);
                        }
                    } catch (error) {
                        console.error('Error opening URL:', error);
                    }
                    setLoading(false);
                }, 500)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
            >
                {icon}
                <View  className="flex-row ">
                    <Text className="" style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold }}>
                        {t(`${option}`)}
                    </Text>
                </View>

            </TouchableOpacity>
            )
        }
        else if (option === "Contact us") {
            return (
                <TouchableOpacity
                className=""
                activeOpacity={0.9}
                onPress={debounce(async () => {
                    setLoading(true);
                    try {
                        const externalURL = 'https://stg.nilegmp.com/company/contact-us'; // Replace with your URL
                        const supported = await Linking.canOpenURL(externalURL);
                        if (supported) {
                            await Linking.openURL(externalURL);
                        } else {
                            console.log("Can't handle URL: " + externalURL);
                        }
                    } catch (error) {
                        console.error('Error opening URL:', error);
                    }
                    setLoading(false);
                }, 500)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
            >
                {icon}
                <View  className="flex-row ">
                    <Text className="" style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold }}>
                        {t(`${option}`)}
                    </Text>
                </View>

            </TouchableOpacity>
            )
        }
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                className=""
                onPress={debounce(() => {
                    setLoading(true)
                    navigation.push(navigateTo, navigateTo == "EditProfile" && customerData)
                    setLoading(false)
                }, 500)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0, }}
            >
                {icon}
                <View  className="flex-row ">
                    <Text style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold }}>
                        {t(`${option}`)}
                    </Text>
                    {option === "Language" && <Text className="ml-3 font-bold text-sm tracking-wider">{`(${selectedLangname})`} </Text>}
                    {option === "Currency" && <Text className="ml-3 font-bold text-sm tracking-wider">{`(${currencyCode})`} </Text>}
                    {option === "Country / Region" && <Text className="ml-3 font-bold text-sm tracking-wider ">{`(${appcountry})`} </Text>}
                </View>

            </TouchableOpacity>
        );
    }

    function divider() {
        return (
            <View
                style={{ backgroundColor: Colors.lightGrayColor, height: 1.0, marginHorizontal: Sizes.fixPadding * 2.0, }}
            />
        )
    }

    function accountInfo() {
        const { family_name, given_name, city, country, state, picture, google_id } = customerData?.[0]

        let placeholderImageUrl = 'https://www.sfb1425.uni-freiburg.de/wp-content/uploads/2021/05/dummy-profile-pic-360x360.png';

        if (!google_id && picture) {
            placeholderImageUrl = `${AdminUrl}/uploads/customerProfileImages/${picture}`
        } else if (picture) {
            placeholderImageUrl = picture
        }
        // useEffect(() => {

        //     if (picture) {
        //       if (google_id && google_id.trim() !== "" || !picture.startsWith("https")) {
        //         setImage(`${AdminUrl}/uploads/customerProfileImages/${picture}`);
        //       } else {
        //         setImage(picture);
        //       }
        //     } else {
        //       setImage("/avatarplaceholder.png");
        //     }
        //   }, [customerData, picture, google_id]);



        return (
            <View style={styles.accountInfoWrapStyle}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        resizeMode="contain"
                        source={{ uri: placeholderImageUrl }}
                        style={{
                            width: 50.0,
                            height: 50.0,
                            borderRadius: 25.0,
                        }}
                    />
                    <View style={{ flex: 1, marginLeft: Sizes.fixPadding, }}>
                        <Text style={{ ...Fonts.blackColor16SemiBold }}>
                            {given_name} {family_name}
                        </Text>
                        {
                            city || state && <Text style={{ ...Fonts.grayColor12Medium }}>
                                {city}, {state}
                            </Text>
                        }
                    </View>
                </View>

            </View>
        )
    }
}

const styles = StyleSheet.create({
    
    accountInfoWrapStyle: {
        margin: Sizes.fixPadding * 2.0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dialogWrapStyle: {
        borderRadius: Sizes.fixPadding - 5.0,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        padding: Sizes.fixPadding * 2.0,
    },
    cancelButtonStyle: {
        backgroundColor: Colors.whiteColor,
        elevation: 2.0,
        borderColor: '#ececec',
        borderWidth: 1.0,
        paddingVertical: Sizes.fixPadding + 2.0,
        marginHorizontal: Sizes.fixPadding,
        borderRadius: Sizes.fixPadding - 5.0,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonStyle: {
        flex: 1,
        marginHorizontal: Sizes.fixPadding,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        paddingVertical: Sizes.fixPadding + 2.0,
        borderRadius: Sizes.fixPadding - 5.0,
        elevation: 5.0,
        shadowColor: Colors.primaryColor,
        borderColor: 'rgba(75, 44, 32, 0.5)',
        borderWidth: 1.0,
    }
});

export default AccountScreen;