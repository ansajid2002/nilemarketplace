import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "react-native";
import { AdminUrl } from "../../constant";
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { changeSearchFocus, changetabbarIndex } from "../../store/slices/counterslice";
import StarRating from "../../components/FiveStarRating";
import FullPageLoader from "../../components/FullPageLoader";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native";
import { Colors } from "../../constants/styles";
import { productUrl } from '../../constant'

const MyOrdersScreen = ({ navigation, route }) => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const { customerData } = useSelector((store) => store.userData)
  // const { reviewItems } = useSelector((store) => store.reviews)

  const [myOrdersData, setMyOrdersData] = useState(null)
  const [reviewItems, setReviewItems] = useState(null)

  const customerId = customerData[0]?.customer_id

  const [cartCount] = useState(cartItems?.length);
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const customer_id = customerData?.[0]?.customer_id
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const getAllCustomerOrder = async () => {
    setLoading(true)
    if (customerId === null || customerId === undefined) {
      // Handle the case when customerId is null or undefined, such as displaying an error message or taking appropriate action.
      return;
    }
    try {
      const response = await fetch(`${AdminUrl}/api/getAllCustomerOrder/${customerId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setMyOrdersData(data)
      // Log the data
      // dispatch(addOrders(data))
      // You can dispatch or process the data here as needed.
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await fetch(`${AdminUrl}/api/fetchRatings?customer_id=${customer_id}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setReviewItems(data.ratingsData)
      } else {
        console.error('Failed to fetch ratings:', response.status);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false)
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!myOrdersData) {
        getAllCustomerOrder();
      }
      if (myOrdersData && !reviewItems) {
        fetchRatings();
      }
    }, [customer_id, myOrdersData, reviewItems])
  );

  const renderitem = ({ item }) => {
    const { product_name, order_status, order_id, product_image, ratings_and_reviews, ispickup, return_order } = item;
    return (
      <TouchableOpacity className="mt-4 border border-b-2 border-gray-300 py-4 border-t-0 border-l-0 border-r-0" onPress={() => navigation.navigate("order details", item)}>
        <View className="m-2 flex-row item  ">
          <Image className="mr-2"
            resizeMode="contain"
            source={
              !product_image
                ? require('../../assets/noimage.jpg')
                :
                { uri: `${productUrl}/${product_image}` }}
            style={{ width: 80, height: 80 }}
            defaultSource={"../../assets/noimage.jpg"}
          />

          <View className="w-[65%]">
            <View className="flex-row items-center ml-4">
              <Text className={`text-lg font-semibold capitalize ${(order_status === "Delivered" || order_status === 'Picked') ? "text-green-700" : (return_order) ? 'text-red-500' : ''
                }`}>{order_status}</Text>

            </View>
            <Text numberOfLines={1} className="text-sm ml-4 text-gray-800">{product_name}</Text>
            <Text className={`text-sm font-semibold ml-4 ${ispickup && !return_order ? 'text-green-500' : return_order ? 'text-red-500' : 'text-orange-600'
              }`}>
              {order_status !== 'Delivered' && order_status !== 'Picked' ? (
                return_order ? "Return" : (ispickup ? 'Pickup' : 'Will be delivered soon...')
              ) : ''}
            </Text>

            {
              (order_status === "Delivered" || order_status === 'Picked') && <View className="ml-4">
                <StarRating enable={true} order_id={order_id} rating={ratings_and_reviews?.[0]?.rating || 0} onRatingChange={handleRatingChange} ratingData={ratings_and_reviews} item={item} />
              </View>
            }
          </View>
          <View className="mt-4 absolute right-0">
            <Icon
              name="chevron-forward-sharp"
              size={28}
              color="gray" />
          </View>
        </View>
      </TouchableOpacity >
    );
  };

  const CustomHeader = ({ cartCount }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
      navigation.goBack();
    };

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleGoBack}>
            <Icon name="arrow-back" size={30} color="black" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 10 }} className="font-bold text-xl">{t("My Orders")}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => {
            dispatch(changeSearchFocus(true))
            navigation.navigate("Categories")
          }}>
            <Icon name="search" size={28} color="black" style={{ marginRight: 10 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            navigation.navigate("Cart")
          }
          }>
            <Icon name="cart-outline" size={28} color="black" />
            {cartCount > 0 && (
              <View style={{ position: 'absolute', top: -5, right: -8, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white' }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyOrdersMessage = () => {
    return (
      <View >
        <CustomHeader cartCount={cartCount} />
        <View className="flex justify-center w-full h-full items-center">
          <Image resizeMode="contain" source={require("../../assets/images/no-records.png")} style={{ width: 200, height: 200 }} />
          <Text>{t("You haven't ordered anything.")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <View className="bg-blue-700  p-2 rounded-sm mt-4 flex-row justify-center items-center">
              <Text className="text-white">{t("Go to Shop")}</Text>
              <Text className="relative top-[1px] ml-2"><Icon name="arrow-forward" size={18} color="white" /></Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Add logic to refresh the data
    getAllCustomerOrder();
    fetchRatings();
    setRefreshing(false);
  };

  return (
    <View
      className="pb-4 flex-1 bg-white"
    >
      {
        !loading ?
          myOrdersData?.length === 0 ? (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

              <EmptyOrdersMessage />
            </SafeAreaView>
          ) : (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

              <FlatList
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                } ListHeaderComponent={<CustomHeader cartCount={cartCount} />} data={myOrdersData} renderItem={renderitem} keyExtractor={(item) => item.order_id} />
            </SafeAreaView>) : <FullPageLoader />
      }
    </View>
  );
};


export default MyOrdersScreen;