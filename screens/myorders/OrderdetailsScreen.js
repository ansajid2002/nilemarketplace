import { ScrollView, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import { RadioButton } from 'react-native-paper';
import axios from 'axios';

const OrderStatusMessage = ({ orderData }) => {
  const currentDate = new Date();
  const tentativeDeliveryDate = new Date(orderData?.tentative_delivery_date);

  // Check if tentative delivery date has passed
  const isTentativeDeliveryDatePassed = tentativeDeliveryDate < currentDate;

  const createdDate = new Date(orderData?.created_at);
  const timeDifference = currentDate - createdDate;
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  let statusMessage = '';

  if ((orderData?.order_status === 'Ordered' || orderData?.order_status === 'Confirmed') && daysDifference >= 5) {
    statusMessage = "Item has been ordered but the status has not changed for a while. Please contact the seller.";
  } else if ((orderData?.order_status === 'Ordered' || orderData?.order_status === 'Confirmed') && daysDifference === 1) {
    statusMessage = "Item was just ordered.";
  } else if (isTentativeDeliveryDatePassed) {
    statusMessage = "Tentative delivery date has passed.";
  } else {
    statusMessage = `Your item is ${orderData?.order_status}.`;
  }

  return (
    <Text className="text-xl">{statusMessage}</Text>
  );
};



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
  const [type, setType] = useState('');
  const [loader, setLoader] = useState(false);

  // ref
  const bottomSheetModalRef = useRef(null);

  // variables
  const snapPoints = useMemo(() => ["70%", "90%"], []);


  const handleSheetChanges = useCallback((index) => {
    if (index >= 0) {
      setContainerStyles(styles.container);
    } else {
      setContainerStyles({});
    }
  }, []);

  const buynow = (prod) => {
    setSimilar(prod)
    setType('product')
    bottomSheetModalRef.current?.present();
  }


  const renderBackdrop = useCallback(
    (props) => <BottomSheetBackdrop {...props} />,
    []
  );

  let message = '';

  if (orderData?.ispickup) {
    if (orderData?.order_status === 'Picked') {
      message = orderData?.order_status;
    } else {
      message = 'Pickup before or on ' + formattedDate;
    }
  } else {
    if (orderData?.tentative_delivery_date && orderData?.order_status !== 'Delivered') {
      let deliveryMessage = '';
      if (!['Delivered', 'Picked', 'Returned', 'Refunded', 'Exchanged', 'Cancelled'].includes(orderData?.order_status)) {
        if (orderData?.order_status !== 'Ordered') {
          if (orderData?.order_status !== 'Shipped') {
            deliveryMessage = 'Arriving on ' + formattedDate;
          } else {
            deliveryMessage = orderData?.order_status;
          }
        } else {
          deliveryMessage = orderData?.order_status;
        }
        message = `${deliveryMessage} - Tentative delivery date: ${orderData?.tentative_delivery_date}`;
      }
    }
  }


  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.2;
  const contentWidth = screenWidth * 0.8;

  const CustomRadioButton = ({ value, selected, onSelect }) => {
    return (
      <TouchableOpacity onPress={() => onSelect(value)}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: selected ? 'blue' : 'black',
              backgroundColor: selected ? 'blue' : 'transparent',
              marginRight: 10,
            }}
          />
          <Text>{value}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const RequestOptions = () => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [requestText, setRequestText] = useState('');
    const [loader, setLoader] = useState(false);
    const [arrived_Data_Text, setArrivedData_text] = useState(null)

    const fetchData = async () => {
      try {
        const response = await axios.get(`${AdminUrl}/api/itemsNotReceivedByOrderId/${orderData?.order_id}`);
        // console.log(); // Log the data to the console
        setArrivedData_text(response.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    useEffect(() => {
      fetchData();
    }, []);

    const handleOptionChange = (value) => {
      setSelectedOption(value);
    };

    const handleRequest = async () => {
      try {
        if (!selectedOption) return;
        if (requestText?.length === 0) return;

        const { vendor_id, customer_id, product_uniqueid, order_id } = orderData;

        setLoader(true);

        // Prepare the current date and time
        const currentDateTime = new Date().toISOString();

        // Prepare the data object to send to the backend
        const requestData = {
          vendor_id,
          customer_id,
          order_id,
          product_uniqueid,
          selected_option: selectedOption,
          request_text: requestText,
          created_at_request: currentDateTime, // Add the current date and time
        };

        // Send the request to the backend endpoint
        const response = await axios.post(`${AdminUrl}/api/handleRequestforArrived`, requestData);

        // Check if the response is successful
        if (response.status === 200) {
          setRequestText('')
          setSelectedOption(null)
          // Show a success message using an alert
          alert('Request submitted successfully. The vendor has been notified.');
          fetchData()
        }
      } catch (error) {
        console.error('Error handling request:', error);
      } finally {
        setLoader(false);
      }
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior for iOS and Android
      >
        <View className="px-4 py-4 space-y-5">
          <Text className="mb-4 text-xl font-semibold">Select what you'd like to request</Text>

          <CustomRadioButton value="I'd still like the item" selected={selectedOption === "I'd still like the item"} onSelect={handleOptionChange} />
          <CustomRadioButton value="I'd like a refund" selected={selectedOption === "I'd like a refund"} onSelect={handleOptionChange} />

          {/* Render TextInput when a radio button is selected */}
          {selectedOption && (
            <TextInput
              value={requestText}
              onChangeText={setRequestText}
              placeholder="Enter your request..."
              multiline={true}
              numberOfLines={6}
              style={{
                backgroundColor: '#E5E7EB',
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginTop: 8,
                borderColor: '#D1D5DB',
                borderWidth: 2,
                borderRadius: 8,
                textAlignVertical: 'top', // This will align the text at the top
                paddingTop: 16 // This will add padding at the top to push the text downwards
              }}
            />
          )}

          <TouchableOpacity style={{ marginTop: 10 }} onPress={handleRequest}>
            <View style={{ backgroundColor: '#D1D5DB', padding: 16, borderRadius: 9999 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4B5563', textAlign: 'center' }}>
                {loader ? <ActivityIndicator color='black' /> : 'Send Request'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="px-4 py-4">
          {arrived_Data_Text && arrived_Data_Text.map(item => (
            <View key={item.id}>
              <View style={{ marginLeft: 16 }}>
                {JSON.parse(item.request_text)?.map((text, index) => (
                  <View className="space-y-1 py-2">
                    {index === 0 && <Text style={{ fontWeight: 'bold' }} className="text-lg text-gray-500 mb-2">Request Text</Text>}
                    <Text key={index}>{text?.text} <Text className="text-xs italic text-gray-400">{moment(text.created_at).format('LLL')}</Text></Text>

                  </View>
                ))}

                {JSON.parse(item.response_text_from_seller)?.map((text, index) => (
                  <View className="space-y-1 py-2">
                    {index === 0 && <Text style={{ fontWeight: 'bold' }} className="text-lg text-gray-500 mb-2">Seller Reply</Text>}
                    <Text key={index}>{text?.text} <Text className="text-xs italic text-gray-400">{moment(text.created_at).format('LLL')}</Text></Text>

                  </View>
                ))}


              </View>
            </View>
          ))}

        </View>


      </KeyboardAvoidingView>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
      <ScrollView className="bg-white">
        <HeaderBar title={'Order Details'} goback={true} navigation={navigation} />

        <View className="border-t border-b border-gray-300 py-2 px-4 space-y-1">
          <Text className="text-base tracking-wider text-gray-700 font-semibold">Order ID - {orderData?.orderid}</Text>
          <Text className="text-xs tracking-wider text-gray-500 font-light">Order Date - {moment(orderData?.created_at).format('LLL')}</Text>
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
              {message}
            </Text>
          </View>
          <Image className="mr-2"
            resizeMode='contain'
            source={{ uri: `${productUrl}/${orderData.product_image}` }}
            style={{ width: 80, height: 80 }}
          />
        </View>

        <View className={`border-t-4 border-b-4 p-4 border-gray-200 space-y-1 ${(orderData?.order_status === 'Delivered' || orderData?.order_status === 'Returned' || orderData?.order_status === 'Picked') && 'bg-green-700'}`}>
          {
            orderData?.order_status === 'Delivered' || orderData?.order_status === 'Returned' || orderData?.order_status === 'Picked' ?
              <>
                <Text className="text-lg text-green-100 font-semibold tracking-widest">Order {orderData?.order_status} successfully.</Text>
              </>
              : orderData?.order_status.startsWith('Retu') ?
                <>
                  <Text className="text-base font-semibold">
                    OTP for return:
                    <Text className="text-lg font-semibold mr-2"> {orderData?.return_otp}</Text>
                  </Text>
                  <Text>Tell this PIN to the delivery agent for the return process.</Text>
                </>
                :
                <>
                  <Text className="text-base font-semibold">
                    OTP for {orderData?.ispickup ? 'pickup' : 'delivery'}:
                    <Text className="text-lg font-semibold mr-2"> {orderData?.ispickup ? orderData?.seller_otp : orderData?.customer_otp}</Text>
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

        {
          (orderData?.order_status === 'Ordered' || orderData?.order_status === 'Confirmed' || orderData?.order_status === 'Shipped' || orderData?.order_status === 'Out for Delivery') && <View className="px-4 pt-4">
            <TouchableOpacity onPress={() => {
              setType('notarrived')
              bottomSheetModalRef.current?.present();
            }}>
              <Text className="text-blue-500 text-base tracking-wide font-semibold">Item hasn't arrived {orderData?.order_status}</Text>
            </TouchableOpacity>
          </View>

        }
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
                type === 'product' ?
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
                  : <>
                    <View className="flex-row justify-center items-center py-2">
                      <Text className="text-xl font-semibold">Item hasn't arrived</Text>
                    </View>
                    <View className="flex-row justify-between h-24 m-4">
                      {/* Flex container for image */}
                      <View style={[{ width: imageWidth }]} className="h-24">
                        <Image className="w-full h-full rounded-md" source={{ uri: `${productUrl}/${orderData?.product_image}` }} resizeMode="cover" />
                      </View>
                      {/* Flex container for content */}
                      <View style={[{ width: contentWidth }]} className="px-4 py-2 gap-y-2">
                        <Text numberOfLines={2} className="text-base tracking-widest font-semibold text-black">
                          {orderData?.product_name}
                        </Text>
                        <Text className="text-sm tracking-widest text-black">
                          Order - {orderData?.orderid}
                        </Text>
                      </View>
                    </View>

                    <View className="px-4 space-y-2">
                      <OrderStatusMessage orderData={orderData} />
                      <Text className="text-justify leading-5 ">If the item is not found, please consider checking other areas in and around your residence, building, or mailbox vicinity, and also inquire with neighbors. If you're still unable to locate it, you may request assistance from the seller. They will have up to three business days to respond before you can request our intervention.</Text>
                    </View>

                    <View className="px-4 pt-5">
                      <Text className="text-lg font-semibold tracking-wide">
                        Tracking Details
                      </Text>
                    </View>
                    <Progress displayStatus={`${orderData.order_status}, ${moment(orderData?.created_at).format('ll')}`} orderData={orderData} orderStatus={orderData.order_status} pickup={orderData.ispickup} />

                    <RequestOptions />
                  </>
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