import React from 'react';
import { Image, SafeAreaView, StatusBar } from 'react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { changetabbarIndex } from '../../store/slices/counterslice';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
const Orderplaced = ({ route, navigation }) => {

  const { t } = useTranslation()
  const { insertedAddress, insertedOrders } = route.params

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Rest of your component */}
      <View className="p-2 flex-1">
        <View className="flex-row items-center mb-1.5 bg-white ">
          <Image
            source={require("../../assets/images/check-mark.png")}
            className="w-20 h-20 "
            resizeMode='contain'

          />
          <View className="ml-3">
            <Text className="text-xl font-medium">{t("Thanks for shopping with us!")}</Text>
            <Text className="my-0.5 text-lg">{`Delivery By ${insertedOrders[0]?.tentative_delivery_date}`}</Text>
            <TouchableOpacity
              onPress={debounce(() => navigation.navigate("My Orders"), 500)}
            ><Text className="text-[#00008b] font-bold text-base tracking-wide mt-1.5">{t("Track & manage order")}</Text></TouchableOpacity>
          </View>
        </View>
        <View className="border border-gray-300"></View>
        <View className=" py-4 bg-white mt-4">
          <Text style={styles.pickupInfoText}>
            {t("Note: If something is marked for pickup, you can directly visit the seller's shop and pick it up.")}
          </Text>


          {
            insertedAddress && insertedAddress?.length > 0 &&
            <>
              <Text className="text-xl mb-2.5 font-medium">{t("Delivery Address")}</Text>
              <View className="flex-row">
                <Image
                  source={require("../../assets/images/smiley.png")}
                  className="w-8 h-8 mt-2"
                  resizeMode='contain'
                />
                <View className="ml-4 w-9/12">
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
            </>
          }
        </View>
        <View className="mx-3 space-x-4 mt-8 flex-row">

          <TouchableOpacity onPress={debounce(() => navigation.navigate("My Orders"), 500)} className="border flex-1   rounded-md p-1.5 bg-[#00008b]"><Text className="mx-auto text-lg  font-medium  text-white">{t("Manage Order")}</Text></TouchableOpacity>
          <TouchableOpacity
            onPress={debounce(() => {
              navigation.navigate("Home")
            }, 500)}
            className="border border-[#00008b] rounded-md p-1.5 flex-1 "><Text className="mx-auto text-lg text-[#00008b] font-medium">{t("Continue Shopping")}</Text></TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
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
  pickupInfoText: {
    fontSize: 16,
    marginVertical: 10,
    color: '#333333', // Adjust the color as needed
  },
});

export default Orderplaced;
