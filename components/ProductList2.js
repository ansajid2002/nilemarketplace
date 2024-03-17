import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableNativeFeedback,
    Platform,
    ScrollView,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { AdminUrl } from '../constant';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';

import StarRating from './FiveStarRating';
// import { getReviewData } from '../screens/Currencyconvertedfile';
import { getReviewData } from './getReviewData';
import { useTranslation } from 'react-i18next';
import { ProductSkeleton } from './Skeleton';
import { calculateAverageRating, countNonEmptyReviews } from './ReviewsComponent';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toggleFavouriteProductslice } from '../store/slices/productSlice';
import { addItemToWishlist, removeItemFromWishlist } from '../store/slices/wishlistSlice';
import Animated from 'react-native-reanimated';
import { productUrl } from '../constant'

const ProductItem = ({ item }) => {
    const navigation = useNavigation();
    const { c_symbol } = useSelector((store) => store.selectedCurrency);
    const discountPercentageSimple = ((item.mrp - item.sellingprice) / item.mrp) * 100;
    const [reviewData, setReviewData] = useState([]);
    const [averageRating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState(0);
    const [loader, setLoader] = useState(false);
    const [inFavorite, setinFavorite] = useState(false);
    const wishlistItems = useSelector((state) => state.wishlist.wishlistItems);
    const { customerData } = useSelector((store) => store.userData);
    const customerId = customerData[0]?.customer_id;
    const dispatch = useDispatch();
    const {t} = useTranslation()
    const {appLangcode} = useSelector((store) => store.selectedCurrency)

    useEffect(() => {
        // Check if there's an item in wishlistItems with a matching uniquepid
        const isFavorite = wishlistItems.some((wish) => wish.uniquepid === item.uniquepid);

        setinFavorite(isFavorite);
    }, [wishlistItems]);

    const handleToggleWishlist = useCallback(async () => {
        if (!customerId) return navigation.navigate('Login');
        setLoader(true);

        const { category, subcategory, uniquepid, vendorid } = item;
        const replacecategory = category.replace(/[^\w\s]/g, '').replace(/\s/g, '');
        const replacesubcategory = subcategory.replace(/[^\w\s]/g, '').replace(/\s/g, '');
        const requestData = {
            customer_id: customerId,
            vendor_id: vendorid,
            uniquepid,
            category: replacecategory,
            subcategory: replacesubcategory,
            label: null,
            mrp: null,
            sellingprice: null,
        };

        if (!inFavorite) {

            dispatch(addItemToWishlist({ ...item }));

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
                    setinFavorite(true);
                    setLoader(false);
                } catch (error) {
                    console.error('Error updating wishlist:', error);
                    setLoader(false);
                }
            }
        } else {
            setLoader(true);

            dispatch(removeItemFromWishlist({ ...item }));
            if (customerId) {
                try {
                    // Make a POST request to your API endpoint for updating the wishlist
                    const response = await fetch(`${AdminUrl}/api/removeFromWishlist`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestData),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const responseData = await response.json();
                    setinFavorite(false);
                } catch (error) {
                    console.error('Error updating wishlist:', error);
                }
                setLoader(false);
            }
        }

        dispatch(toggleFavouriteProductslice(item));
    }, [customerId, dispatch, inFavorite, item, navigation, setinFavorite, setLoader]);

    const fetchReviewData = useCallback(async () => {
        try {
            const data = await getReviewData(item.uniquepid);
            setReviewData(data?.ratingsData);

            // Calculate the average rating
            const averageRating = calculateAverageRating(data?.ratingsData);
            const nonEmptyReviewCount = countNonEmptyReviews(data?.ratingsData);
            setRating(averageRating);
            setReviewText(nonEmptyReviewCount);
        } catch (error) {
            console.error('Error:', error);
        }
    }, [item.uniquepid, setRating, setReviewData, setReviewText]);

    useEffect(() => {
        reviewData?.length === 0 && fetchReviewData();
    }, [fetchReviewData, reviewData?.length]);

    const handlePress = debounce(() => navigation.push('ProductDetail', item), 100);

    const TouchableComponent = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

    const [loading, setLoading] = useState(true);
  

    return (
        <TouchableComponent onPress={handlePress}>
            <View style={{ padding: 5 }} className="border border-b-0 w-full border-gray-200">
                <View>
                    {loading && (
                        <ActivityIndicator size="large" color="gray" style={styles.loadingIndicator} />
                    )}
                    <Animated.Image
                        resizeMode="cover"
                        source={{ uri: `${productUrl}/${item.images?.[0]}` }}
                        defaultSource={require('../assets/noimage.jpg')}
                        // style={styles.image}
                        className="max-w-full aspect-[0.857]"
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                       
                    />
                    <TouchableOpacity
                        style={{ position: 'absolute', top: 4, right: 4 }}
                        onPress={debounce(handleToggleWishlist, 500)}>
                        {loader ? (
                            <ActivityIndicator color={'red'} />
                        ) : (
                            <MaterialCommunityIcons
                                name={`heart`}
                                size={28}
                                color={`${inFavorite ? '#C21E56' : '#b5bab6'}`}
                            />
                        )}
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 1 }} className="py-2">
                    <Text numberOfLines={2} className="font-medium text-[14px] leading-[21px] mt-2">
                        {item?.condition === "Refurbished" &&  `(${t("Refurbished")})`}
                        {item?.condition === "Used" && `(${t("Used")})`}
                        {appLangcode === "so" ?  
                        item?.somali_ad_title=== null ? item?.ad_title : item?.somali_ad_title  :
                         item?.ad_title }
                    </Text>

                    <View className=" flex-row gap-1 flex-wrap" style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8 }}>
                        <Text className="text-[16px] font-medium text-gray-700">{t("Price: ")}</Text>
                        {discountPercentageSimple && discountPercentageSimple > 0 && (
                            <Text className="text-[13px]" style={{ color: 'green' }}>-{discountPercentageSimple?.toFixed(2)}%</Text>
                        )}
                        <View className="flex-row  ">
                            <Text className="text-[15px] ml-1 font-medium">{`${c_symbol} `}</Text>
                            <Text className="text-gray-900 text-[15px]" style={{ fontWeight: 'bold' }}>
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

                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 5 }}>
                        <StarRating
                            enable={false}
                            reviewButton={false}
                            size={`[20px]`}
                            rating={averageRating || 3}
                            onRatingChange={() => { }}
                            item={item}
                            color={`text-green-800`}
                        />
                        {parseInt(reviewText) > 0 && (
                            <Text style={{ fontSize: 14, color: 'green' }}>{`(${reviewText})`}</Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableComponent>
    );
};

export const renderItemOrSkeleton = ({ item }) => {
    return (
        <View className="w-1/2">
            <ProductItem item={item} />
        </View>
    );
};


















const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        marginBottom: 10,

    },
    productContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 5,
    },
    image: {
        width: '100%',
        height: 200,
    },
    discountText: {
        backgroundColor: 'white',
        color: '#fb7701',
        fontSize: 12,
        fontWeight: 'bold',
        borderRadius: 3,
        borderWidth: 1,
        borderColor: '#fb760167',
        padding: 1,
    },

    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    sellingPrice: {
        color: '#fb7701',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 1,
    },
    mrpPrice: {
        textDecorationLine: 'line-through',
        fontSize: 14,
        color: 'gray',
    },
    title: {
        textTransform: 'capitalize',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 5,
        fontSize: 18,
        fontWeight: 'bold',
        padding: 10,
    },
    image: {
        height: 300,
        width: '100%',
    },
    placeholderImage: {
        height: 300,
        width: '100%',
        position: 'absolute',
    },
    loadingIndicator: {
        position: 'absolute',
        alignSelf: 'center',
        top: '50%',
    },
});

export default renderItemOrSkeleton;
