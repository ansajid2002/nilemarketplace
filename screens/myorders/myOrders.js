import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "react-native";
import { AdminUrl } from "../../constant";
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import { useNavigation } from "@react-navigation/native";
import { changeSearchFocus, changetabbarIndex } from "../../store/slices/counterslice";
import StarRating from "../../components/FiveStarRating";
import FullPageLoader from "../../components/FullPageLoader";
import { updateReviewlistener } from "../../store/slices/reviewSlice";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native";
import { Colors } from "../../constants/styles";

const MyOrdersScreen = ({ navigation }) => {
  const { ordersData } = useSelector((store) => store.ordersdata);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const { customerData } = useSelector((store) => store.userData)
  const { reviewItems } = useSelector((store) => store.reviews)

  const [cartCount] = useState(cartItems?.length);
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const customer_id = customerData?.[0]?.customer_id
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const fetchRatings = async () => {
    try {
      const response = await fetch(`${AdminUrl}/api/fetchRatings?customer_id=${customer_id}`);
      if (response.ok) {
        const data = await response.json();
        dispatch(updateReviewlistener(data?.ratingsData))
      } else {
        console.error('Failed to fetch ratings:', response.status);
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  useEffect(() => {
    // Fetch ratings when the component mounts
    fetchRatings();
  }, [customer_id]);

  const renderitem = ({ item }) => {
    const { product_name, order_status, product_image, product_uniqueid, label } = item;
    const ratingData = reviewItems.find((ratingItem) => {
      // Convert the product_uniqueid to an integer for comparison
      const itemProductUniqueId = parseInt(ratingItem.product_uniqueid, 10);
      if (label && ratingItem.label === label) {
        // Check if the label matches
        return true;
      } else if (itemProductUniqueId === product_uniqueid) {
        // Check if the product_uniqueid matches
        return true;
      }
      return false;
    });


    return (
      <TouchableOpacity className="mt-4 border border-b-2 border-gray-300 py-4 border-t-0 border-l-0 border-r-0" onPress={() => navigation.navigate("order details", item)}>
        <View className="m-2 flex-row item  ">
          <Image className="mr-2"
            resizeMode="contain"
            source={{ uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${product_image}` }}
            style={{ width: 80, height: 80 }}
          />

          <View className="w-[65%]">
            <View className="flex-row items-center ml-4">
              <Text className={`text-lg font-semibold ${order_status === "Delivered" && "text-green-700"}`}>{order_status}</Text>
            </View>
            <Text numberOfLines={1} className="text-sm ml-4 text-gray-800">{product_name}</Text>
            {
              order_status === "Delivered" && <View className="ml-4">
                <StarRating enable={true} rating={ratingData?.rating || 0} onRatingChange={handleRatingChange} ratingData={ratingData} item={item} />
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
      </TouchableOpacity>
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
        <View className="flex justify-center w-full h-screen items-center">
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

  return (
    <View
      className="pb-4 flex-1 bg-white"
    >
      {
        !loading ?
          ordersData.length === 0 ? (
            <EmptyOrdersMessage />
          ) : (
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

            <FlatList ListHeaderComponent={<CustomHeader cartCount={cartCount} />} data={ordersData} renderItem={renderitem} keyExtractor={(item) => item.order_id} />
          </SafeAreaView>) : <FullPageLoader />
      }
    </View>
  );
};


export default MyOrdersScreen;