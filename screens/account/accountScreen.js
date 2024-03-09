import React, { useEffect, useState } from "react";
import { SafeAreaView, View, ScrollView, StatusBar, Image, StyleSheet, Text, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { Overlay } from "@rneui/themed";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emptyCart, getCartTotal } from "../../store/slices/cartSlice";
import { emptyCustomer } from "../../store/slices/customerData";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { emptyAddress } from "../../store/slices/customerSlice";
import { AdminUrl, HeaderBar } from "../../constant";
import { emptyOrder } from "../../store/slices/myordersSlice";
import { emptyWishlist } from "../../store/slices/wishlistSlice";
import FullPageLoader from "../../components/FullPageLoader";
import avatarPlaceholder from '../../assets/avatarplaceholder.png'
import { getwalletTotal } from "../../store/slices/walletSlice";
import WalletTab from "../../components/WalletTab";
import { formatCurrency } from "../wallet/Wallet";



const AccountScreen = ({ navigation }) => {
    const dispatch = useDispatch()
    const walletTotal = useSelector(state => state.wallet.walletTotal);

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [LogoutLoader, setLogoutLoader] = useState(false);
    const { selectedLangname } = useSelector((store) => store.selectedLang)
    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const { customerData } = useSelector((store) => store.userData)
    const { appcountry } = useSelector((store) => store.selectedCurrency)
    const { t } = useTranslation();
    const wishlistItems = useSelector((state) => state.wishlist.wishlistItems)
    const { family_name = '', given_name = '', city = '', state = '', picture = '', google_id = '', customer_id } = customerData?.[0] || {}
    const [profileImage, setImage] = useState('../../assets/avatarplaceholder.png');
    const { appLangname } = useSelector((store) => store.selectedCurrency)
    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 500);
    }, [])

    useEffect(() => {

        console.log(google_id && google_id.trim() !== "" || !picture.startsWith("https"));
        if (picture) {
            if (google_id && google_id.trim() !== "" && !picture.startsWith("https")) {
                setImage(`${AdminUrl}/uploads/customerProfileImages/${picture}`);
            } else {
                setImage(picture);
            }
        } else {
            setImage('../../assets/avatarplaceholder.png');
        }
    }, [customerData, picture, google_id]);


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
                                    <Text className="font-medium text-xl text-center mt-4 mb-1">{t("Sign In For Better Experience")}</Text>

                                    <TouchableOpacity style={{ borderRadius: 20 }} onPress={debounce(() => navigation.push("Login"), 500)} className=" bg-[#fb7701] flex-row items-center my-2 mx-3 ">
                                        {/* <MaterialCommunityIcons name="login" size={25} color={Colors.whiteColor} /> */}
                                        <Text className="text-xl px-4 w-full py-2.5 text-white font-bold rounded text-center "
                                        >{t("Sign in / Register")}</Text>
                                    </TouchableOpacity>

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
                animationType="slide"
                transparent={true}
                onBackdropPress={() => setShowLogoutDialog(false)}
                overlayStyle={{ width: '80%', padding: 0.0, borderRadius: Sizes.fixPadding - 5.0 }}
            >
                <View style={styles.dialogWrapStyle}>
                    <Text style={{ ...Fonts.blackColor16SemiBold, }}>
                        {t("Sure you want to Logout?")}
                    </Text>
                    <View
                        className="space-x-2"
                        style={{ marginHorizontal: Sizes.fixPadding, marginTop: Sizes.fixPadding * 2.0, flexDirection: 'row', alignItems: 'center', }}>
                        <TouchableOpacity
                            style={{ borderRadius: 5 }}
                            activeOpacity={0.9}
                            onPress={debounce(() => setShowLogoutDialog(false), 500)}
                            className="flex-1 bg-gray-200 py-3"
                        >
                            <Text className="text-center text-base font-semibold">
                                {t("CANCEL")}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ borderRadius: 5 }}
                            className="flex-1 bg-[#fb7701] py-3 h-12"
                            activeOpacity={0.9}
                            onPress={debounce(async () => {
                                // Clear both AsyncStorage values
                                setLogoutLoader(true)
                                try {
                                    await AsyncStorage.removeItem('loggedid');
                                    await AsyncStorage.removeItem('customerData');
                                    await AsyncStorage.removeItem('cartData');
                                    await AsyncStorage.removeItem('cartTotal');
                                    await AsyncStorage.removeItem('@agreed');
                                    dispatch(emptyCustomer())
                                    dispatch(getCartTotal(0))
                                    dispatch(getwalletTotal(0))
                                    dispatch(emptyCart())
                                    dispatch(emptyOrder())
                                    dispatch(emptyAddress())
                                    dispatch(emptyWishlist())
                                    // NativeModules.DevSettings.reload();
                                    setShowLogoutDialog(false);

                                } catch (error) {
                                    console.error('Error clearing AsyncStorage:', error);
                                }
                                finally {
                                    setLogoutLoader(false)
                                }
                            }, 500)}
                        >
                            <View>
                                {
                                    LogoutLoader ?
                                        <ActivityIndicator color={'white'} /> :
                                        <Text className=" text-center  text-base font-semibold">{t("LOGOUT")}</Text>
                                }

                            </View>
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


                <Text style={{ marginLeft: Sizes.fixPadding, ...Fonts.primaryColor14SemiBold }}>{t("Logout")}</Text>
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
                    icon: <MaterialIcons name="wallet" color={Colors.blackColor} size={20} />,
                    option: `Wallet (${formatCurrency(walletTotal)})`,
                    navigateTo: customerData?.length > 0 ? 'Wallet' : "Login"
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="forward-to-inbox" color={Colors.blackColor} size={20} />,
                    option: `${t("Inbox")}`,
                    navigateTo: customerData?.length > 0 ? 'Inbox' : "Login"
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="map" color={Colors.blackColor} size={20} />,
                    option: `${t("Manage Address")}`,
                    navigateTo: customerData?.length > 0 ? 'Address' : "Login"
                })}
                {divider()}
                {accountOptionsSort({
                    icon: <MaterialIcons name="store" size={20} color={Colors.blackColor} />,
                    option: `Become a Seller`
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
                {accountOptionsSort({
                    icon: <FontAwesome name="hand-grab-o" color={Colors.blackColor} size={20} />,
                    option: `${t("Raise Ticket")}`,
                    navigateTo: customerData?.length > 0 ? 'RaiseTicket' : "Login"
                })}
                {divider()}
                {customerData?.length > 0 && (
                    accountOptionsSort({
                        icon: <MaterialIcons name="check-circle" size={20} color={Colors.blackColor} />,
                        option: `${t("My Interests")}`,
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
                {
                    appcountry === "Somalia" &&
                    accountOptionsSort({
                        icon: <MaterialIcons name="public" size={20} color={Colors.blackColor} />,
                        option: `${t("Select Mogadishu District")}`,
                        navigateTo: 'selectMogadishuDistrict',
                    })
                }
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
                {accountOptionsSort({
                    icon: <MaterialIcons name="policy" size={20} color={Colors.blackColor} />,
                    option: 'Privacy Policy',
                })}
                {divider()}

                {accountOptionsSort({
                    icon: <MaterialIcons name="settings" size={20} color={Colors.blackColor} />,
                    option: `${t("Settings")} `,
                    navigateTo: 'Settings'
                })}
                {divider()}

                {accountOptionsSort({
                    icon: <MaterialIcons name="policy" size={20} color={Colors.blackColor} />,
                    option: 'Terms & Conditions',
                })}
                {divider()}

            </>
        )
    }

    function accountOptionsSort({ icon, option, navigateTo }) {
        if (option === "Become a Seller") {
            return (

                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
                    onPress={() => navigation.navigate("WebviewComponent", { externalUri: 'https://admin.nilegmp.com/seller' })}>
                    {icon}
                    <View className="flex-row ">
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
                    style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
                    onPress={() => navigation.navigate("WebviewComponent", { externalUri: 'https://stg.nilegmp.com/company/about-us' })}>
                    {icon}
                    <View className="flex-row ">
                        <Text className="" style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold }}>
                            {t(`${option}`)}
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        }
        else if (option === "Terms & Conditions") {
            return (

                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
                    onPress={() => navigation.navigate("WebviewComponent", { externalUri: 'https://stg.nilegmp.com/company/terms-conditions' })}>
                    {icon}
                    <View className="flex-row ">
                        <Text className="" style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold }}>
                            {t(`${option}`)}
                        </Text>
                    </View>
                </TouchableOpacity>
            )
        }
        else if (option === "Privacy Policy") {
            return (

                <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
                    onPress={() => navigation.navigate("WebviewComponent", { externalUri: 'https://stg.nilegmp.com/company/privacy-policy' })}>
                    {icon}
                    <View className="flex-row ">
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
                    style={{ flexDirection: 'row', alignItems: 'center', padding: Sizes.fixPadding * 2.0 }}
                    onPress={() => navigation.navigate("WebviewComponent", { externalUri: 'https://stg.nilegmp.com/company/contact-us' })}>
                    {icon}
                    <View className="flex-row ">
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
                <View className="flex-row ">
                    <Text style={{ marginLeft: Sizes.fixPadding, ...Fonts.blackColor14SemiBold }}>
                        {t(`${option}`)}
                    </Text>
                    {option === "Language" && <Text className="ml-3 font-bold text-sm tracking-wider">{`(${appLangname})`} </Text>}
                    {option === t("Currency") && <Text className="ml-3 font-bold text-sm tracking-wider">{`(${currencyCode})`} </Text>}
                    {option === t("Country / Region") && <Text className="ml-3 font-bold text-sm tracking-wider ">{`(${appcountry})`} </Text>}
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
        return (
            <View style={styles.accountInfoWrapStyle}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        resizeMode="contain"
                        source={profileImage ? { uri: profileImage } : { uri: avatarPlaceholder }}
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
                            state && <>
                                <Text style={{ ...Fonts.grayColor12Medium }}>
                                    {city || ''}, {state || ''}
                                </Text>
                            </>
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