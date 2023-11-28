import React from 'react';
import { Image } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { changetabbarIndex } from '../../store/slices/counterslice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
const Orderplaced = ({ route, navigation }) => {

  const dispatch = useDispatch()
  const {t} = useTranslation()
  const { insertedAddress, insertedOrders } = route.params

  return (
    <View className="flex-1 py-auto my-auto bg-white ">
      <View>

      </View>
      <View className="flex-row  p-3 py-8 items-center mb-1.5 bg-white ">
        <Image
          source={require("../../assets/images/check-mark.png")}
          className="w-20 h-20 "
          resizeMode='contain'

        />
        <View className="ml-3">
          <Text className="text-xl font-medium">{t("Thanks for shopping with us!")}</Text>
          <Text className="my-0.5 text-lg">{`Delivery By ${insertedOrders[0].tentative_delivery_date}`}</Text>
          <TouchableOpacity
            onPress={debounce(() => navigation.navigate("My Orders"),500)}
          ><Text className="text-[#00008b] font-bold text-base tracking-wide mt-1.5">{t("Track & manage order")}</Text></TouchableOpacity>
        </View>
      </View>
      <View className="border border-gray-300"></View>
      <View className=" p-2 px-6  bg-white mt-4">
        <Text className="text-xl mb-2.5 font-medium">{t("Delivery Address")}</Text>
        <View className="flex-row">
          <Image
            source={require("../../assets/images/smiley.png")}
            className="w-8 h-8 mt-2"
            resizeMode='contain'
          // style={{ tintColor: "#00008b" }}


          />
          <View className="ml-4">
            <Text className="text-lg">{`${insertedAddress[0].first_name} ${insertedAddress[0].last_name}`}</Text>
            <Text className="text-lg">{insertedAddress[0].email}</Text>
            {
              insertedAddress[0].street_address && insertedAddress[0].selected_city && insertedAddress[0].zip_code &&
              <Text className="text-lg">{`${insertedAddress[0].street_address} ${insertedAddress[0].selected_city} ${insertedAddress[0].zip_code}`}</Text>
            }
            <Text className="text-lg">{`${insertedAddress[0].selected_state} ${insertedAddress[0].selected_country}`}</Text>
            <Text className="text-lg">{insertedAddress[0].phone_number}</Text>

          </View>
        </View>
      </View>
      <View className="mx-3 space-x-4 mt-8 flex-row">

        <TouchableOpacity className="border flex-1   rounded-md p-1.5 bg-[#00008b]"><Text className="mx-auto text-lg  font-medium  text-white">{t("Download Invoice")}</Text></TouchableOpacity>
        <TouchableOpacity
          onPress={debounce(() => {
            navigation.navigate("Home")
          },500)}
          className="border border-[#00008b] rounded-md p-1.5 flex-1 "><Text className="mx-auto text-lg text-[#00008b] font-medium">{t("Continue Shopping")}</Text></TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#00008b',
  },
});

export default Orderplaced;


{/* <View style={styles.container} className={'bg-[#fb7601e6]'}>
<Image
  source={require("../../assets/images/smiley.png")}
  className="w-48 h-48"
  resizeMode='contain'
  style={{tintColor:"#00008b"}}
  

/>
<Text style={styles.text}>Thank you for your order!</Text>
<View className="flex flex-row gap-3 mt-4">
  <TouchableOpacity
    className="bg-[#00008b] p-2 px-3 rounded-md"
    onPress={() => navigation.push('My Orders')}
  >
    <Text className="text-[#fb7701] font-semibold text-xl">Go to Orders</Text>
  </TouchableOpacity>
  <TouchableOpacity
    className="bg-[#00008b] p-2 px-3 rounded-md"
    onPress={() => navigation.push('BottomTabBar')}
  >
    <Text className="text-[#fb7701] font-semibold  text-xl">Shop</Text>
  </TouchableOpacity>
</View>
</View> */}