import { View, Text, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity, Image, Button, Touchable, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Colors, Sizes, } from "../../constants/styles";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeItem, incrementItem, decrementItem, fetchcart, incrementCartTotal, decrementCartTotal, decrementCartTotalremove } from '../../store/slices/cartSlice';
import { debounce } from 'lodash';
import { AdminUrl, HeaderBar } from '../../constant';
import emptyCart from "../../assets/images/icons/empty-cart.png"
import { useTranslation } from 'react-i18next';
import { toggleFavouriteProductslice } from '../../store/slices/productSlice';
import { addItemToWishlist } from '../../store/slices/wishlistSlice';
import { Alert } from 'react-native';
import FullPageLoader from "../../components/FullPageLoader";
import { Modal } from 'react-native';
import { Dimensions } from 'react-native';
import ProductListing from '../../components/ProductList';
import { useFocusEffect } from '@react-navigation/native';

const ChatsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false)
    const { customerData } = useSelector((store) => store.userData)
    const [modalVisible, setModalVisible] = useState(false);
    const [inFavorite, setinFavorite] = useState(false);
    const { t } = useTranslation()
    console.log("IN CART PAGE");
    const customerId = customerData[0]?.customer_id
    const { c_symbol } = useSelector((store) => store.selectedCurrency)
    ////////////////////////////////////////////////////////////////////////////////////////
    const dispatch = useDispatch()
    const { cartItems } = useSelector((state) => state.cart);
    const ct = useSelector((state) => state.cart.cartTotal);
    const screenWidth = Dimensions.get('window').width;
    const [exploreProducts, setExploreProducts] = useState(null)
    const scrollViewRef = useRef(null);


