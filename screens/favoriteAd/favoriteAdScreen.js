import React, { useEffect, useState } from "react";
import { SafeAreaView, View, StatusBar, Dimensions, StyleSheet, ImageBackground, TouchableOpacity, Text, FlatList } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons, } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { addItemToWishlist, removeItemFromWishlist, updateproductsListwishlist } from "../../store/slices/wishlistSlice";
import { AdminUrl, HeaderBar } from "../../constant";

import ProductListing from "../../components/ProductList";
import FullPageLoader from "../../components/FullPageLoader";

const FavoriteAdScreen = ({ navigation }) => {
const dispatch = useDispatch()

    const { customerData } = useSelector((store) => store.userData)

    const customerId = customerData[0]?.customer_id
    const [wishlistItems,setWishlistItems] = useState(null)

    const getCustomerWishlist = async () => {
        if (customerId === null || customerId === undefined) {
          // Handle the case when customerId is null or undefined, such as displaying an error message or taking appropriate action.
          return;
        }
        try {
          const response = await fetch(`${AdminUrl}/api/wishlistdata?customer_id=${customerId}`);
    
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
    
          const data = await response.json();
          setWishlistItems(data)
          dispatch(updateproductsListwishlist(data))

        } catch (error) {
          console.error('Error:', error);
        }
      };

      useEffect(() => {
        getCustomerWishlist()
      }, [customerId])
    
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
                                No items in favorite
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
            <HeaderBar navigation={navigation} goback={true} title={`Wishlist (${wishlistItems?.length})`} />
        )
    }
}

const styles = StyleSheet.create({
});

export default FavoriteAdScreen;
