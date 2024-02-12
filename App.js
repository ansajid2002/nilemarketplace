import 'react-native-gesture-handler';
// AAAAri-HKmQ:APA91bFXRwgqSfqYnsI629l84IJUQg7NoXg0-cgW_nq1vY-dvfOo3hWV-u_gQeybJwiCsfvvcyvAOgTmHpe2s7SrjX4POohoXI6fE5tHKp_RixMYjMzpMmrhgitoMGfsMbdGwZ3oFOrQ
// ProjectId -  nilenotification-3c74f
import React, { useEffect, useRef, useState } from 'react'
import { NavigationContainer, useIsFocused, useNavigation } from '@react-navigation/native';
import { TransitionPresets, createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from "./components/loadingScreen";
import categoriesItemsScreen from "./screens/categoriesItems/categoriesItemsScreen";
import userProfileScreen from "./screens/userProfile/userProfileScreen";
import searchResultsScreen from "./screens/searchResults/searchResultsScreen";
import aboutUsScreen from "./screens/aboutUs/aboutUsScreen";
import contactUsScreen from "./screens/contactUs/contactUsScreen";
import onboardingScreen from "./screens/onboarding/onboardingScreen";
import loginScreen from "./screens/auth/loginScreen";
import registerScreen from "./screens/auth/registerScreen";
import verificationScreen from "./screens/auth/verificationScreen";
/////redux/////////////
import { Provider } from 'react-redux';
import { store } from "./store/index"
import ServicesList from './screens/services/servicesList';
import Language from './screens/Language/Language';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n, { changeLanguage } from './services/i18next';

///////////////////////////////////////FORM SCREENS///////////////////////////////////////

import MyOrdersScreen from './screens/myorders/myOrders';
import CheckoutAddaddress from './screens/checkout/checkoutAddaddress';
import CheckoutPayment from './screens/checkout/checkoutPayment';
import Checkoutaddress from './screens/checkout/checkoutAddress';
import OrderdetailsScreen from './screens/myorders/OrderdetailsScreen';
import CheckoutPreview from './screens/checkout/checkoutPreview';
import Orderplaced from './screens/checkout/orderplaced';
import Pickinterest from './screens/pickInterest/Pickinterest';
import CountryScreen from './screens/Currency/CountryScreen';
import Slider from './components/Slider/Slider';
import ImageSlider from './components/Slider/ImageSlider';
import HomeSlider from './components/HomeSlider/HomeSlider';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from './screens/NoInternet';
import EditProfile from './screens/userProfile/EditProfile';
import Reviews from './screens/Reviews';
import SlideItem from './components/Slider/SlideItem';
import ForgotPassword from './screens/auth/ForgotPassword';
import ChangePassword from './screens/auth/ChangePassword';
import NotificationExpo from './screens/NotificationExpo';

import HomeScreen from './screens/home/homeScreen';
import SearchScreen from "./screens/search/searchScreen";
import ChatsScreen from "./screens/chats/chatsScreen";
import AccountScreen from "./screens/account/accountScreen";
import NotificationsScreen from "./screens/notifications/notificationsScreen";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import FavoriteAdScreen from './screens/favoriteAd/favoriteAdScreen';
import Carttab from './components/Carttab';
import Bottomsearch from './screens/search/Bottomsearch';
import productDetailScreen from "./screens/productDetail/productDetailScreen";
import { ActivityIndicator, BackHandler, Text, ToastAndroid } from 'react-native';
import Inbox from './screens/Inbox/inbox';
import InboxChatScreen from './screens/Inbox/InboxChatScreen';
import Channels from './screens/channels/Channels';
// import categoryProductList from './screens/categoriesItems/CategoryProductList';
import CategoryProductList from './screens/categoriesItems/CategoryProductList';
import ProductsList from './screens/services/productsList';
import Webviewcomponent from './components/Webviewcomponent';
import Wallet from './screens/wallet/Wallet';
import DownloadStatement from './screens/wallet/DownloadStatement';
import AddMoney from './screens/wallet/AddMoney';
import SendMoney from './screens/wallet/SendMoney';
import TransactionHistory from './screens/wallet/TransactionHistory';
import Raise from './screens/RaiseTicket/Raise';
import AddRaiseTicket from './screens/RaiseTicket/AddRaiseTicket';
import Mogadishudistrict from './screens/Currency/Mogadishudistrict';
import Returns from './screens/myorders/Returns';
import CancelOrder from './screens/myorders/CancelOrder';
import AsyncStorage from '@react-native-async-storage/async-storage';

///////////////////////////////////////FORM SCREENS///////////////////////////////////////

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();




const App = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const { t } = useTranslation()
  function HomeTabs() {
    return (
      <>
        <Tab.Navigator screenOptions={{
          activeTintColor: '#00008b', // Set the active color to yellow
          inactiveTintColor: 'rgb(50,50,50)', // Set the inactive color to gray (or any other color you prefer)
          style: { height: 40, paddingTop: 50 }
        }}
          backBehavior={'history'}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home-outline" size={28} color={color} />
              ),
              headerShown: false,
              tabBarLabel: `${t("Home")}`,
              tabBarLabelStyle: { fontSize: 10, marginBottom: 4, marginTop: 1, fontWeight: '600' },
            }}
          />
          <Tab.Screen
            name="Search"
            component={Bottomsearch}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="magnify" size={28} color={color} />
              ), headerShown: false,
              tabBarLabel: `${t("Search")}`,
              tabBarLabelStyle: { fontSize: 10, marginBottom: 4, marginTop: 1, fontWeight: '600' },
            }}

          />
          <Tab.Screen
            name="Categories"
            component={SearchScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="view-grid-outline" size={23} color={color} />
              ), headerShown: false,
              tabBarLabel: `${t("Categories")}`,
              tabBarLabelStyle: { fontSize: 10, marginBottom: 4, marginTop: 1, fontWeight: '600' },
            }}

          />

          <Tab.Screen
            name="Cart"
            component={ChatsScreen}
            options={({ route }) => ({
              tabBarIcon: ({ color, size }) => (
                <Carttab color={color} />
              ), headerShown: false,
              tabBarLabel: `${t("Cart")}`,
              tabBarLabelStyle: { fontSize: 10, marginBottom: 4, marginTop: 0, fontWeight: '600' },
            })}

          />
          <Tab.Screen
            name="Account"
            component={AccountScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="user" size={20} color={color} />
              ), headerShown: false,
              tabBarLabel: `${t("Account")}`,
              tabBarLabelStyle: { fontSize: 10, marginBottom: 4, marginTop: 1, fontWeight: '600' },
            }}

          />
        </Tab.Navigator></>
    );
  }
  useEffect(() => {

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadSelectedLang = async () => {
    try {
      const storedlangcode = await AsyncStorage.getItem('selectedLangcode');
      if (storedlangcode !== null) {
          changeLanguage(storedlangcode)
      }
    } catch (error) {
      console.error('Error loading selected country from AsyncStorage:', error);
    } finally {
      setLanguageLoaded(true); // Set languageLoaded to true after language is loaded
      setIsLoading(false); // Set isLoading to false
    }
  };

  // useEffect(() => {
  //   loadSelectedLang();
  // }, []);


  const Mainnavigator = () => {
    return (
      <Provider store={store}>
        <NavigationContainer>

          <NotificationExpo />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              ...TransitionPresets.SlideFromRightIOS,
            }}
          >
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="Home" component={HomeTabs} />


            <Stack.Screen name="Onboarding" component={onboardingScreen} />
            <Stack.Screen name="Login" component={loginScreen} options={{ ...TransitionPresets.DefaultTransition }} />
            <Stack.Screen name="Register" component={registerScreen} />
            <Stack.Screen name="Channel" component={Channels} />
            <Stack.Screen name="Verification" component={verificationScreen} />
            <Stack.Screen name="servicesList" component={ServicesList} />
            <Stack.Screen name="CategoriesItems" component={categoriesItemsScreen} />
            <Stack.Screen name="ProductDetail" component={productDetailScreen} />
            <Stack.Screen name="UserProfile" component={userProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="SearchResults" component={searchResultsScreen} />
            <Stack.Screen name="Wishlist" component={FavoriteAdScreen} />
            <Stack.Screen name="AboutUs" component={aboutUsScreen} />
            <Stack.Screen name="ContactUs" component={contactUsScreen} />
            <Stack.Screen name="SelectLanguage" component={Language} />
            <Stack.Screen name="SelectCountry" component={CountryScreen} />
            <Stack.Screen name="selectMogadishuDistrict" component={Mogadishudistrict} />
            <Stack.Screen name="WebviewComponent" component={Webviewcomponent} />


            {/* //////////////////////////////////////CHECKOUT////////////////////////////////////////// */}
            <Stack.Screen name="My Orders" component={MyOrdersScreen} />
            <Stack.Screen name="order details" component={OrderdetailsScreen} />
            <Stack.Screen name="Checkout Address" component={Checkoutaddress} />
            <Stack.Screen name="Checkout Add Address" component={CheckoutAddaddress} />
            <Stack.Screen name="Checkout Payment" component={CheckoutPayment} />
            <Stack.Screen name="Checkout Preview" component={CheckoutPreview} />
            <Stack.Screen name="Order Placed" component={Orderplaced} />
            <Stack.Screen name="Pick Interest" component={Pickinterest} />
            <Stack.Screen name="Slider" component={Slider} />
            <Stack.Screen name="SlideItem" component={SlideItem} />
            <Stack.Screen name="ImageSlider" component={ImageSlider} />
            <Stack.Screen name="HomeSlider" component={HomeSlider} />
            <Stack.Screen name="Reviews" component={Reviews} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />

            <Stack.Screen name="Notification" component={NotificationsScreen} />
            <Stack.Screen name="Wallet" component={Wallet} />
            <Stack.Screen name="AddMoney" component={AddMoney} />
            <Stack.Screen name="SendMoney" component={SendMoney} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
            <Stack.Screen name="DownloadStatement" component={DownloadStatement} />
            <Stack.Screen name="Inbox" component={Inbox} />
            <Stack.Screen name="InboxChatScreen" component={InboxChatScreen} />
            <Stack.Screen name="CategoryProductList" component={CategoryProductList} />
            <Stack.Screen name="productsList" component={ProductsList} />
            <Stack.Screen name="RaiseTicket" component={Raise} />
            <Stack.Screen name="AddRaiseTicket" component={AddRaiseTicket} />
            <Stack.Screen name="Returns" component={Returns} />
            <Stack.Screen name="CancelOrder" component={CancelOrder} />

          </Stack.Navigator>

        </NavigationContainer>
      </Provider>
    );
  }
  
 
  return (
    <I18nextProvider i18n={i18n}>
      {isConnected ? (
        <Mainnavigator />
      ) : (
        <NoInternet /> // Render the "no internet connection" component when there is no internet
      )}
    </I18nextProvider>
  )
}

export default App;