console.log(typeof(ct),ct,"ct");
    const handleRemove = async (_, item, type) => {
        try {
            setLoading(true)
            if (customerId) {
                const { category, subcategory, uniquepid, label } = item;
                const replacecategory = category
                    .replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "");
                const replacesubcategory = subcategory
                    .replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "");

                // Construct the URL for your backend endpoint
                const apiUrl = `${AdminUrl}/api/removeProductFromCart?category=${replacecategory}&subcategory=${replacesubcategory}&product_uniqueid=${uniquepid}&customer_id=${customerId}&label=${label}`;

                // Make a DELETE request to your backend using async/await
                const response = await fetch(apiUrl, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                if (type === 'cart') {
                    setLoading(false)
                    Alert.alert("Product Removed", `${item.ad_title} Removed from Cart`)

                }
                else if (type === 'wishlist') {
                    setLoading(false)
                    Alert.alert("Added to Wishlist", `${item.ad_title} Added to wishlist✅`)
                }
                dispatch(decrementCartTotalremove(item.added_quantity))
                dispatch(removeItem(item));
            }
            else {
                setLoading(false)
                dispatch(decrementCartTotalremove(item.added_quantity))
                dispatch(removeItem(item));

            }

            // Handle success, update UI or perform any other action
        } catch (error) {
            setLoading(false)
            console.error('Error removing product from cart:', error);
            // Handle error, show a message to the user, or retry the operation
        }
    };

    const handleIncrement = async (_, item) => {
        try {
            dispatch(incrementItem(item));
            dispatch(incrementCartTotal())

            if (customerId) {
                const { category, subcategory, uniquepid, vendorid, label } = item;
                const replacecategory = category.replace(/[^\w\s]/g, "").replace(/\s/g, "");
                const replacesubcategory = subcategory.replace(/[^\w\s]/g, "").replace(/\s/g, "");

                // Create an array of requests
                const requests = [];

                // Add the API call to the requests array
                requests.push(
                    fetch(`${AdminUrl}/api/addProductcart`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            customer_id: customerId,
                            vendor_id: vendorid,
                            product_uniqueid: uniquepid,
                            category: replacecategory,
                            subcategory: replacesubcategory,
                            added_quantity: 1,
                            variantlabel: label,
                        }),
                    })
                );

                // Use Promise.all to parallelize the requests
                const responses = await Promise.all(requests);

                // Check if any response is not ok
                const isError = responses.some(response => !response.ok);

                if (isError) {
                    throw new Error('One or more API requests failed.');
                }
            }
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    const handleDecrement = async (_, item) => {
        try {
            dispatch(decrementItem(item));
            dispatch(decrementCartTotal())

            if (customerId) {
                const { category, subcategory, uniquepid, vendorid, label } = item;
                const replacecategory = category
                    .replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "");
                const replacesubcategory = subcategory
                    .replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "");
                // Create an object with the data you want to send in the request body
                const requestData = {
                    customer_id: customerId,
                    vendor_id: vendorid,
                    product_uniqueid: uniquepid,
                    category: replacecategory,
                    subcategory: replacesubcategory,
                    added_quantity: -1, // Decrement the quantity by 1
                    variantlabel: label
                };

                // Make a POST request to your API endpoint for updating the cart
                const response = await fetch(`${AdminUrl}/api/addProductcart`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const responseData = await response.json();
            }

        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };


    const Total = cartItems?.map(item => item?.sellingprice * item?.added_quantity).reduce((prevValue, currValue) => prevValue + currValue, 0);
    const cartTotal = parseFloat(Total?.toFixed(2))

    const TotalSellingPrice = cartItems?.map(item => item?.sellingprice * item?.added_quantity).reduce((prevValue, currValue) => prevValue + currValue, 0);

    const TotalMRP = cartItems?.map(item => item?.mrp * item?.added_quantity).reduce((prevValue, currValue) => prevValue + currValue, 0);

    const cartTotalSellingPrice = parseFloat(TotalSellingPrice?.toFixed(2));
    const cartTotalMRP = parseFloat(TotalMRP?.toFixed(2));
    const cartDiscount = 0


    /////////////////////SAVE FOR LATER/////////////////////////
    const handleToggleWishlist = async (id) => {
        setLoading(true)
        if (!customerId) return navigation.navigate("Login")
        const singleData = cartItems?.find((single) => single.uniquepid === id)
        const { category, subcategory, uniquepid, vendorid, mrp, sellingprice } = singleData;
        const replacecategory = category
            .replace(/[^\w\s]/g, "")
            .replace(/\s/g, "");
        const replacesubcategory = subcategory
            .replace(/[^\w\s]/g, "")
            .replace(/\s/g, "");
        const requestData = {
            customer_id: customerId,
            vendor_id: vendorid,
            uniquepid,
            category: replacecategory,
            subcategory: replacesubcategory,
            // label: selectLabel,
            mrp,
            sellingprice
        };

        if (!inFavorite) {
            dispatch(addItemToWishlist({ ...singleData }))
            handleRemove(uniquepid, singleData, 'wishlist')
            if (customerId) {
                try {

                    // Make a POST request to your API endpoint for updating the cart
                    const response = await fetch(`${AdminUrl}/api/addWishlist`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const responseData = await response.json();
                    // setinFavorite(true)

                } catch (error) {
                    console.error('Error updating wishlist:', error);
                }
            }
        }

        dispatch(toggleFavouriteProductslice(singleData))
    }

    function handlepickup() {
        setModalVisible(false)
    }

    function header() {
        const myCart = t("My Cart")
        return (
            <View>
                <HeaderBar title={myCart} goback={false} cartEnable={false} navigation={navigation} />
                <View className="border-t border-gray-400"></View>
            </View>
        )
    }

    //////////////////////////explore more ////////////////////////////
    const fetchExploreProducts = async () => {
        try {
            const newArrivalsResponse = await fetch(`${AdminUrl}/api/getexploreproducts?pageNumber=1&pageSize=10`);
            // const newArrivalsResponse = await fetch(`${AdminUrl}/api/newArrivals/${'null'}`);
            if (!newArrivalsResponse.ok) {
                throw new Error(`HTTP error! Status: ${newArrivalsResponse.status}`);
            }
            const newArrivalsData = await newArrivalsResponse.json();
            console.log(newArrivalsData, "newArrivalsData");
            setExploreProducts(newArrivalsData?.AllProducts);

        } catch (error) {
            console.log(error, "Error fetching new arrivals data");
        }
    }

    useEffect(() => {
        if (!exploreProducts) {
            fetchExploreProducts()
        }
    })
    useFocusEffect(
        React.useCallback(() => {
            // Check if scrollViewRef and its current property exist
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToOffset({ offset: 0, animated: true });
            }
        }, [scrollViewRef]) // Include scrollViewRef in dependencies array
    );
    //////////////////////////explore more ////////////////////////////

    const renderItem = ({ item }) => {
        const discountPercentageSimple = ((item.mrp - item.sellingprice) / item.mrp) * 100;

        const id = item?.uniquepid;
        const firstViewWidth = screenWidth * 0.4;
        const secondViewWidth = screenWidth - firstViewWidth
        return (
            <View className=" mt-2 mb-4">
                <TouchableOpacity className="flex-row my-1 mb-0  rounded-sm p-2  "
                    onPress={debounce(() => navigation.push('ProductDetail', item), 500)}
                >
                    <View style={{ overflow: 'hidden', width: firstViewWidth }} className="m-auto p-2 h-auto">

                        <Image
                            resizeMode="contain"
                            source={
                                item.images
                                    ? { uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${item.images[0]}` }
                                    : require('../../assets/noimage.jpg')
                            }

                            defaultSource={require('../../assets/noimage.jpg')}
                            style={{ aspectRatio: 3 / 2 }} className="rounded-md"
                        />

                        <View style={styles.container} className=" mt-1 rounded-md">
                            <View style={styles.buttonContainer} className="mx-auto">
                                {item?.added_quantity == 1 ?
                                    <TouchableOpacity onPress={debounce(item?.added_quantity == 1 ? () => handleRemove(id, item, 'cart') : () => handleDecrement(id, item), 300)} className=" px-[2px]">
                                        <MaterialCommunityIcons name="delete" size={24} color="black" />
                                    </TouchableOpacity> :
                                    <TouchableOpacity style={styles.button} onPress={debounce(() => handleDecrement(id, item), 500)} className=" rounded-md">
                                        <Text style={styles.buttonText}>-</Text>
                                    </TouchableOpacity>}
                                <Text style={styles.count}>{item?.added_quantity}</Text>
                                <TouchableOpacity style={styles.button} onPress={debounce(() => handleIncrement(id, item), 500)} className=" rounded-md">
                                    <Text style={styles.buttonText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View className="ml-4 " style={{ width: secondViewWidth }}>

                        <Text numberOfLines={2} className="text-base font-medium">
                            {item?.ad_title}
                        </Text>
                        {
                            item.label && <Text className="text-[14px] text-gray-500 ">{item.label.split("/").join(" / ")}</Text>
                        }




                        <View className="gap-1" style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 4 }}>
                            <Text className="text-base font-medium text-gray-700">{t("Price: ")}</Text>
                            {discountPercentageSimple && discountPercentageSimple > 0 && (
                                <Text className="text-base" style={{ color: 'green' }}>-{discountPercentageSimple?.toFixed(2)}%</Text>
                            )}
                            <View className="flex-row items-center ">
                                <Text className="text-base ml-1.5 mr-0.5 font-medium">{`${c_symbol}`}</Text>
                                <Text className="text-gray-900 text-lg" style={{ fontWeight: 'bold' }}>
                                    {`${item.sellingprice % 1 === 0 ? Math.trunc(item.sellingprice) : item.sellingprice}`}
                                </Text>
                            </View>
                        </View>
                        {
                            discountPercentageSimple !== 0 &&
                            <View className="flex-row items-center">
                                <Text className="text-gray-500 font-medium">{t("List Price: ")}</Text>
                                <Text style={styles.mrpPrice} className="font-medium">
                                    {`$${item.mrp % 1 === 0 ? Math.trunc(item.mrp) : item.mrp}`}
                                </Text>
                            </View>
                        }

                    </View>

                </TouchableOpacity>
                <View className="flex-row border border-gray-300 border-l-0">
                    <TouchableOpacity className="flex-1 flex-row     justify-center items-center"
                        onPress={debounce(() => handleRemove(id, item, "cart"))}>

                        <MaterialCommunityIcons name="delete-outline" size={20} color={'black'} />

                        <Text className="tracking-wider ml-1 text-[15px] text-gray-600 font-semibold">{t("Remove")}</Text>

                    </TouchableOpacity>
                    <TouchableOpacity onPress={debounce(() => handleToggleWishlist(id), 500)} className="flex-1 flex-row border-l border-gray-300 py-2  justify-center items-center" >
                        <MaterialCommunityIcons name="heart-outline" size={20} color={'black'} />
                        <Text className="tracking-wider ml-1 text-[14px] text-gray-600 font-semibold">{t("Save For Later")}</Text>


                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const Cartdetails = () => {
        return (<>
            <View className="m-1 p-2 mt-2 ">
                <Text className="text-[18px] font-medium mb-2">{t("Price Details")}</Text>
                <View className="flex-row justify-between items-center  my-1 py-0.5">
                    <Text className="text-[14px]">{t("Price")}</Text>
                    <Text className="text-[16px]  font-normal">{`${c_symbol} ${cartTotalMRP}`}</Text>
                </View>
                <View className="flex-row justify-between items-center items  ">
                    <Text className="text-[14px]">{t("Discount")}</Text>
                    <Text className="text-[16px] text-green-600 font-medium">{`-${(((cartTotalMRP - cartTotalSellingPrice) / cartTotalMRP) * 100).toFixed(2)} %`} ({`${c_symbol}${(cartTotalMRP - cartTotalSellingPrice).toFixed(2)}`})</Text>
                </View>
                {/* <View className="flex-row justify-between items-center  my-1 py-0.5">
                    <Text className="text-[14px]">{t("Delivery Charges")}</Text>
                    <Text className="text-[16px] font-medium">{`${cartTotalDeliveryCharges || 0}`}</Text>
                </View> */}
                <View className="flex-row justify-between items-center  my-2 py-1.5 border-t border-gray-200">
                    <Text className="text-base font-medium">{t("Total Amount")}</Text>
                    <Text className="text-[16px] font-medium">{`${c_symbol} ${cartTotalSellingPrice - cartDiscount}`}</Text>
                </View>
                <Text className="text-[16px] text-green-600 font-medium tracking-wider ">{` ${t("You will save")} ${c_symbol} ${(cartTotalMRP - cartTotalSellingPrice).toFixed(2)} ${t("on this order")}`}</Text>
            </View>
            <View>

                {/* /////More Products section///////////////////////////////// */}
                <Exploremore />
                {/* /////More Products section///////////////////////////////// */}
            </View>
        </>
        )
    }

    const Exploremore = () => {
        return (
            <View className="mt-10 border-t border-gray-300">
                <Text className="text-xl mt-4 mb-2 font-medium italic tracking-wide px-4">{t("Continue Shopping")}</Text>

                <ProductListing title="" productList={exploreProducts} />

                <TouchableOpacity className="bg-green-700 space-x-1  mb-4 p-2 mx-2 px-4 flex-row items-center" style={{ borderRadius: 5 }} onPress={() => navigation.navigate("Channel", { channelName: "Explore More" })}>
                    <Text className="text-lg italic tracking-wider  text-white font-medium " >{t("Explore More")}</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                </TouchableOpacity>
            </View>
        )
    }



    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            {header()}
            {loading && <FullPageLoader />}

            {
                <View style={{ flex: 1 }} >
                    {
                        cartItems?.length > 0 &&
                        <FlatList ref={scrollViewRef}
                            data={cartItems}
                            keyExtractor={(item) => `${item?.uniquepid}${item?.label}`}
                            renderItem={renderItem}
                            // contentContainerStyle={{ paddingHorizontal: Sizes.fixPadding + 1.0 }}
                            showsVerticalScrollIndicator={false}
                            ListFooterComponent={Cartdetails()}
                        />



                    }
                    {
                        cartItems?.length > 0 ?
                            <View className="mb-[10px] border border-t-1 border-b-0 border-l-0 border-r-0 border-gray-300">
                                {/* Your "Move to Checkout" section content goes here */}
                                <View
                                    className=" mb-1 flex-row items-center justify-between "
                                    style={{
                                        padding: Sizes.fixPadding,
                                        backgroundColor: "white", // Customize the background color
                                        alignItems: 'center',
                                        borderRadius: 5, // Customize the border radius
                                    }}

                                >
                                    <Text className="text-black font-bold text-base  tracking-wider">{` ${t("Total : ")} ${c_symbol} ${cartTotal}`}</Text>
                                    <TouchableOpacity onPress={debounce(() => {
                                        if (customerData?.length === 0) {
                                            navigation.navigate("Login")
                                        }
                                        else {
                                            // navigation.push("Checkout Address")
                                            setModalVisible(true);
                                        }
                                    }, 500)}>
                                        <Text
                                            style={{
                                                fontSize: 16, // Customize the font size
                                            }}
                                            className=" tracking-wider bg-[#fb9b01] px-6 py-2 rounded-md font-bold"
                                        >{t("Place Order")}</Text>
                                    </TouchableOpacity>
                                    <Modal

                                        visible={modalVisible}
                                        transparent={true}
                                        animationType="fade"
                                        onRequestClose={() => setModalVisible(false)}
                                    >
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                            <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
                                                <Text className="text-base font-bold text-gray-500 ">{t("Select A Deliver Mode")}</Text>
                                                <View className="mt-6 space-y-4" >

                                                    <TouchableOpacity className="bg-gray-200" onPress={() => handlepickup()} style={{ padding: 10, borderRadius: 5 }}>
                                                        <Text className="text-center" style={{ fontWeight: 'bold' }}>{t("Pickup From Store")}</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity className="bg-gray-200"
                                                        onPress={() => {
                                                            navigation.push('Checkout Address')
                                                            setModalVisible(false)
                                                        }} style={{ padding: 10, borderRadius: 5 }}>
                                                        <Text className="text-center" style={{ fontWeight: 'bold' }}>{t("Delivery Address")}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>
                            </View> :


                            <ScrollView className="" showsVerticalScrollIndicator={false}>
                                <View className="mx-auto my-2 ">
                                    <Image resizeMode='contain' source={emptyCart} className="w-[300px] h-[300px]" />
                                    <Text className="text-xl tracking-wider text-center font-semibold mb-6 ">{t("Your cart is empty!")}</Text>
                                </View>
                                <Exploremore />



                            </ScrollView>
                    }
                </View>}
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 1.0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // borderBottomLeftRadius: Sizes.fixPadding + 5.0,
        // borderBottomRightRadius: Sizes.fixPadding + 5.0,
    },
    container: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowRadius: 2,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',

    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 2,
        paddingBottom: 4,

    },
    mrpPrice: {
        textDecorationLine: 'line-through',
        fontSize: 14,
        color: 'gray',
    },
    buttonText: {
        color: 'black',
        fontSize: 20,
        fontWeight: 'bold',

    },
    count: {
        marginHorizontal: 15,
        fontSize: 20,
        fontWeight: 'bold',
    },
})

export default ChatsScreen