import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler';
import { Image } from 'react-native';
import { CheckBox } from '@rneui/base';
import { AdminUrl } from '../../constant';
import { useTranslation } from 'react-i18next';
import Progress from '../../components/Progress';
import moment from 'moment/moment';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';
import { debounce } from "lodash";

const OrderdetailsScreen = ({ route }) => {
  const orderData = route.params
  const { street_address, first_name, last_name, apartment, phone_number, selected_city, selected_state, selected_country, zip_code } = orderData.shipping_address?.[0]
  const dateParts = orderData?.tentative_delivery_date && orderData.tentative_delivery_date?.split(" ");
  const { t } = useTranslation()
  // Extract the month and day values
  const month = dateParts[1];
  const day = dateParts[2];

  // Format the date as "Mon DD"
  const formattedDate = `${month} ${day}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
    <ScrollView className="">

      <View className="flex-row items-center justify-around px-2 py-6 mb-2 bg-white">
        <Text className="text-[22px] font-bold text-[#00008b]">
          {
            orderData?.tentative_delivery_date &&
              orderData?.order_status != 'Ordered' || orderData?.order_status != 'Shipped' ? 'Arriving on ' + formattedDate : orderData?.order_status
          }
        </Text>
        <Image className="mr-2"
          resizeMode='contain'
          source={{ uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${orderData.product_image}` }}
          style={{ width: 100, height: 100 }}
        />

      </View>

      <Progress orderStatus={'Out for Delivery'} />
      {/* <View className="bg-white mb-2">
        <View className="flex-row items-center">
          <CheckBox checked size={30} checkedColor='#00008b' />
          <Text className="text-xl">Ordered Today</Text>
        </View>
        <View className="h-4 border w-1 flex-row items-center justify-center mx-7 -my-1 bg-[#00008b]"></View>
        <View className="h-4 border w-1 flex-row items-center justify-center mx-7 mt-4 bg-[#00008b]"></View>
        <View className="flex-row items-center">
          <CheckBox checked size={30} checkedColor='#00008b' />
          <Text className="text-xl ">Shipped</Text>
        </View>
        <View className="h-4 border w-1 flex-row items-center justify-center mx-7 -my-1 "></View>
        <View className="h-4 border w-1 flex-row items-center justify-center mx-7 mt-4"></View>
        <View className="flex-row items-center">
          <CheckBox size={30} checkedColor='#00008b' />
          <Text className="text-xl">Out For Delivery</Text>
        </View>
        <View className="h-4 border w-1 flex-row items-center justify-center mx-7 -my-1 "></View>
        <View className="h-4 border w-1 flex-row items-center justify-center mx-7 mt-4"></View>
        <View className="flex-row items-center">
          <CheckBox size={30} checkedColor='#00008b' />
          <Text className="text-xl">Arriving 9 October</Text>
        </View>

      </View> */}

      <View className="flex-row bg-white">
        {orderData.order_status !== 'Returned' && orderData.order_status !== 'Exchanged' && orderData.order_status !== 'Canceled' &&
          <TouchableOpacity className="mx-2 rounded-md w-1/2  mt-2 mb-2 py-2 ">
            <Text className="text-sm  text-center">{t("CANCEL")}</Text>
          </TouchableOpacity>
        }
        <TouchableOpacity className="mx-2 rounded-md  w-1/2 mt-2 mb-2 py-2 ">
          <Text className="text-sm  text-center">{t("Get Help ?")}</Text>
        </TouchableOpacity>
      </View>


      <View className="my-2 px-4 py-4 bg-white">
        <Text className="text-[#00008b] font-bold text-xl mb-2 ">{t("Shipping Address")}</Text>
        <View>
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

      <View className="bg-white mb-2 py-4">
        <Text className="text-[#00008b] font-bold text-xl mb-1 px-4">{t("Orders Details")}</Text>
        <View className=" mx-2 p-2 rounded-md border-gray-400 ">
          <Text className="text-base">{`Order Date : ${moment(orderData.order_date).format('LLL')}`}</Text>
          <Text className="text-base">{`Order # : ${orderData.order_id}`}</Text>
          <Text className="text-base">{`Order Total : ${orderData.currency_symbol} ${orderData.total_amount}`}</Text>
        </View>
      </View>

      <View className="pb-6 bg-white">
        <Text className="text-[#00008b] font-bold text-xl my-2 px-4">{t("Payment Information")}</Text>
        <View className=" mx-2 p-2 rounded-md border-gray-400 ">
          <Text className="text-lg">{`Payment Method : ${orderData.payment_method}`}</Text>


        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default OrderdetailsScreen