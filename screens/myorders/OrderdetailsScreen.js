import {ScrollView, View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'

import { Image } from 'react-native';
import { AdminUrl, HeaderBar } from '../../constant';
import { useTranslation } from 'react-i18next';
import Progress from '../../components/Progress';
import moment from 'moment/moment';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';
import { debounce } from "lodash";
import StarRating from '../../components/FiveStarRating';
import { productUrl } from '../../constant'
import { formatCurrency } from '../wallet/Wallet';
import AfterDeliverProcess from './components/AfterDeliverProcess';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import ProductListing from '../../components/ProductList';
import { ProductSkeleton } from '../../components/Skeleton';

const OrderdetailsScreen = ({ route, navigation }) => {
  const orderData = route.params
  const { street_address = '', first_name = '', last_name = '', apartment = '', phone_number = '', selected_city = '', selected_state = '', selected_country = '', zip_code = '' } = orderData.shipping_address?.[0] || []
  const dateParts = orderData?.tentative_delivery_date && orderData.tentative_delivery_date?.split(" ");
  const { brand_name, vendorname, email, company_city, company_country, business_phone, company_state, company_zip_code, shipping_address } = orderData?.vendor_details
  const { t } = useTranslation()
  // Extract the month and day values
  const month = dateParts[1];
  const day = dateParts[2];

  // Format the date as "Mon DD"
  const formattedDate = `${month} ${day}`;

  const [containerStyles, setContainerStyles] = useState({});
  const [similarproducts, setSimilar] = useState(null);

  // ref
  const bottomSheetModalRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["70%", "70%"], []);


  const handleSheetChanges = useCallback((index) => {
    if (index >= 0) {
      setContainerStyles(styles.container);
    } else {
      setContainerStyles({});
    }
  }, []);

  const buynow = (prod) => {
    setSimilar(prod)
    bottomSheetModalRef.current?.present();
  }


  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} />,
    []
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
      <ScrollView className="bg-white">
        <HeaderBar title={'Order Details'} goback={true} navigation={navigation} />

        <View className="border-t border-b border-gray-300 py-4 px-4">
          <Text className="text-base tracking-wider text-gray-700 font-light">Order ID - {orderData?.orderid}</Text>
        </View>

        <View className="flex-row items-center justify-around bg-white p-4">

          <View className="flex-1">
            <Text className="text-lg">
              {orderData?.product_name}
              {/* {
                orderData?.tentative_delivery_date &&
                  orderData?.order_status != 'Ordered' || orderData?.order_status != 'Shipped' ? 'Arriving on ' + formattedDate : orderData?.order_status
              } */}
            </Text>
            <Text className="text-sm tracking-wider text-gray-600">{orderData?.label || ''}</Text>
            <Text className="text-sm tracking-wider text-gray-600">Seller: {brand_name || vendorname}</Text>
            <Text className="text-xl tracking-wider py-2 font-semibold">{formatCurrency(orderData?.total_amount)}</Text>
            <Text className="text-sm tracking-widest text-gray-700">
              {
                orderData?.ispickup
                  ? orderData?.order_status === 'Picked'
                    ? orderData?.order_status
                    : 'Pickup before or on ' + formattedDate
                  : (orderData?.tentative_delivery_date &&
                    orderData?.order_status !== 'Delivered' &&
                    orderData?.order_status !== 'Picked' &&
                    orderData?.order_status !== 'Ordered' &&
                    orderData?.order_status !== 'Shipped')
                    ? 'Arriving on ' + formattedDate
                    : orderData?.order_status
              }

            </Text>
          </View>
          <Image className="mr-2"
            resizeMode='contain'
            source={{ uri: `${productUrl}/${orderData.product_image}` }}
            style={{ width: 80, height: 80 }}
          />
        </View>

        <View className={`border-t-4 border-b-4 p-4 border-gray-200 space-y-1 ${(orderData?.order_status === 'Delivered' || orderData?.order_status === 'Picked') && 'bg-green-700'}`}>
          {
            orderData?.order_status === 'Delivered' || orderData?.order_status === 'Picked' ?
              <>
                <Text className="text-lg text-green-100 font-semibold tracking-widest">Order {orderData?.order_status} successfully...</Text>

              </> : <>
                <Text className="text-base font-semibold">
                  OTP for {orderData?.ispickup ? 'pickup' : 'delivery'}:
                  <Text className="text-lg font-semibold">{orderData?.ispickup ? orderData?.seller_otp : orderData?.customer_otp}</Text>
                </Text>
                <Text>
                  {orderData?.ispickup
                    ? 'Tell this PIN to the shop owner to confirm pickup'
                    : 'Tell this PIN to the delivery agent to get the delivery'}
                </Text>
              </>
          }
        </View>

        <View className="flex-row justify-center  py-4 w-full border-b space-y-10 border-gray-200">
          {
            (orderData?.order_status === 'Delivered' || orderData?.order_status === 'Picked') &&
            <StarRating size='4xl' enable={true} order_id={orderData?.order_id} rating={orderData?.ratings_and_reviews?.[0]?.rating || 0} onRatingChange={() => { }} ratingData={orderData?.ratings_and_reviews} item={orderData} />
          }

        </View>
        <AfterDeliverProcess orderData={orderData} productName={orderData?.product_name} orderID={orderData?.orderid} callBACKBuySimilar={buynow} status={orderData?.order_status} uniqueid={orderData?.product_uniqueid} />

        <Progress displayStatus={`${orderData.order_status}, ${moment(orderData?.created_at).format('ll')}`} orderData={orderData} orderStatus={orderData.order_status} pickup={orderData.ispickup} />

        {/* <View className="flex-row bg-white">
          {orderData.order_status !== 'Returned' && orderData.order_status !== 'Exchanged' && orderData.order_status !== 'Canceled' &&
            <TouchableOpacity className="mx-2 rounded-md w-1/2  mt-2 mb-2 py-2 ">
              <Text className="text-sm  text-center">{t("CANCEL")}</Text>
            </TouchableOpacity>
          }
          <TouchableOpacity className="mx-2 rounded-md  w-1/2 mt-2 mb-2 py-2 ">
            <Text className="text-sm  text-center">{t("Get Help ?")}</Text>
          </TouchableOpacity>
        </View> */}

        {
          orderData?.shipping_address && orderData?.shipping_address?.length > 0 && <View className="border-t-4 border-b-4 border-gray-200 mt-4">
            {/* <Text className="text-[#00008b] font-bold text-xl mb-2 ">{t("Shipping Address")}</Text> */}
            <View className="border-b p-4 border-gray-300 ">
              <Text className="text-sm tracking-widest text-gray-600">{t("Shipping Address")}</Text>
            </View>
            <View className="px-4 py-2">
              <Text className="text-lg font-semibold tracking-wider">{first_name} {last_name}</Text>

              {/* <Text className="text-base">{street}</Text> */}
              {apartment && <Text className="text-base">{street_address}, {apartment}</Text>}
              {selected_state && <Text className="text-base">{`${selected_state}, ${selected_city || ''}, ${zip_code || ''}`}</Text>}
              {selected_country && <Text className="text-base">{selected_country}</Text>}
              {
                phone_number &&
                <Text className="text-base">{`Phone Number: ${phone_number}`}</Text>
              }
            </View>
          </View>
        }

        {
          orderData?.ispickup &&
          <View className="border-t-4 border-b-4 border-gray-200 mt-4">
            <View className="border-b p-4 border-gray-300 ">
              <Text className="text-sm tracking-widest text-gray-600">Pickup Address</Text>
            </View>
            <View className="p-4">
              <View className="flex-row">
                <Image
                  source={require("../../assets/images/smiley.png")}
                  className="w-5 h-5 mt-2"
                  resizeMode='contain'
                />
                <View className="ml-4" style={{ width: Dimensions.get('window').width - 60 }}>
                  <Text className="text-xl font-semibold tracking-widest">{`${brand_name || vendorname}`}</Text>
                  <Text className="text-lg tracking-widest text-gray-600">{email}</Text>
                  {
                    shipping_address &&
                    <Text className="text-lg tracking-widest text-gray-600">{`${shipping_address || ''}`}</Text>
                  }
                  <Text className="text-lg tracking-widest text-gray-600">{`${company_city || ''}, ${company_state || ''}, ${company_zip_code || ''}`}</Text>
                  <Text className="text-lg tracking-widest text-gray-600">{company_country || ''}</Text>
                  <Text className="text-lg tracking-widest text-gray-600">{business_phone || ''}</Text>
                </View>
              </View>
            </View>
          </View>
        }
        <View className="bg-white">
          {/* <Text className="text-[#00008b] font-bold text-xl px-2">{t("Payment Information")}</Text> */}
          <View className="border-b p-4 border-gray-300 ">
            <Text className="text-sm tracking-widest text-gray-600">{t("Payment Information")}</Text>
          </View>
          <View className="rounded-md border-gray-400 py-4 px-4 ">
            <Text className="text-lg">{`Payment Method : ${orderData.payment_method}`}</Text>
          </View>
        </View>

      </ScrollView>

      <BottomSheetModalProvider>
        <View style={containerStyles}>

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            backdropComponent={renderBackdrop}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {
                !similarproducts ?
                  <View className="py-4">
                    <View className="animate-pulse w-1/2 ml-2 my-3" style={{ height: 15, borderRadius: 5, backgroundColor: '#e0e0e0' }}></View>
                    <View className="flex-row">
                      {
                        [1, 2, 3, 4, , 5, 6].map(item => ProductSkeleton())
                      }
                    </View>
                  </View>
                  : similarproducts?.length > 0 ?
                    <ProductListing title={`Similar Products for ${orderData?.product_name}`} productList={similarproducts} /> : <Text>No Similar Products Found</Text>
              }
            </ScrollView>
          </BottomSheetModal>
        </View>
      </BottomSheetModalProvider>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

})

export default OrderdetailsScreen