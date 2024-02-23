import { View, Text, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { FlatList } from 'react-native';
import { Colors, Sizes } from '../../constants/styles';
import { TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import { StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
// import {storeNotification} from "../NotificationExpo"
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useState } from 'react';
import { AdminUrl, HeaderBar } from '../../constant';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import { emptyCart } from '../../store/slices/cartSlice';
import { addOrders } from '../../store/slices/myordersSlice';
import { ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { sendNotificationWithNavigation, storeNotification } from '../NotificationExpo';
import { debounce } from 'lodash';
import { SafeAreaView } from 'react-native';
import { formatCurrency } from '../wallet/Wallet';
import { getwalletTotal } from '../../store/slices/walletSlice';
import { productUrl } from '../../constant'
import SlideToAction from '../../components/Slidetoaction';

const CheckoutPreview = ({ route, navigation }) => {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('Wallet');
  const [showLoader, setshowLoader] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [status, setStatus] = useState(false);


  const handleCouponCodeChange = (event) => {
    setCouponCode(event.target.value);
  };
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const { cartItems, checkoutItems } = useSelector((store) => store.cart)
  const { walletTotal } = useSelector((store) => store.wallet)

  const { customerData } = useSelector((store) => store.userData)
  const customerEmail = customerData[0]?.email
  const { somalian_district } = useSelector((store) => store.customerAddress)
  const [shippingRate, setShippingrate] = useState(0)
  const { c_symbol, currencyCode,appLangcode } = useSelector((store) => store.selectedCurrency)
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const shippingAddress = route.params
  const { given_name_address = "", family_name_address = "", apt_address = "", subregion_address = "", city_address = "", country_address = "", region_address = "", zip_address = "", phone_address = "" } = shippingAddress || []

  const customerId = customerData[0]?.customer_id;
  const date = new Date();
  const order_date = date.toISOString();



  useEffect(() => {
    if (cartItems?.length === 0) {
      navigation.navigate("Home");
    }
  }, [cartItems]);

  const handlePaymentModeChange = (mode) => {
    setSelectedPaymentMode(mode);
  };

  const FullScreenLoader = () => {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>{t("Loading...")}</Text>
      </View>
    );
  };

  const makePayment = async () => {
    setshowLoader(true)
    try {
      // Define the request body, including the amount
      const requestBody = JSON.stringify({
        amount: Math.floor((cartTotalSellingPrice - cartDiscount + shippingRate).toFixed(2) * 100), // Amount in cents (e.g., 2000 for $20.00)
        email: customerEmail,
        currencyCode
        // Add other parameters as needed
      });

      const response = await fetch(`${AdminUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const clientSecret = responseData?.paymentIntent?.client_secret;
      checkoutData[0].paymentIntent = responseData.paymentIntent;
      setshowLoader(false)

      // Continue with payment confirmation using the clientSecret
      handlePayment(clientSecret);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const handlePayment = async (clientSecret) => {
    const { error: paymentSheetError } = await initPaymentSheet({
      merchantDisplayName: 'Nile Global Market-Place',
      paymentIntentClientSecret: clientSecret,
      style: 'alwaysDark',
      paymentMethodTypes: ['card', 'applePay', 'googlePay'], // Include the wallet types you want
    });

    if (paymentSheetError) {
      Alert.alert('Something went wrong', paymentSheetError.message);
      setStatus(true)

      return;
    }

    const { error: paymentError } = await presentPaymentSheet();


    if (paymentError) {
      Alert.alert(`Error code: ${paymentError.code}`, paymentError.message);
      setStatus(true)
      return;
    }
    setshowLoader(true)
    // Alert.alert('Payment Successful', 'Your payment was successful. Thank you!');
    try {
      const response = await fetch(`${AdminUrl}/api/Insertorders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any other headers as needed
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      const shippingAddressMap = responseData.insertedAddress.reduce((map, address) => {
        if (!map[address.unique_order_id]) {
          map[address.unique_order_id] = [];
        }
        map[address.unique_order_id].push(address);
        return map;
      }, {});

      // Add shipping_address as an array to each order
      const ordersWithShippingAddress = responseData.insertedOrders.map(order => ({
        ...order,
        shipping_address: shippingAddressMap[order.order_id] || [],
      }));


      dispatch(emptyCart());
      dispatch(addOrders(ordersWithShippingAddress))
      await sendNotificationWithNavigation(`🛍️ Order Placed', 'Your order has been successfully placed. Thank you for shopping with us!`, 'My Orders');
      storeNotification(customerId, "ORDERPLACED", `🛍️ Order Placed', 'Your order has been successfully placed. Thank you for shopping with us!`, new Date().toISOString())
      setStatus(false)

      navigation.push('Order Placed', responseData)
      setshowLoader(false)

      // Handle the response data as needed
    } catch (error) {
      console.error('Error inserting order:', error);
      Alert.alert('Error', 'An error occurred while inserting the order.');
      setshowLoader(false)
    }
  };

  const RadioButton = ({ selected }) => (
    <View className="border  rounded-full mr-2">
      <View style={{ width: 12, height: 12, borderRadius: 12, margin: 4, borderWidth: 2, borderColor: selected ? 'blue' : 'gray', backgroundColor: selected ? 'blue' : 'gray' }} />
    </View>
  );

  ////////////////FROM CART//////////////////////////////////////////////////////////
  // const Total = cartItems?.map(item => item?.sellingprice * item?.added_quantity).reduce((prevValue, currValue) => prevValue + currValue, 0);
  // const cartTotal = parseFloat(Total.toFixed(2))

  // const TotalSellingPrice = cartItems?.map(item => item?.sellingprice * item?.added_quantity).reduce((prevValue, currValue) => prevValue + currValue, 0);

  // const TotalMRP = cartItems?.map(item => item?.mrp * item?.added_quantity).reduce((prevValue, currValue) => prevValue + currValue, 0);

  // const cartTotalSellingPrice = parseFloat(TotalSellingPrice.toFixed(2));
  // const cartTotalMRP = parseFloat(TotalMRP.toFixed(2));
  // const cartDiscount = 0

  const calculateTotal = (property) => {
    return cartItems?.map(item => item[property] * item?.added_quantity).reduce((prevValue, currValue) => prevValue + currValue, 0);
  };

  const TotalSellingPrice = calculateTotal('sellingprice');
  const TotalMRP = calculateTotal('mrp');

  const cartTotalSellingPrice = parseFloat(TotalSellingPrice?.toFixed(2));
  const cartTotalMRP = parseFloat(TotalMRP?.toFixed(2));
  const cartDiscount = 0;


  const calculateTotalShippingCharges = async (cartItems, destination) => {
    let totalShippingCharges = 0;
    const processedVendors = {};

    for (const item of cartItems) {
      const origin = item?.vendorInfo?.company_district;
      const vendorId = item.vendor_id;

      // Skip items with null origin
      if (origin) {
        const vendorKey = `${vendorId}_${origin}`;

        if (!processedVendors[vendorKey]) {
          try {
            const response = await fetch(`${AdminUrl}/api/getShippingRate?origin=${origin}&destination=${destination}`);

            if (response.ok) {
              const data = await response.json();

              if (data.rate !== 0) {
                totalShippingCharges += data.rate;
              }

              // Mark the combination of vendor_id and origin as processed
              processedVendors[vendorKey] = true;
            } else {
              console.log("Fetching failed for item with id", item.id);
            }
          } catch (error) {
            console.error("Error fetching rates for item with id", item.id, error);
          }
        }
      }
    }

    return totalShippingCharges;
  };


  const checkoutData = [
    {
      orders: cartItems,
      shipping_address: shippingAddress,
      customerData: customerData[0],
      paymentIntent: [],
      selectedPaymentMode,
      checkoutItems,
      order_date,
      shippingRate
    }
  ]
  // Use the function in your component
  useEffect(() => {
    if (somalian_district && cartItems
      .filter(item => !checkoutItems.includes(item.uniquepid)).length > 0) {
      calculateTotalShippingCharges(cartItems
        .filter(item => !checkoutItems.includes(item.uniquepid)), somalian_district)
        .then(totalShippingCharges => {
          setShippingrate(totalShippingCharges);
          checkoutData[0].shippingRate = totalShippingCharges
        })
        .catch(error => {
          console.error("Error calculating total shipping charges", error);
        });
    }
  }, [somalian_district, cartItems]);

  const Cartdetails = () => {
    return (
      <View className="m-1 p-2 mt-2 ">
        <Text className="text-[18px] font-medium mb-2">{t("Price Details")}</Text>
        <View className="flex-row justify-between items-center  my-1 py-0.5">
          <Text className="text-[14px]">{t("Price")}</Text>
          <Text className="text-[16px]  font-normal">{`${c_symbol} ${cartTotalMRP}`}</Text>
        </View>
        <View className="flex-row justify-between items-center  my-1 py-0.5">
          <Text className="text-[14px]">{t("Shipping Charges")}</Text>
          <Text className="text-[16px]  font-normal">{`${c_symbol} ${shippingRate}`}</Text>
        </View>
        <View className="flex-row justify-between items-center items  ">
          <Text className="text-[14px]">{t("Discount")}</Text>
          <Text className="text-[16px] text-green-600 font-medium">{`-${(((cartTotalMRP - cartTotalSellingPrice) / cartTotalMRP) * 100).toFixed(2)} %`} ({`${c_symbol}${(cartTotalMRP - cartTotalSellingPrice).toFixed(2)}`})</Text>
        </View>

        <View className="flex-row justify-between items-center  my-2 py-1.5 border-t border-gray-200">
          <Text className="text-base font-medium">{t("Total Amount")}</Text>
          <Text className="text-[16px] font-medium">{`${c_symbol} ${(cartTotalSellingPrice - cartDiscount + shippingRate).toFixed(2)}`}</Text>
        </View>
        <Text className="text-[16px] text-green-600 font-medium tracking-wider ">{` ${t("You will save")} ${c_symbol} ${(cartTotalSellingPrice - cartDiscount + shippingRate).toFixed(2)} ${t("on this order")}`}</Text>
      </View>
    )
  }

  const applycoupon = () => {
    return (
      <View className="bg-white my-1 mt-1 py-4 p-2">
        <Text className="text-[18px] font-medium  mx-1">{t("Apply Coupon")}</Text>

        <View className="flex-row items-center mt-4 mx-1 space-x-3 h-9">
          <TextInput className="flex-1 tracking-wider border border-gray-500 h-9 rounded-md pl-2 text-base" placeholder={t('Enter Coupon Code')}
            onChange={handleCouponCodeChange}
          />
          <TouchableOpacity className="border bg-gray-100 border-gray-400 h-full rounded-md flex-row items-center px-1.5"><Text className="font-semibold">{t("Apply")}</Text></TouchableOpacity>
        </View>
      </View>
    )
  }
  const renderItem = ({ item }) => {
    const discountPercentageSimple = ((item.mrp - item.sellingprice) / item.mrp) * 100;

    return (
      <View className="  py-1.5 bg-white border  border-gray-200  px-1 ">

        <TouchableOpacity className="flex-row  rounded-sm p-2  ">
          <View style={{ width: 110, overflow: 'hidden' }} className="m-auto ">
            <Image
              resizeMode="contain"
              source={
                item.images
                  ? { uri: `${productUrl}/${item.images[0]}` }
                  : require('../../assets/noimage.jpg')
              }

              defaultSource={require('../../assets/noimage.jpg')}

              style={{ width: '100%', height: undefined, aspectRatio: 4 / 4 }} className="rounded-md"
            />
          </View>
          <View className=" flex-1 ml-4 " >

            <Text numberOfLines={2} className="text-base font-medium">
            {appLangcode === "so" ?  
                    item?.somali_ad_title=== "" ? item?.ad_title : item?.somali_ad_title  :
                     item?.ad_title}
            </Text>
            <Text className=" font-bold text-gray-500">{`Qty ${item?.added_quantity}`}</Text>
            {
              item.label && <Text className="text-[14px] text-gray-500 ">{item.label.split("/").join(" / ")}</Text>
            }

            <View className="gap-1" style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4 }}>
              <Text className="text-base font-medium text-gray-700">Price:</Text>
              {discountPercentageSimple && discountPercentageSimple > 0 && (
                <Text className="text-base" style={{ color: 'green' }}>-{discountPercentageSimple?.toFixed(2)}%</Text>
              )}
              <View className="flex-row items-center ">
                <Text className="text-base ml-1.5 mr-0.5 font-medium">{`${c_symbol}`}</Text>
                <Text className="text-gray-900 text-base" style={{ fontWeight: 'bold' }}>
                  {`${item.sellingprice % 1 === 0 ? Math.trunc(item.sellingprice) : item.sellingprice}`}
                </Text>
              </View>
            </View>
            {
              discountPercentageSimple !== 0 &&
              <View className="flex-row items-center">
                <Text className="text-gray-500 font-medium">{t("List Price: ")}</Text>
                <Text style={styles.mrpPrice} className="font-medium">
                  {`$${item.mrp % 1 === 0 ? Math.trunc(item.mrp) : item.mrp}`}
                </Text>
              </View>
            }

          </View>

        </TouchableOpacity>

      </View>
    )
  }
  ////////////////FROM CART//////////////////////////////////////////////////////////
  const handlePaymentSubmit = async () => {
  
      setshowLoader(true)
      setStatus(true)

      try {
        const response = await fetch(`${AdminUrl}/api/Insertorders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any other headers as needed
          },
          body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        const shippingAddressMap = responseData.insertedAddress.reduce((map, address) => {
          if (!map[address.unique_order_id]) {
            map[address.unique_order_id] = [];
          }
          map[address.unique_order_id].push(address);
          return map;
        }, {});

        // Add shipping_address as an array to each order
        const ordersWithShippingAddress = responseData.insertedOrders.map(order => ({
          ...order,
          shipping_address: shippingAddressMap[order.order_id] || [],
        }));


        dispatch(emptyCart());
        dispatch(addOrders(ordersWithShippingAddress))
        if (selectedPaymentMode === 'Wallet') dispatch(getwalletTotal(walletTotal - (cartTotalSellingPrice - cartDiscount)))
        await sendNotificationWithNavigation('🛍️ Order Placed', 'Your order has been successfully placed. Thank you for shopping with us!', 'My Orders');
        storeNotification(customerId, "ORDERPLACED", `🛍️ Order Placed', 'Your order has been successfully placed. Thank you for shopping with us!`, new Date().toISOString())

        navigation.push('Order Placed', responseData)
        setshowLoader(false)

        // Handle the response data as needed
      } catch (error) {
        console.error('Error inserting order:', error);
        Alert.alert('Error', 'An error occurred while inserting the order.');
        setshowLoader(false)
        setStatus(false)

      }
    
  }
  // Define ListFooterComponent
  const ListFooterComponent = () => (
    <View className=" my-1">
      {
        cartItems
          .filter(item => !checkoutItems.includes(item.uniquepid)).length !== 0 &&

        <View className="bg-white p-2">
          <Text className="text-[18px] font-medium mb-2 mx-1">{t("Delivery Address")}</Text>

          <View className=" rounded-lg shadow-sm px-3 py-1">
            <Text className="text-[16px] font-medium tracking-wider">{given_name_address} {family_name_address}</Text>

            <Text className="text-[16px] my-0.5 ">{apt_address}</Text>
            <Text className="text-[16px] my-0.5">{city_address}</Text>
            {
              (region_address && subregion_address) &&
              <Text className="text-[16px] my-0.5 uppercase">{`${subregion_address}, ${region_address}, ${zip_address}`}</Text>
            }
            <Text className="text-[16px] my-0.5">{country_address}</Text>
            {
              phone_address &&
              <Text className="text-[16px] my-0.5"><Feather name="phone-call" size={16} color="black" />   {`${phone_address}`}</Text>
            }
          </View>

        </View>}
      {applycoupon()}
      {Cartdetails()}
      <View style={{ marginVertical: 10, backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{t("Choose Payment Mode")}</Text>

        {/* <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}
          onPress={() => handlePaymentModeChange('Stripe')}
        >
          <RadioButton selected={selectedPaymentMode === 'Stripe'} />
          <Text style={{ fontSize: 16, marginLeft: 8, color: selectedPaymentMode === 'Stripe' ? 'black' : 'gray' }}>Stripe</Text>
        </TouchableOpacity> */}
        <View className="flex-row items-center">

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}
          onPress={() => handlePaymentModeChange('Wallet')}
        >
          <RadioButton selected={selectedPaymentMode === 'Wallet'} />
          <Text style={{ fontSize: 16, marginLeft: 8, color: selectedPaymentMode === 'Wallet' ? 'black' : 'gray' }}>Wallet ({formatCurrency(walletTotal)})</Text>
        </TouchableOpacity>
{
    walletTotal === 0 &&
        <TouchableOpacity onPress={() => navigation.navigate("AddMoney")}>


        <Text className="text-red-600 font-semibold ml-1 mr-0.5"> Recharge</Text>
        {/* <MaterialCommunityIcons name="share" color="#e53935" /> */}
        </TouchableOpacity>
}
        </View>
      </View>
    </View>
  );

  const shouldRenderButton = selectedPaymentMode === 'Wallet' && walletTotal >= (cartTotalSellingPrice - cartDiscount);

  const pickupItems = cartItems
    .filter(item => checkoutItems.includes(item.uniquepid))
    .map(item => ({
      vendorid: item.vendorid,
      vendorInfo: item.vendorInfo, // Replace with your logic to get vendorInfo
      item: item
    }))
    .reduce((groups, entry) => {
      const existingGroup = groups.find(group => group.vendorid === entry.vendorid);

      if (existingGroup) {
        existingGroup.Items.push(entry.item);
      } else {
        groups.push({ vendorid: entry.vendorid, vendorInfo: entry.vendorInfo, Items: [entry.item] });
      }

      return groups;
    }, []);

  const hanleSwipe = (status) => {
    console.log(status, 'status');
    status && handlePaymentSubmit()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
      {
        showLoader && <FullScreenLoader />
      }
      {/* <StripeProvider
        publishableKey="pk_test_51NyX2ELOvL7BZfFQr5Ie3hElBBFVYu8ML70jVRCOKMtrgfmd52QGW6hms6fgZyCrVNYRFQEQ9VtsZKNgwe8mkj31007MetaQ5I"
      > */}
        <HeaderBar title={'Order Summary'} goback={true} navigation={navigation} searchEnable={false} cartEnable={false} />
        <ScrollView className="" showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          {/* <FlatList
          className="mt-1"
          data={cartItems}
          keyExtractor={(item) => `${item.uniquepid}`}
          renderItem={renderItem}
          // contentContainerStyle={{ paddingHorizontal: Sizes.fixPadding + 1.0 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<ListFooterComponent />}
        /> */}
          <View>
            <View>
              {
                pickupItems?.length !== 0 &&
                <Text className="text-xl font-bold italic mx-4 mt-6 mb-2 text-[#00008b]">Items For Pickup</Text>
              }
              {
                pickupItems?.map((single, index) => {
                  return (
                    <View key={index} className="border-b border-black pb-3 ">
                      <View className="border-t mt-1">
                        {
                          single.Items?.map(item => renderItem({ item }))
                        }
                        <View className=" mx-3">
                          <Text className="text-lg font-bold my-1">{t("Pickup Info")}</Text>
                          <Text className="text-base font-medium">{single?.vendorInfo?.vendorname}</Text>
                          <Text className="text-base">{single?.vendorInfo?.brand_name}</Text>
                          <Text className="text-base">{single?.vendorInfo?.mobile_number}</Text>
                          <Text className="text-base">{single?.vendorInfo?.shipping_address}</Text>
                        </View>
                      </View>
                    </View>
                  )
                })
              }
            </View>
            <View>
              {
                cartItems
                  .filter(item => !checkoutItems.includes(item.uniquepid)).length !== 0 &&
                <Text className="text-xl font-bold text-[#00008b] italic mx-4 mt-6 mb-2">{t("Items For Shipping")}</Text>
              }
              {
                cartItems
                  .filter(item => !checkoutItems.includes(item.uniquepid))
                  .map(item => renderItem({ item }))
              }
              {


                <ListFooterComponent />
              }
            </View>

          </View>
        </ScrollView>


        {
          !shouldRenderButton && selectedPaymentMode === 'Wallet' ?
            <View className="p-4 bg-gray-100 flex-row justify-center">
              <Text className="text-red-500 text-xl">{t("Insufficent Balance")}</Text>
            </View>
            :
            <SlideToAction onSwipe={hanleSwipe} status={status} text={`Swipe to Pay (${formatCurrency((cartTotalSellingPrice - cartDiscount + shippingRate))})`} />
          // <TouchableOpacity className="bg-[#00008b] " onPress={debounce(() => handlePaymentSubmit(), 500)}>
          //   <Text className="text-[22px]  py-2 pb-3  tracking-widest rounded-md  text-center text-white font-bold">
          //     {` ${t("Pay")} $${(cartTotalSellingPrice - cartDiscount + shippingRate).toFixed(2)}`} </Text>
          // </TouchableOpacity>
        }
      {/* </StripeProvider> */}
    </SafeAreaView>

  )
}


const styles = StyleSheet.create({
  headerWrapStyle: {
    padding: Sizes.fixPadding * 2.0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryColor,
    borderBottomLeftRadius: Sizes.fixPadding + 5.0,
    borderBottomRightRadius: Sizes.fixPadding + 5.0,
  },
  container: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowRadius: 2,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 2,
    paddingBottom: 4,

  },
  buttonText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',

  },
  count: {
    marginHorizontal: 15,
    fontSize: 20,
    fontWeight: 'bold',
  },
})


export default CheckoutPreview