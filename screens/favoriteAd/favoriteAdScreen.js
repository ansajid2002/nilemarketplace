import React, { useEffect, useState } from "react";
import { SafeAreaView, View, StatusBar, Dimensions, StyleSheet, ImageBackground, TouchableOpacity, Text, FlatList } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons, } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { addItemToWishlist, removeItemFromWishlist, updateproductsListwishlist } from "../../store/slices/wishlistSlice";
import { AdminUrl, HeaderBar } from "../../constant";

import ProductListing from "../../components/ProductList";
import FullPageLoader from "../../components/FullPageLoader";
import { useTranslation } from "react-i18next";

const FavoriteAdScreen = ({ navigation }) => {
  const dispatch = useDispatch()

  const { customerData } = useSelector((store) => store.userData)
  const { wishlistItems } = useSelector((store) => store.wishlist)

  const customerId = customerData[0]?.customer_id
  const {t} = useTranslation()


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {header()}
      <View className="">

        {
          wishlistItems ?
            <>
              {wishlistItems?.length > 0
                ?
                <ProductListing title="" productList={wishlistItems} />
                :
                <View className="h-screen flex justify-center items-center">
                  <MaterialIcons
                    name="favorite"
                    color={Colors.grayColor}
                    size={26}
                  />

                  <Text style={{ marginTop: Sizes.fixPadding, ...Fonts.grayColor16SemiBold }}>
                    {t("No items in favorite")}
                  </Text>
                </View>
              }
            </>

            : <View className="mt-32 bg-white">
              <FullPageLoader />
            </View>
        }
      </View>
    </SafeAreaView>
  )


  function header() {
    return (
      <HeaderBar navigation={navigation} goback={true} title={` ${t("Wishlist")} (${wishlistItems?.length || 0})`} />
    )
  }
}

const styles = StyleSheet.create({
});

export default FavoriteAdScreen;
