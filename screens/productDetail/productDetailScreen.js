import React, { useState } from "react";
import { SafeAreaView, View, Image, Dimensions, ScrollView, StatusBar, Share, FlatList, StyleSheet, Text, ImageBackground, Alert, Button, ActivityIndicator, LogBox } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons, } from '@expo/vector-icons';
import { Snackbar } from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { addItem, decrementItem, decrementCartTotal,incrementCartTotal, incrementItem, removeItem } from "../../store/slices/cartSlice";
import { addItemToWishlist, removeItemFromWishlist } from "../../store/slices/wishlistSlice";
import { toggleFavouriteProductslice } from "../../store/slices/productSlice";
import { debounce } from "lodash";
import { AdminUrl, HeaderBar, getVariantsOfCatSubcat } from "../../constant";
import { useEffect } from "react";
// import "../../assets/images/users/user"
import Slider from "../../components/Slider/Slider";
import ReviewComponent from "../../components/ReviewsComponent";
import { changeSearchFocus, changetabbarIndex } from "../../store/slices/counterslice";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useRef } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import Icon from 'react-native-vector-icons/Ionicons';
import search from "../../assets/images/icons/search-interface-symbol.png"
// import ShareProduct from "../../components/ShareProduct";
import shareimg from "../../assets/images/icons/share.png"
// import { AdminUrl } from '../../constant';


