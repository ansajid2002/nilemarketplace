import { useState, useEffect, useRef } from 'react';
import { Platform, Text } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import { BackHandler } from 'react-native';
import { fetchcart, getCartTotal } from '../store/slices/cartSlice';
import { AdminUrl } from '../constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAppLang, setAppLangname } from '../store/slices/currencySlice';
import { changeLanguage } from '../services/i18next';

const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error, executionInfo }) => {
    // Do something with the notification data
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const storeNotification = async (customerId, notificationType,  message, time) => {
    await fetch(`${AdminUrl}/api/storeNotification`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, notification_type: notificationType,  message, timestamp:time }),
    });
};

export async function sendNotificationWithNavigation(title, body, screenName) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            data: {
                screen: screenName, // Specify the screen to navigate to
            },
       
        },
        trigger: { seconds: 2 },
    });
  
}


const NotificationExpo = () => {
    const dispatch = useDispatch()
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();
    const navigation = useNavigation();
    const lastBackPressed = useRef(0);
    const [cartTotal, setCartTotal] = useState(null)
    const [cartData, setCartData] = useState(false)
    const [loading, setLoading] = useState(false)
    const [langFetched,setLangfetched] = useState(false)

    const { customerData } = useSelector((store) => store.userData)
    const customerId = customerData[0]?.customer_id


    const handleBackPress = () => {
        const currentRoute = navigation.getCurrentRoute();
        if (currentRoute && currentRoute.name === 'Home') {
            const currentTime = new Date().getTime();
            if (currentTime - lastBackPressed.current < 2000) {
                // If the last back press was less than 2 seconds ago, exit the app
                BackHandler.exitApp();
            } else {
                // Show a toast message
                Toast.show({
                    type: 'info',
                    text1: 'Press again to exit',
                });
                lastBackPressed.current = currentTime;
            }
            return true;
        }
        return false

    };

    const getCartTotaldata = async () => {
        try {
            console.log("1");
            console.log("Fetching cart total...");
            let cartTotal = 0;
    
            if (!customerId) {
                console.log("No customer ID, checking local storage...");
                const storedCartTotal = await AsyncStorage.getItem("cartTotal");
                if (storedCartTotal) {
                    cartTotal = Number(storedCartTotal);
                    console.log("Cart total found in local storage:", cartTotal);
                }
            } else {
                console.log("Customer ID found, fetching from server...");
                const urlWithCustomerId = `${AdminUrl}/api/cartTotal?customer_id=${customerId}`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
    
                const response = await fetch(urlWithCustomerId, requestOptions);
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                cartTotal = data.total;
                console.log("Cart total from server:", cartTotal);
    
                if (cartTotal === 0) {
                    console.log("Empty cart, sending notification...");
                    await sendNotificationWithNavigation('🛒 EMPTY CART  🙁', 'Your cart is empty. Add something to your cart and enjoy your shopping experience! 🛍️', '');
                    storeNotification(customerId,"CART",`🛒 EMPTY CART  🙁', 'Your cart is empty. Add something to your cart and enjoy your shopping experience! 🛍️`,new Date().toISOString())
                } else {
                    console.log("Cart has items, sending checkout notification...");
                    await sendNotificationWithNavigation('🛒 Checkout 🛍️', `You have ${cartTotal} items in your cart. Ready to complete your purchase? 💳`, '');
                    storeNotification(customerId,"CHECKOUT",`🛒 Checdsgtrsrtgffvkout 🛍️ You have ${cartTotal} items in your cart. Ready to complete your purchase?  💳`,new Date().toISOString())
               console.log("done 10")
                }
    
                // Update local storage with the latest cart total
                await AsyncStorage.setItem('cartTotal', JSON.stringify(cartTotal));
            }
    
            // Update the state with the latest cart total
            setCartTotal(cartTotal);
        } catch (error) {
            console.error("Error while fetching cart total:", error);
        }
    };
    // useEffect(() => {
    //     if (!langFetched) {
    //         loadSelectedLang()
    //     }
    //     if (!cartTotal && langFetched) {
    //         fetchCartData()
    //         getCartTotaldata()
    //     }
    // }, [langFetched,customerId])

    const loadSelectedLang = async () => {
        try {
          const storedlangcode = await AsyncStorage.getItem('selectedLangcode');
          if (storedlangcode !== null) {
              changeLanguage(storedlangcode)
              dispatch(setAppLang(storedlangcode));
          }
          const storedCountry = await AsyncStorage.getItem('selectedLangname');            
          if (storedCountry !== null) {
            dispatch(setAppLangname(storedCountry));
          }
        } catch (error) {
          console.error('Error loading selected country from AsyncStorage:', error);
        }
        finally {
          setLangfetched(true)
        }
      };

    const fetchCartData = async () => {
        setLoading(true)
        try {
            if (!customerId) {

            }
            else {
                const urlWithCustomerId = `${AdminUrl}/api/cart?customer_id=${customerId}`;
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                };
                // Send the GET request and await the response
                const response = await fetch(urlWithCustomerId, requestOptions);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json()
                dispatch(fetchcart(data))
                setCartData(true)
            }

        } catch (error) {
            // Handle any errors here
            console.error('Error fetching cart sdata:', error);
        }
        finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        const unsubscribe = navigation.addListener('state', () => {
            const currentRoute = navigation.getCurrentRoute();

            if (currentRoute && currentRoute.name === 'Home') {
                const currentScreenName = currentRoute.name;

                BackHandler.addEventListener('hardwareBackPress', handleBackPress);

                return () => {
                    unsubscribe();
                    // Remove the back press event listener when the component unmounts
                    BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
                };
            }
        });

        // Add the back press event listener

    }, [navigation]);



    useEffect(() => {
        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            // Extract the screen name from the notification data
            const screenName = response.notification.request.content.data.screen;
            console.log(screenName,"screennNNAmwe");
            // Navigate to the specified screen
            if (screenName) {
                navigation.navigate(screenName);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [navigation]);


    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);
    return <>

    </>
}

export default NotificationExpo




async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            sound: 'ss.mp3',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        token = (await Notifications.getExpoPushTokenAsync({ projectId: '1f48b0a9-28c3-4e6e-a391-6a8660929fd0' })).data;
    } else {
        // alert('Must use physical device for Push Notifications');
    }

    return token;
}