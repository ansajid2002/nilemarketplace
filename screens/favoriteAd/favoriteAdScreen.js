import React, { useState } from "react";
import { SafeAreaView, View, StatusBar, Dimensions, StyleSheet, ImageBackground, TouchableOpacity, Text, FlatList } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons, } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from "react-redux";
import { toggleFavouriteProductslice } from "../../store/slices/productSlice";
import { addItemToWishlist, removeItemFromWishlist } from "../../store/slices/wishlistSlice";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { AdminUrl, HeaderBar } from "../../constant";
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package

import ProductListing from "../../components/ProductList";

const { width } = Dimensions.get('window');

const FavoriteAdScreen = ({ navigation }) => {
    const cartItems = useSelector((state) => state.cart.cartItems);

    const wishlistItems = useSelector((state) => state.wishlist.wishlistItems)
    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                <View className="mt-4">
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
                </View>
            </View>
        </SafeAreaView>
    )


    function removeFromFavorite({ id }) {
        // const newList = wishlistItems.filter((item) => item.id != id);
        // updateState({ favoriteProducts: newList })

        const newList = wishlistItems.map((item) => {
            if (item.uniqueid === id) {
                const updatedItem = { ...item };

                dispatch(removeItemFromWishlist(updatedItem))

                return updatedItem;
            }
            return item;
        });
        updateState({ favouriteProducts: newList })
    }

    // function favoriteProductsDetail() {
    //     const renderItem = ({ item }) => (
    //         <TouchableOpacity
    //             activeOpacity={0.9}
    //             onPress={debounce(() => navigation.push('ProductDetail', item), 500)}
    //             style={styles.favoriteProductsWrapStyle}
    //             className="m-2"
    //         >
    //             <ImageBackground
    //                 source={{ uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${item?.images[0]}` }}
    //                 style={{ height: 220.0 }}
    //                 borderRadius={Sizes.fixPadding - 5.0}
    //             >
    //                 <View style={styles.favoriteIconWrapStyle}>
    //                     <MaterialCommunityIcons
    //                         name="heart-remove"
    //                         color="#00008B"
    //                         size={20}
    //                         onPress={debounce(() => {
    //                             updateState({ showSnackBar: true })
    //                             removeFromFavorite({ id: item?.uniqueid })
    //                             dispatch(toggleFavouriteProductslice(item))
    //                         }, 500)}
    //                     />
    //                 </View>
    //                 <View style={styles.productInfoOuterWrapStyle}>
    //                     <View style={styles.productInfoWrapStyle}>
    //                         <Text style={{ ...Fonts.blackColor16SemiBold }}>
    //                             {`${c_symbol} ${item.sellingprice}`}
    //                         </Text>
    //                         <Text numberOfLines={1} style={{ flex: 1, ...Fonts.grayColor12Medium }}>
    //                             {item?.ad_title}
    //                         </Text>
    //                         <View style={styles.productDetailWrapStyle}>
    //                             {/* <Text style={{ ...Fonts.grayColor10Regular }}>
    //                                 {item.date}
    //                             </Text> */}
    //                         </View>
    //                     </View>
    //                 </View>
    //             </ImageBackground>
    //         </TouchableOpacity>
    //     )
    //     return (
    //         <FlatList
    //             data={wishlistItems}
    //             keyExtractor={(item) => `${item.uniqueid}`}
    //             renderItem={renderItem}
    //             numColumns={2}
    //             contentContainerStyle={{ paddingHorizontal: Sizes.fixPadding + 5.0, paddingVertical: Sizes.fixPadding * 2.0, }}
    //         />
    //     )
    // }

    function header() {
        return (
            <HeaderBar navigation={navigation} goback={true} title={`Wishlist (${wishlistItems?.length})`} />
        )
    }
}

const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 2.0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryColor,
        borderBottomLeftRadius: Sizes.fixPadding + 5.0,
        borderBottomRightRadius: Sizes.fixPadding + 5.0,
    },
    favoriteProductsWrapStyle: {
        flex: 1,
        maxWidth: (width / 2.0) - 25.0,
        backgroundColor: Colors.whiteColor,
        elevation: 4.0,
        borderRadius: Sizes.fixPadding - 5.0,
        marginHorizontal: Sizes.fixPadding - 5.0,
        marginBottom: Sizes.fixPadding,
    },
    favoriteIconWrapStyle: {
        backgroundColor: "rgb(230,230,230)",
        margin: 4,
        alignSelf: 'flex-end',
        padding: Sizes.fixPadding - 5.0,
        borderRadius: 50 / 2
    },
    productInfoOuterWrapStyle: {
        position: 'absolute',
        borderBottomLeftRadius: Sizes.fixPadding - 5.0,
        borderBottomRightRadius: Sizes.fixPadding - 5.0,
        bottom: 0.0,
        left: 0.0,
        right: 0.0,
        overflow: 'hidden',
        paddingTop: Sizes.fixPadding - 5.0,
    },
    productInfoWrapStyle: {
        backgroundColor: Colors.whiteColor,
        elevation: 10.0,
        paddingBottom: Sizes.fixPadding - 5.0,
        paddingHorizontal: Sizes.fixPadding - 5.0,
    },
    productDetailWrapStyle: {
        marginTop: Sizes.fixPadding - 5.0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    snackBarStyle: {
        position: 'absolute',
        bottom: -10.0,
        left: -10.0,
        right: -10.0,
        backgroundColor: '#333333',
        elevation: 0.0,
    }
});

export default FavoriteAdScreen;