const ProductDetailScreen = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const itemData = route.params;
    const [singleData, setsingleData] = useState(itemData)
    const { customerData } = useSelector((store) => store.userData)
    const [selectedAttributes, setSelectedAttributes] = useState(null);
    const [selectLabel, setselectLabel] = useState(singleData?.label);
    const [mrpData, setMrp] = useState(singleData.mrp);
    const [sellingPriceData, setSellingPrice] = useState(singleData.sellingprice);
    const [discountPercentage, setDiscountPercentage] = useState(null);
    const [isUniquepidMatched, setisUniquepidMatched] = useState(null);
    const [IsMatchedCartProduct, setIsMatchedCartProduct] = useState(null);
    const [inFavorite, setinFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    const customerId = customerData[0]?.customer_id
    const { t } = useTranslation()
    const { c_symbol } = useSelector((store) => store.selectedCurrency)
    const cartItems = useSelector((state) => state.cart.cartItems);
    const wishlistItems = useSelector((state) => state.wishlist.wishlistItems)

    useEffect(() => {
        // Check if there's an item in wishlistItems with a matching uniquepid
        const isFavorite = wishlistItems.some(wish => wish.uniquepid === singleData.uniquepid);
        setinFavorite(isFavorite);
    }, [wishlistItems]);

    const [state, setState] = useState({
        showSnackBar: false,
        productImages: singleData.images,
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
            dispatch(removeItem(item));

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
        }
    };

    const ShareProduct = ({ product }) => {
        const shareProduct = async () => {

            try {
                const sharedMessage = `Check out this product: ${product.ad_title}\n\nProduct URL: https://stg.nilegmp.com/product-detail?product=${product.prod_slug}&uniqueid=${product.uniquepid}`;

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
                {/* <Text>ssssa</Text> */}
                <Image
                    source={shareimg}
                    style={{ width: 30.0, height: 30.0, borderRadius: 20.0 }}
                />
            </TouchableOpacity>
        );
    }
    const handleIncrement = async (itemId, item) => {
        try {
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
                    quantity: 1, // Decrement the quantity by 1
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

    const handleDecrement = async (itemId, item) => {
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
                    quantity: -1, // Decrement the quantity by 1
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

    const renderBackdrop = useCallback(
        (props) => <BottomSheetBackdrop {...props} />,
        []
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
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
                        {/* <Text>s</Text> */}
                        <ShareProduct product={singleData} />

                    </TouchableOpacity>


                </View>
            </View>


            <ScrollView>
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
                    <Text className="  text-gray-600 mb-2 font-bold">Condition : </Text>
                    {singleData?.condition === "New" &&
                    <Text className="font-medium text-base mb-2">Used</Text>}
                {singleData?.condition === "Refurbished" &&
                    <Text className="font-medium text-base mb-2">Refurbished</Text>}
                    </View>
                <View className="flex-row items-center">
                    <Text className="  text-gray-600 mb-2 font-bold">Category : </Text>
                    <Text className="font-medium text-base mb-2" >{singleData?.category}</Text>
                </View>
                <View className="flex-row items-center  mb-3">
                    <Text className=" text-gray-600 mb-2 font-bold">Subcategory : </Text>
                    <Text className="font-medium text-base mb-2" >{singleData?.subcategory}</Text>
                </View>
                {/* <Text className="text-base">Category : </Text></Text> */}

                {
                    singleData?.additionaldescription && singleData?.additionaldescription.length > 0 ? <View >
                        <Text className="font-bold text-xl mb-2">Description</Text>
                        <Text className="leading-5">
                            {singleData?.additionaldescription}
                        </Text>
                    </View> : <Text className="italic">No Description Available</Text>
                }
                {
                    singleData?.keyfeatures && <View >
                        <Text className="font-bold text-xl py-4">Key Features</Text>
                        <Text>
                            {singleData.keyfeatures}
                        </Text>
                    </View>
                }
                <View>
                    {Object.entries(updatedAttributesSpecification).length > 0 ? (
                        <Text className="font-bold text-xl py-4">Specifications</Text>
                    ) : (
                        <Text className="italic mt-4">No Specifications Available</Text>
                    )}

                    {Object.entries(updatedAttributesSpecification).map(([key, value]) => (
                        <View key={key} className="flex-row items-center  space-x-2">
                            <Text className="capitalize font-bold py-2 text-gray-500">{key} : </Text>
                            <Text className="text-left">{value}</Text>
                        </View>
                    ))}
                </View>

            </View>
        )
    }

    function chatcall() {
        return (
            <View className=" w-full">
                {
                    !IsMatchedCartProduct ?
                        loading ? <View className="p-2"><ActivityIndicator color={'blue'} size={'large'} /></View> : <TouchableOpacity className="  bg-[#fb7701]   w-full justify-center    flex-row items-center" onPress={async () => {
                            const updatedSingleData = {
                                ...singleData,
                                added_quantity: 1, // This adds the productToAdd object as a property of singleData
                                mrp: mrpData, // Set the mrp value here
                                sellingprice: sellingPriceData, // Set the sellingprice value here
                                label: selectLabel, // Set the sellingprice value here
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
                                        quantity: 1, // Decrement the quantity by 1
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

                        }}>
                            <MaterialCommunityIcons name="cart" size={25} color={Colors.whiteColor} />

                            <Text className="text-xl h-12 px-2 py-2.5 text-white font-bold rounded ">{t("Add To Cart")}</Text>

                        </TouchableOpacity>
                        :
                        <View className="flex-row ">
                            <View className=" flex-row  
                         items-center justify-between h-12 bg-[#fb7701] flex-1" >
                                {IsMatchedCartProduct?.added_quantity === 1 ?
                                    <TouchableOpacity
                                        className="ml-3"
                                        onPress={(IsMatchedCartProduct?.added_quantity === 1 ? () => handleRemove(singleData?.uniquepid, singleData) : () => handleDecrement(id, singleData))} >
                                        {/* <Text style={styles.buttonText}>--</Text> */}
                                        <MaterialCommunityIcons

                                            name="delete" size={24} color="white" />
                                    </TouchableOpacity> :
                                    <TouchableOpacity onPress={(() => handleDecrement(IsMatchedCartProduct?.uniquepid, IsMatchedCartProduct))}
                                        className="  ">
                                        <Text className="text-4xl ml-3 font-bold text-white">-</Text>
                                    </TouchableOpacity>}
                                <Text className="text-white text-base font-semibold">{IsMatchedCartProduct?.added_quantity} {t("Added")}</Text>
                                <TouchableOpacity onPress={(() => handleIncrement(IsMatchedCartProduct?.uniquepid, IsMatchedCartProduct))}
                                    className=""
                                >
                                    <Text className="text-3xl  mr-3 font-bold text-white" >+</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="   flex-1 items-center justify-center  border border-gray-200 ">
                                <TouchableOpacity className=" "
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
        )
    }


    function postedByInfo(singleData) {
        // const placeholderImageUrl = 'https://www.sfb1425.uni-freiburg.de/wp-content/uploads/2021/05/dummy-profile-pic-360x360.png';
        if (singleData.vendorInfo) {


            const { brand_logo, brand_name } = singleData?.vendorInfo
            let imageUrl = ''; // Define imageUrl variable

            if (brand_logo && brand_logo?.images && brand_logo?.images.length > 0) {
                // If brand logo image exists, try setting imageUrl to its URL
                imageUrl = `${AdminUrl}/uploads/vendorBrandLogo/${brand_logo?.images[0]}`;
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
            created_at,
            condition,
            mrp,
            sellingprice,
            isvariant,
            category,
            subcategory,
        } = singleData;

        const discountPercentageSimple = ((mrp - sellingprice) / mrp) * 100;
        const savings = mrp - sellingprice;

        // const formattedCreatedAt = createdDate.toLocaleDateString('en-US', options);

        const [variantsWithArray, setvariantsWithArray] = useState(null);
        const [variantsData, setVariantsData] = useState(null);

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const replacecategory = category
                        .replace(/[^\w\s]/g, '')
                        .replace(/\s/g, '');
                    const replaceSubcategory = subcategory
                        .replace(/[^\w\s]/g, '')
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
                    {ad_title}
                </Text>
                <View className="border border-b-4 border-gray-200 border-l-0 border-r-0 border-t-0">
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
                    ) : isvariant === 'Simple' ? (
                        // Display non-variant details
                        priceSection(discountPercentageSimple, mrp, sellingprice, c_symbol)
                    ) : (
                        // Display skeleton for Simple variant structure
                        // You can add your skeleton loading UI here
                        <></>
                    )}
                </View>

            </View>
        );
    }
}

const priceSection = (discountPercentageSimple, mrp, sellingprice, c_symbol) => {
    return <>
        <View>

            <View className={`flex-row ${discountPercentageSimple > 50 && 'bg-green-100/60  py-2 mx-2 mb-2'}    rounded-md items-end justify-between`}>
                <View>
                    {
                        discountPercentageSimple > 50 && <Text className="font-bold ml-3 text-green-700 tracking-wide">
                            Special Offer
                            <MaterialCommunityIcons name="offer" className="ml-2" size={14} color={'green'} />
                        </Text>
                    }



                </View>

            </View>
            <View className="mx-4">

                <View className="gap-1 flex-row items-center">
                    <Text className="text-lg font-medium text-gray-700">Price:</Text>
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
                    <View className="flex-row items-center mb-2">
                        <Text className="text-gray-500 font-medium text-[14px] line-through">List Price: </Text>
                        <Text style={styles.mrpPrice} className="font-medium text-base line-through text-gray-500">
                            {`$${mrp % 1 === 0 ? Math.trunc(mrp) : mrp}`}
                        </Text>
                    </View>
                }

            </View>
        </View>
    </>
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
    activeDotStyle: {
        marginHorizontal: Sizes.fixPadding - 7.0,
        width: 10.0,
        height: 10.0,
        borderRadius: 6.0,
        backgroundColor: Colors.blackColor
    },
    inActiveDotStyle: {
        marginHorizontal: Sizes.fixPadding - 7.0,
        width: 8.0,
        height: 8.0,
        borderRadius: 4.0,
        backgroundColor: Colors.grayColor
    },
    sliderPaginationWrapStyle: {
        // position: 'absolute',
        // bottom: 0,
        // left: 0.0,
        // right: 0.0,

    },
    snackBarStyle: {
        backgroundColor: '#333333',
        elevation: 0.0,
        position: 'absolute',
        bottom: -10.0,
        left: -10.0,
        right: -10.0,
    },
    similarProductDetailWrapStyle: {
        position: 'absolute',
        bottom: 0.0,
        left: 0.0,
        right: 0.0,
        backgroundColor: Colors.whiteColor,
        borderBottomLeftRadius: Sizes.fixPadding - 5.0,
        borderBottomRightRadius: Sizes.fixPadding - 5.0,
        paddingHorizontal: Sizes.fixPadding - 5.0,
    },
    similarProductWrapStyle: {
        backgroundColor: Colors.whiteColor,
        elevation: 2.0,
        borderRadius: Sizes.fixPadding - 5.0,
        width: 120.0, height: 150.0,
        marginRight: Sizes.fixPadding,
    },
    container: {
        position: "absolute",
        top: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        flex: 1,
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
    },
});

export default ProductDetailScreen;