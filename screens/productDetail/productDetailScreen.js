import React, { useState } from "react";
import { TouchableOpacity, SafeAreaView, View, Image, ScrollView, StatusBar, Share, StyleSheet, Text, Alert, ActivityIndicator, Linking } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialCommunityIcons, } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { addItem, decrementItem, decrementCartTotal, incrementCartTotal, incrementItem, removeItem } from "../../store/slices/cartSlice";
import { debounce } from "lodash";
import { AdminUrl, getVariantsOfCatSubcat } from "../../constant";
import { useEffect } from "react";
import Slider from "../../components/Slider/Slider";
import ReviewComponent from "../../components/ReviewsComponent";
import { changeSearchFocus } from "../../store/slices/counterslice";
import Icon from 'react-native-vector-icons/Ionicons';
import search from "../../assets/images/icons/search-interface-symbol.png"
import shareimg from "../../assets/images/icons/share.png"
import { t } from "i18next";


const ProductDetailScreen = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const itemData = route.params;
    const [singleData, setsingleData] = useState(itemData)
    const [selectedAttributes, setSelectedAttributes] = useState(null);
    const [selectLabel, setselectLabel] = useState(singleData?.label);
    const [mrpData, setMrp] = useState(singleData?.mrp || 0);
    const [sellingPriceData, setSellingPrice] = useState(singleData?.sellingprice);
    const [discountPercentage, setDiscountPercentage] = useState(null);
    const [isUniquepidMatched, setisUniquepidMatched] = useState(null);
    const [IsMatchedCartProduct, setIsMatchedCartProduct] = useState(null);
    const [inFavorite, setinFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cartplusloader, setCartplusloader] = useState(false)
    const [cartminusloader, setCartminusloader] = useState(false)
    const { customerData } = useSelector((store) => store.userData)
    const customerId = customerData[0]?.customer_id
    const { t } = useTranslation()
    const { c_symbol, appLangcode } = useSelector((store) => store.selectedCurrency)
    const cartItems = useSelector((state) => state.cart.cartItems);
    const wishlistItems = useSelector((state) => state.wishlist.wishlistItems)
    const { somalian_district } = useSelector((store) => store.customerAddress)
    const [shippingrate, setShippingrate] = useState("")

    useEffect(() => {
        // Check if there's an item in wishlistItems with a matching uniquepid
        const isFavorite = wishlistItems.some(wish => wish.uniquepid === singleData.uniquepid);
        setinFavorite(isFavorite);
    }, [wishlistItems]);

    const [state, setState] = useState({
        showSnackBar: false,
        productImages: singleData?.images,
        activeSlide: 0,
        inCart: false,
        showSnackBarcart: false
    })

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    useEffect(() => {
        const isUniquepidMatched = cartItems.some((cartItem) => {
            return cartItem.uniquepid === singleData.uniquepid;
        });

        const matchedCartProduct = cartItems.find((cartItem) => {
            if (cartItem.uniquepid === singleData.uniquepid) {
                if (cartItem?.label != null && cartItem?.label != undefined) {
                    return cartItem?.uniquepid === singleData.uniquepid && cartItem?.label === singleData?.label;
                }
                return cartItem?.uniquepid === singleData?.uniquepid;
            }
        });

        setisUniquepidMatched(isUniquepidMatched)
        setIsMatchedCartProduct(matchedCartProduct);

    }, [isUniquepidMatched, cartItems, singleData])

    const handleRemove = async (itemId, item) => {
        try {
            setCartminusloader(true)
            dispatch(removeItem(item));
            dispatch(decrementCartTotal())

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
            }
            // Handle success, update UI or perform any other action
        } catch (error) {
            console.error('Error removing product from cart:', error);
            // Handle error, show a message to the user, or retry the operation
        } finally {
            setCartminusloader(false)
        }
    };

    const ShareProduct = ({ product }) => {
        const shareProduct = async () => {

            try {
                const sharedMessage = `Check out this product: ${appLangcode === "so" ?
                    product?.somali_ad_title === null ? product?.ad_title : product?.somali_ad_title :
                    product?.ad_title}\n\nProduct URL: https://nilegmp.com/product-detail?product=${product?.prod_slug}&uniqueid=${product.uniquepid}`;

                const result = await Share.share({
                    title: product.adtitle,
                    message: sharedMessage,
                    url: product.productURL, // URL to the product details page on your e-commerce website
                });

                if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                        // Shared via activity type
                        console.log(`Shared via ${result.activityType}`);
                    } else {
                        // Shared
                        console.log('Shared');
                    }
                } else if (result.action === Share.dismissedAction) {
                    // Dismissed
                    console.log('Share dismissed');
                }
            } catch (error) {
                console.error('Error sharing:', error.message);
            }
        };
        return (
            <TouchableOpacity onPress={shareProduct}>
                <Image
                    source={shareimg}
                    style={{ width: 30.0, height: 30.0, borderRadius: 20.0 }}
                />
            </TouchableOpacity>
        );
    }

    const handleIncrement = async (itemId, item) => {
        try {
            setCartplusloader(true)
            dispatch(incrementItem(item));
            dispatch(incrementCartTotal())

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
                    added_quantity: 1, // Decrement the quantity by 1
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

            }

        } catch (error) {
            console.error('Error updating cart:', error);
        }
        finally {
            setCartplusloader(false)
        }
    };

    const handleDecrement = async (itemId, item) => {
        try {
            setCartminusloader(true)
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
        finally {
            setCartminusloader(false)
        }
    };

    let updatedAttributesSpecification = singleData?.attributes_specification;

    // Check if updatedAttributesSpecification exists and has the 'specificaitons' property
    if (updatedAttributesSpecification && updatedAttributesSpecification.specificaitons) {
        const specificaitons = updatedAttributesSpecification.specificaitons;

        if (Array.isArray(specificaitons)) {
            specificaitons.forEach(({ label, Value }) => {
                updatedAttributesSpecification[label] = Value;
            });

            delete updatedAttributesSpecification.specificaitons;
        }

    }

    // Redefine updatedAttributesSpecification after performing operations
    updatedAttributesSpecification = { ...updatedAttributesSpecification }; // Create a copy of the modified object

    const handleShippingrates = async (origin, destination) => {
        try {
            if ((!origin || !destination)) return
            const response = await fetch(`${AdminUrl}/api/getShippingRate?origin=${origin}&destination=${destination}`)
            console.log(`${AdminUrl}/api/getShippingRate?origin=${origin}&destination=${destination}`);
            if (response.ok) {
                const data = await response.json()
                console.log(data, 'response');
                if (data.rate === 0) {
                    setShippingrate(0)
                }
                else {
                    setShippingrate(data.rate)
                }
            }
            else {
                console.log("fetching failed ");
            }
        } catch (error) {
            console.log(error, "ERROR FETCHING RATES");
        }

    }

    useEffect(() => {
        if (somalian_district) {
            handleShippingrates(singleData?.vendorInfo?.company_district, somalian_district)
        }
    }, [somalian_district])


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>

            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            {/* <HeaderBar title={''} goback={true} navigation={navigation} /> */}
            <View className="px-3 py-2" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {
                        <TouchableOpacity onPress={debounce(() => navigation.pop(), 500)}>
                            <Icon name="arrow-back" size={30} color="black" />
                        </TouchableOpacity>
                    }

                </View>
                <View className="mr-1 " style={{ flexDirection: 'row', alignItems: 'center' }}>

                    <TouchableOpacity
                        className="mr-3"
                        onPress={debounce(() => {
                            dispatch(changeSearchFocus(true))
                            navigation.navigate("Search")
                        }, 500)}>
                        {/* <Icon name="search" size={26} color="black" style={{ marginRight: 10 }} /> */}
                        <Image
                            source={search}
                            style={{ width: 30.0, height: 30.0, borderRadius: 20.0 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity className="-mt-1">
                        <ShareProduct product={singleData} />
                    </TouchableOpacity>
                </View>
            </View>


            <ScrollView showsVerticalScrollIndicator={false}>
                <View >
                    <View className="relative">
                        <Slider singleData={singleData} />
                    </View>

                    {productDetail(singleData)}
                    {moreDetails(singleData)}
                    {postedByInfo(singleData)}
                    <View className="border border-t-3 border-b-0 border-l-0 border-r-0 border-gray-200 p-4">
                        <ReviewComponent review={[]} item={singleData} />
                    </View>
                    {/* {similarItemsInfo()} */}

                </View>
            </ScrollView>

            {chatcall(singleData)}


        </SafeAreaView>
    )

    function moreDetails() {
        return (
            <View className="m-4 ">

                <View className="flex-row items-center">
                    <Text className="  text-gray-600 mb-2 font-bold">{t("NGMP ID : ")}</Text>
                    <Text className="font-medium text-base mb-2" >{singleData?.uniquepid}</Text>
                </View>

                <View className="flex-row items-center">
                    <Text className="  text-gray-600 mb-2 font-bold">{t("Condition : ")}</Text>
                    {singleData?.condition === "New" &&
                        <Text className="font-medium text-base mb-2">{t("Used")}</Text>}

                    {singleData?.condition === "Refurbished" &&
                        <Text className="font-medium text-base mb-2">{t("Refurbished")}</Text>}
                </View>
                <View className="flex-row items-center">
                    <Text className="  text-gray-600 mb-2 font-bold">{t("Category : ")}</Text>
                    <Text className="font-medium text-base mb-2" >{singleData?.category}</Text>
                </View>
                <View className="flex-row items-center">
                    <Text className=" text-gray-600 mb-2 font-bold">{t("Subcategory : ")}</Text>
                    <Text className="font-medium text-base mb-2" >{singleData?.subcategory}</Text>
                </View>
                <View className="flex-row items-center  italic">
                    <Text className=" text-gray-600 mb-2 font-bold">{t("Product location : ")}</Text>
                    <Text className="font-medium text-base mb-2" >{singleData?.product_ship_from}</Text>
                </View>
                <View>
                    {
                        singleData?.quantity === 0 &&
                        <View className="flex-row items-center space-x-1  p-1.5 mb-3 mt-1">
                            <MaterialCommunityIcons name="close-circle" size={18} color="#FF000080" />
                            <Text className=" italic text-[#FF000080] font-bold">OUT OF STOCK</Text>
                        </View>

                    }
                    {
                        (singleData?.quantity > 0 && singleData?.quantity < 10) &&
                        <View>

                            <Text className="text-green-600 italic text-base font-medium mt-1 mb-1" >{`Only ${singleData?.quantity} left in stock`}</Text>
                        </View>
                    }
                    {/* /////select Somalian city///////////// */}

                    <View>
                        {
                            singleData?.quantity !== 0 ? <View>
                                {
                                    singleData?.vendorInfo?.company_district ?
                                        <View>{
                                            somalian_district ? <View>
                                                {
                                                    shippingrate === 0 ? <Text className="text-red-600 italic text-base font-medium mt-1 mb-3">Shipping Unavailable</Text> :
                                                        <Text className="text-green-600 italic text-base font-medium mt-1 mb-3">{`Shipping Fee : $${shippingrate} , From ${singleData?.vendorInfo?.company_district} To ${somalian_district}`}</Text>
                                                }
                                            </View> :
                                                <TouchableOpacity className="border px-2 py-1 my-1.5 border-gray-300 rounded-md" onPress={() => navigation.push("selectMogadishuDistrict")}>
                                                    <Text className="font-medium   text-lg ">Select mogadishu District to check availability</Text>
                                                </TouchableOpacity>
                                        }

                                        </View> :
                                        <Text className="text-red-600 italic text-base font-medium mt-1 mb-3">{`Only Pickup Available (${singleData?.product_ship_from})`}</Text>}
                            </View> : <View><Text></Text></View>
                        }
                    </View>






                </View>

                {
                    singleData?.additionaldescription && singleData?.additionaldescription.length > 0 ? <View >
                        <Text className="font-bold text-xl mb-2">{t("Description")}</Text>
                        <Text className="leading-5">
                            {appLangcode === "so" ?
                                singleData?.somali_additionaldescription === "" ? singleData?.additionaldescription : singleData?.somali_additionaldescription :
                                singleData?.additionaldescription}
                        </Text>
                    </View> : <Text className="italic">{t("No Description Available")}</Text>
                }
                {
                    singleData?.keyfeatures && <View >
                        <Text className="font-bold text-xl py-4">{t("Key Features")}</Text>
                        <Text>
                            {singleData.keyfeatures}
                        </Text>
                    </View>
                }
                <View>
                    {Object.entries(updatedAttributesSpecification)?.length > 0 ? (
                        <Text className="font-bold text-xl py-4">{t("Specifications")}</Text>
                    ) : (
                        <Text className="italic mt-4">{t("No Specifications Available")}</Text>
                    )}

                    {Object.entries(updatedAttributesSpecification)?.map(([key, value]) => (
                        <View key={key} className="flex-row items-center space-x-2">
                            <Text className="capitalize font-bold py-2 text-gray-500">{key} : </Text>
                            <Text className="text-left">
                                {/* {value.text} Ensure that 'value.text' is rendered within a Text component */}
                                {value.hyperlink && (
                                    <TouchableOpacity onPress={() => Linking.openURL(value.hyperlink)}>
                                        <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>
                                            {value.hyperlink}
                                            {/* asa / */}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </Text>
                        </View>
                    ))}
                </View>

            </View>
        )
    }

    function chatcall() {
        return (
            <View>
                {
                    singleData?.quantity === 0 ?


                        <TouchableOpacity className="  bg-red-800 h-12 px-2 py-2.5 space-x-3   w-full justify-center    flex-row items-center" onPress={() => navigation.goBack()} >
                            <MaterialCommunityIcons name="close-circle" size={20} color="#fff" />


                            <Text className="text-xl  text-white font-bold rounded ">{t("Out Of Stock")}</Text>

                        </TouchableOpacity>

                        : <View className=" w-full">
                            {
                                !IsMatchedCartProduct ?
                                    loading ? <View className="p-2"><ActivityIndicator color={'gray'} size={'large'} /></View> : <TouchableOpacity className={`${shippingrate === 0 ? "bg-[#fb7701]/25" : "bg-[#fb7701]"}   w-full justify-center    flex-row items-center`} onPress={async () => {

                                        if (shippingrate !== 0) {
                                            const updatedSingleData = {
                                                ...singleData,
                                                added_quantity: 1, // This adds the productToAdd object as a property of singleData
                                                mrp: mrpData, // Set the mrp value here
                                                sellingprice: sellingPriceData, // Set the sellingprice value here
                                                label: selectLabel, // Set the sellingprice value here,
                                            };
                                            setLoading(true)

                                            const { category, subcategory, uniquepid, vendorid } = singleData;
                                            const replacecategory = category
                                                .replace(/[^\w\s]/g, "")
                                                .replace(/\s/g, "");
                                            const replacesubcategory = subcategory
                                                .replace(/[^\w\s]/g, "")
                                                .replace(/\s/g, "");
                                            if (customerId) {
                                                try {           // Create an object with the data you want to send in the request body
                                                    const requestData = {
                                                        customer_id: customerId,
                                                        vendor_id: vendorid,
                                                        product_uniqueid: uniquepid,
                                                        category: replacecategory,
                                                        subcategory: replacesubcategory,
                                                        variantlabel: selectLabel,
                                                        mrp: mrpData,
                                                        sellingprice: sellingPriceData,
                                                        added_quantity: 1, // Increase the quantity by 1,
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
                                                    dispatch(addItem(updatedSingleData))
                                                    dispatch(incrementCartTotal())
                                                    setisUniquepidMatched(true)

                                                    updateState({ inCart: true, showSnackBarcart: true, })
                                                } catch (error) {
                                                    console.error('Error updating cart:', error);
                                                }
                                            } else {
                                                dispatch(addItem(updatedSingleData))
                                                dispatch(incrementCartTotal())

                                            }

                                            setLoading(false)
                                        }


                                    }}

                                    >
                                        <MaterialCommunityIcons name="cart" size={25} color={Colors.whiteColor} />

                                        <Text className="text-xl h-12 px-2 py-2.5 text-white font-bold rounded ">{t("Add To Cart")}</Text>

                                    </TouchableOpacity>
                                    :
                                    <View className="flex-row justify-between w-full">
                                        <View className="flex-row  w-1/2 
                         items-center justify-between h-12 bg-[#fb7701] flex-1" >
                                            {IsMatchedCartProduct?.added_quantity === 1 ?
                                                <TouchableOpacity
                                                    className="ml-3"
                                                    onPress={(IsMatchedCartProduct?.added_quantity === 1 ? () => handleRemove(singleData?.uniquepid, singleData) : () => handleDecrement(id, singleData))} >
                                                    <MaterialCommunityIcons

                                                        name="delete" size={24} color="white" />
                                                </TouchableOpacity> :
                                                <TouchableOpacity onPress={(() => handleDecrement(IsMatchedCartProduct?.uniquepid, IsMatchedCartProduct))}
                                                    className="  ">
                                                    {
                                                        cartminusloader ? <ActivityIndicator className="ml-3" color="white" size={20} /> :
                                                            <Text className="text-4xl ml-3 font-bold text-white">-</Text>
                                                    }
                                                </TouchableOpacity>}
                                            <Text className="text-white text-base font-semibold">{IsMatchedCartProduct?.added_quantity} {t("Added")}</Text>
                                            <TouchableOpacity onPress={
                                                IsMatchedCartProduct?.added_quantity !== singleData.quantity ?
                                                    (() => handleIncrement(IsMatchedCartProduct?.uniquepid, IsMatchedCartProduct))
                                                    : (() => Alert.alert("", `Only ${singleData?.quantity} left in stock`))}
                                                className=""
                                            >
                                                {
                                                    cartplusloader ?
                                                        <ActivityIndicator className="mr-3" color="white" size={20} /> :


                                                        <Text className={`text-4xl  mr-3 font-bold ${IsMatchedCartProduct?.added_quantity === singleData.quantity ? "text-[#170e0645]" : "text-white"} `}>+</Text>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                        <View className="flex-1 items-center justify-center  border border-gray-200 ">
                                            <TouchableOpacity
                                                className=""
                                                onPress={debounce(() => {
                                                    dispatch(changeSearchFocus(true))
                                                    navigation.navigate("Cart")
                                                }, 500)}>

                                                <View className=" flex-row items-center ">
                                                    <Text className="text-[#00008b] text-base font-bold">{t("Go To Cart")}</Text>
                                                    <Text className=""><MaterialCommunityIcons name="chevron-right" size={24} color={"#00008b"} className="" /></Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>


                            }

                        </View>
                }
            </View>

        )
    }


    function postedByInfo(singleData) {
        // const placeholderImageUrl = 'https://www.sfb1425.uni-freiburg.de/wp-content/uploads/2021/05/dummy-profile-pic-360x360.png';
        if (singleData?.vendorInfo) {
            const { brand_logo, brand_name } = singleData?.vendorInfo
            let imageUrl = ''; // Define imageUrl variable

            if (brand_logo && brand_logo?.images && brand_logo?.images.length > 0) {
                // If brand logo image exists, try setting imageUrl to its URL
                imageUrl = `${AdminUrl}/uploads/vendorBrandLogo/${brand_logo?.images?.[0]}`;
            }

            return (
                <View style={{ margin: Sizes.fixPadding * 1.0, }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text className="text-xl font-bold">
                            {t('Posted By')}
                        </Text>
                        <TouchableOpacity className="flex-row items-center space-x-1"
                            onPress={debounce(() => {
                                const screenName = customerData?.length > 0 ? 'InboxChatScreen' : 'Login';
                                navigation.navigate(screenName, { data: singleData?.vendorInfo });
                            }, 300)}
                        >
                            <MaterialCommunityIcons name="chat" size={20} color="gray" />
                            <Text className="text-base font-medium">
                                {t('Message Seller')}
                            </Text>
                        </TouchableOpacity>

                    </View>
                    <TouchableOpacity
                        onPress={debounce(() => navigation.push('UserProfile', { item: singleData }), 500)}
                        style={{ marginTop: Sizes.fixPadding, flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={imageUrl ? { uri: imageUrl } : require('../../assets/images/dummy-profile-pic.png')}

                            style={{ width: 45.0, height: 45.0, borderRadius: 20.0 }}
                        />
                        <Text style={{ marginLeft: Sizes.fixPadding - 1.0, ...Fonts.blackColor14SemiBold }}>
                            {brand_name}
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }
        else return (
            <View></View>
        )

    }



    function productDetail(singleData) {
        const {
            uniquepid,
            ad_title,
            somali_ad_title,
            mrp,
            sellingprice,
            isvariant,
            category,
            subcategory,
            product_ship_from,
            estimate_delivery_by
        } = singleData;

        const discountPercentageSimple = ((mrp - sellingprice) / mrp) * 100;

        const [variantsWithArray, setvariantsWithArray] = useState(null);
        const [variantsData, setVariantsData] = useState(null);

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const replacecategory = category
                        ?.replace(/[^\w\s]/g, '')
                        .replace(/\s/g, '');
                    const replaceSubcategory = subcategory
                        ?.replace(/[^\w\s]/g, '')
                        .replace(/\s/g, '');

                    const variantsData = await getVariantsOfCatSubcat(
                        replacecategory,
                        replaceSubcategory,
                        uniquepid
                    );

                    setVariantsData(variantsData);
                } catch (error) {
                    console.error('Failed to fetch variants:', error);
                }
            };

            isvariant === 'Variant' && fetchData();
        }, []);

        useEffect(() => {
            // Create a new variants object
            if (!variantsWithArray) {
                const newVariantsWithArray = variantsData?.reduce((acc, variant) => {
                    const variantsvaluesObj = variant?.variantsvalues
                        ? JSON.parse(variant.variantsvalues)
                        : {};

                    // Initialize the accumulator if it doesn't exist
                    if (!acc.variantsvalues) {
                        acc.variantsvalues = {};
                    }

                    // Iterate over the attributes in variantsvaluesObj
                    for (const attribute in variantsvaluesObj) {
                        if (acc.variantsvalues.hasOwnProperty(attribute)) {
                            // If the attribute already exists in the accumulator, push the value to the array
                            acc.variantsvalues[attribute].push(variantsvaluesObj[attribute]);
                        } else {
                            // If the attribute doesn't exist in the accumulator, create a new array with the value
                            acc.variantsvalues[attribute] = [variantsvaluesObj[attribute]];
                        }
                    }

                    return acc;
                }, {}) || {};

                for (const attribute in newVariantsWithArray?.variantsvalues) {
                    const valuesArray = newVariantsWithArray?.variantsvalues[attribute];
                    newVariantsWithArray.variantsvalues[attribute] = [...new Set(valuesArray)];
                }

                // Check if newVariantsWithArray is not empty, null, or undefined before setting the state
                if (Object.keys(newVariantsWithArray).length > 0) {
                    // Convert newVariantsWithArray.variantsvalues to an array of objects
                    const variantsArray = Object.keys(newVariantsWithArray?.variantsvalues).map((attribute) => ({
                        attribute,
                        values: newVariantsWithArray.variantsvalues[attribute],
                    }));

                    setvariantsWithArray(variantsArray);
                }
            }
        }, [variantsWithArray, variantsData]);

        useEffect(() => {
            if (variantsWithArray && variantsWithArray.length > 0) {
                // Initialize selectedAttributes with the first set of attribute values
                const initialSelectedAttributes = {};
                variantsWithArray.forEach((variant) => {
                    initialSelectedAttributes[variant.attribute] = variant.values[0];
                });

                // Combine the selected attribute values into a single string
                const formattedSelection = Object.keys(initialSelectedAttributes)
                    .map((attribute) => `${initialSelectedAttributes[attribute]}`)
                    .join('/');

                // Find the variant with the matching label
                const selectedVariant = variantsData.find((variant) => variant.label === formattedSelection);
                if (selectedVariant) {
                    // Set the mrp and sellingprice based on the selected variant

                    setMrp(selectedVariant.variant_mrp);
                    setSellingPrice(selectedVariant.variant_sellingprice);
                    setselectLabel(selectedVariant?.label)
                    setsingleData({ ...singleData, mrp: selectedVariant.variant_mrp, sellingprice: selectedVariant.variant_sellingprice, label: selectedVariant?.label })
                    const discountPercentage = ((selectedVariant.variant_mrp - selectedVariant.variant_sellingprice) / selectedVariant.variant_mrp) * 100;
                    setDiscountPercentage(discountPercentage?.toFixed(0)); // Rounded to 2 decimal places
                }
                setSelectedAttributes(initialSelectedAttributes);
            }
        }, [variantsWithArray]);

        const handleAttributeSelect = (attribute, value) => {
            // Create a copy of the selectedAttributes
            let updatedSelectedAttributes = { ...selectedAttributes };
            if (Array.isArray(updatedSelectedAttributes)) {
                // If selectedAttributes is an array, find the index of the attribute and update its value
                const index = updatedSelectedAttributes.findIndex((attr) => attr === attribute);

                if (index !== -1) {
                    updatedSelectedAttributes[index + 1] = value; // Update the value at the next index
                } else {
                    // If the attribute doesn't exist in the array, add it with the new value
                    updatedSelectedAttributes.push(attribute, value);
                }
            } else {
                // If selectedAttributes is an object, update or add the attribute-value pair
                updatedSelectedAttributes[attribute] = value;
            }

            // Convert updatedSelectedAttributes to the desired format
            let formattedSelection = '';

            if (Array.isArray(updatedSelectedAttributes)) {
                formattedSelection = updatedSelectedAttributes
                    .map((item, index) => (index % 2 === 0 ? `${item}/` : item))
                    .join('');
            } else {
                formattedSelection = Object.keys(updatedSelectedAttributes)
                    .map((key) => `${updatedSelectedAttributes[key]}`)
                    .join('/');
            }

            // Set the updated selected attributes in the state
            setSelectedAttributes(updatedSelectedAttributes);
            // Compare formattedSelection with label in variantsData
            const selectedVariant = variantsData.find((variant) => variant.label === formattedSelection);

            if (selectedVariant) {
                // Retrieve mrp and sellingprice from the selected variant
                const { variant_mrp, variant_sellingprice, label } = selectedVariant;
                setMrp(variant_mrp);
                // singleData = {...singleData, mrp: variant_mrp}
                setSellingPrice(variant_sellingprice);
                setselectLabel(label)
                setsingleData({ ...singleData, mrp: variant_mrp, sellingprice: variant_sellingprice, label: label })

                // Calculate the discount percentage
                const discountPercentage = ((variant_mrp - variant_sellingprice) / variant_mrp) * 100;
                setDiscountPercentage(discountPercentage?.toFixed(2)); // Rounded to 2 decimal places
            } else {
            }
        };

        return (
            <View>

                <Text className="mx-3 my-1.5 text-lg">
                    {appLangcode === "so" ?
                        somali_ad_title === null ? ad_title : somali_ad_title :
                        ad_title}
                </Text>
                <View className="border border-b-2 pb-2 border-gray-200 border-l-0 border-r-0 border-t-0">
                    {isvariant === 'Variant' ? (
                        // Display variant details
                        <View style={{ flex: 1 }}>
                            {priceSection(discountPercentageSimple, mrp, sellingprice, c_symbol)}
                            {variantsWithArray?.map((attributeData) => (
                                <View key={attributeData.attribute} className="p-3">
                                    <Text className={`text-lg font-semibold text-[#0d0c22]/90 ${selectedAttributes?.[attributeData?.attribute] === attributeData?.values ? 'active' : ''}`}>
                                        {attributeData?.attribute} : {selectedAttributes?.[attributeData?.attribute]}
                                    </Text>
                                    <View className="flex-row gap-4 flex-wrap relative top-2 mb-4">
                                        {attributeData?.values?.map((item) => (
                                            <TouchableOpacity
                                                key={item}
                                                onPress={() => {
                                                    handleAttributeSelect(attributeData.attribute, item);
                                                }}
                                                className={`${selectedAttributes?.[attributeData?.attribute] === item ? 'bg-orange-500' : ''} rounded`}
                                            >
                                                <Text className={selectedAttributes?.[attributeData?.attribute] === item ? 'p-3 text-white' : 'text-black p-3'}>
                                                    {item}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ))}

                        </View>
                    ) :
                        // Display non-variant details
                        priceSection(discountPercentageSimple, mrp, sellingprice, c_symbol, estimate_delivery_by, product_ship_from)

                    }
                </View>

            </View>
        );
    }
}

const priceSection = (discountPercentageSimple, mrp, sellingprice, c_symbol, estimate_delivery_by, product_ship_from) => {
    return <>
        <View>

            <View className={`flex-row ${discountPercentageSimple > 50 && 'bg-green-100/60  py-2 mx-2 mb-2'}    rounded-md items-end justify-between`}>
                <View>
                    {
                        discountPercentageSimple > 50 && <Text className="font-bold ml-3 mr-1 text-green-700 tracking-wide">
                            {t("Special Offer")}
                            <MaterialCommunityIcons name="offer" className="ml-2" size={14} color={'green'} />
                        </Text>
                    }



                </View>

            </View>
            <View className="mx-4">

                <View className="gap-1 flex-row items-center">
                    <Text className="text-lg font-medium text-gray-700">{t("Price :")}</Text>
                    {discountPercentageSimple && discountPercentageSimple > 0 && (
                        <Text className="text-lg" style={{ color: 'green' }}>-{discountPercentageSimple?.toFixed(2)}%</Text>
                    )}
                    <View className="flex-row ">

                        <Text className="text-[14px] ml-1 font-medium">{`${c_symbol} `}</Text>
                        <Text className="text-gray-900 text-lg" style={{ fontWeight: 'bold' }}>
                            {`${sellingprice % 1 === 0 ? Math.trunc(sellingprice) : sellingprice}`}
                        </Text>
                    </View>
                </View>
                {
                    discountPercentageSimple !== 0 &&
                    <View className="flex-row items-center mb-1">
                        <Text className="text-gray-500 font-medium text-[14px] line-through">{t("List Price: ")}</Text>
                        <Text style={styles.mrpPrice} className="font-medium text-base line-through text-gray-500">
                            {`$${mrp % 1 === 0 ? Math.trunc(mrp) : mrp}`}
                        </Text>
                    </View>
                }
                {/* {
                    !estimate_delivery_by &&
                    <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 14, marginBottom: 3, fontStyle: 'italic' }}>
                        {`${t("Expected By:")} ${t(estimate_delivery_by)}`}
                    </Text>
                } */}
            </View>
        </View>
    </>
}

const styles = StyleSheet.create({


});

export default ProductDetailScreen;