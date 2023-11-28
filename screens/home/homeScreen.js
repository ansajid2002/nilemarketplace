// ios 216641462687-0vgml3eh21399khfqk6avahgmis7sgo2.apps.googleusercontent.com
// android 216641462687-7mv9inako2l7n3rmp5gq72qu8lquvnn0.apps.googleusercontent.com
// web 216641462687-a2ut20irksvqdes9n9gfgs21p8hp1kq4.apps.googleusercontent.com
import React, { useState, useEffect, memo } from "react";
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    Image,
    StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect, Link } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Colors, Sizes } from "../../constants/styles";
import { debounce } from "lodash";
import { Dimensions } from "react-native";
import { TouchableOpacity } from "react-native";
import ProductListing from "../../components/ProductList";
import ImageCarousel from "../../components/ImageCarousel";
import { AdminUrl } from "../../constant";
import FullPageLoader from "../../components/FullPageLoader";
import { LinearGradient } from 'expo-linear-gradient';
import Notificationtab from "../../components/Notificationtab";
import { useCallback } from "react";
import { useMemo } from "react";
import InCart from "../../components/inCart";
import { AntDesign } from '@expo/vector-icons';
import { CategoryPlaceholder } from "../../components/Skeleton";
import NoLogin from "../../components/NoLogin";


const { width } = Dimensions.get('window');
const HomeScreen = () => {
    const [recommendedProdutcs, setRecommendedProducts] = useState(null)
    const [newArrivals, setNewArrivals] = useState(null)
    const [recommendedProductsFetched, setRecommendedProductsFetched] = useState(false);
    const [newArrivalsFetched, setNewArrivalsFetched] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigation = useNavigation();

    const { t } = useTranslation()
    const { customerData } = useSelector((store) => store.userData)
    const cartItems = useSelector((state) => state.cart.cartItems);
    const { productsList } = useSelector((store) => store.products)

    const customerId = customerData[0]?.customer_id
    const { categoriesData } = useSelector((store) => store.categories);


    const productscategories = useMemo(() => {
        return categoriesData.filter((singleservice) => singleservice.category_type === "Products");
    }, [categoriesData]);

    const productssubcategories = useMemo(() => {
        return productscategories?.map((single) => single.subcategories).flat() || [];
    }, [productscategories]);

    // Now you can use productssubcategories in your component

    const fetchRecommendedProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const recommendedResponse = await fetch(`${AdminUrl}/api/recommendedProducts/${customerId}`);
            if (!recommendedResponse.ok) {
                throw new Error(`HTTP error! Status: ${recommendedResponse.status}`);
            }
            const recommendedData = await recommendedResponse.json();
            setRecommendedProducts(recommendedData);
        } catch (error) {
            setError(error.message || 'An error occurred while fetching recommended products.');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    const fetchNewArrivals = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const newArrivalsResponse = await fetch(`${AdminUrl}/api/newArrivals/${customerId}`);
            if (!newArrivalsResponse.ok) {
                throw new Error(`HTTP error! Status: ${newArrivalsResponse.status}`);
            }
            const newArrivalsData = await newArrivalsResponse.json();
            setNewArrivals(newArrivalsData);
        } catch (error) {
            setError(error.message || 'An error occurred while fetching new arrivals.');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    // Memoize the callback functions so they don't change on re-renders
    const memoizedFetchRecommendedProducts = useMemo(() => fetchRecommendedProducts, [fetchRecommendedProducts]);
    const memoizedFetchNewArrivals = useMemo(() => fetchNewArrivals, [fetchNewArrivals]);

    useEffect(() => {
        // Trigger the fetch for recommended products only if customerId exists and is not null
        if (customerId && !recommendedProductsFetched) {
            memoizedFetchRecommendedProducts();
            setRecommendedProductsFetched(true); // Mark data as fetched
        }
    }, [customerId, recommendedProductsFetched, memoizedFetchRecommendedProducts]);

    // Use another useEffect for new arrivals
    useEffect(() => {
        // Trigger the fetch for new arrivals only if customerId exists and is not null
        if (customerId && !newArrivalsFetched) {
            memoizedFetchNewArrivals();
            setNewArrivalsFetched(true); // Mark data as fetched
        }
    }, [customerId, newArrivalsFetched, memoizedFetchNewArrivals]);


    const servicesData = categoriesData.filter((singleservice) => {
        return singleservice.category_type === "Services";
    });


    return (
        <SafeAreaView
            className=""
            style={{
                flex: 1,
                backgroundColor: "white",
            }}
        >
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <ScrollView >
                <LinearGradient
                    colors={['#ffc363', '#fff', '#fff']}
                >
                    <View className="flex-row items-center mr-4">
                        <View
                            className="px-2 flex-1"
                            style={{
                                // backgroundColor: "#00008b",
                                // padding: 10,
                                // flexDirection: "row",
                                // alignItems: "center",
                            }}
                        >
                            <TouchableOpacity
                                className=" rounded-md mt-4 h-9"
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginHorizontal: 7,
                                    gap: 10,
                                    backgroundColor: "white",
                                    borderRadius: 3,
                                    flex: 1,
                                }}
                                onPress={debounce(() => {
                                    navigation.navigate("Search")
                                }, 500)}
                            >

                                <View  >
                                    <Text className="pl-3" >{t('Search Market-Place ...')}</Text>
                                </View>
                            </TouchableOpacity>
                            <MaterialIcons
                                className=""
                                name={"search"}

                                size={22}
                                style={styles.searchIcon}

                            />

                            {/* <Feather name="mic" size={24} color="black" /> */}
                        </View>
                        <TouchableOpacity className="mt-4" onPress={(() => { navigation.navigate("Notification") })} >
                            <Notificationtab color={"black"} size={20} count={0} />

                        </TouchableOpacity>

                    </View>

                    <View className="mt-4">
                        <ImageCarousel />
                    </View>

                    {browseCategoriesInfo()}
                    {browseServicesInfo()}

                </LinearGradient>
                <View className="mt-4 bg-gray-200">
                    {
                        !customerId && <ProductListing title="Recommended Products" productList={productsList.slice(0, 10)} />
                    }
                    {
                        customerData.length > 0 && <>
                            <ProductListing title="Recommended Products" productList={recommendedProdutcs} />
                            <ProductListing title="New Arrivals" productList={newArrivals} />
                        </>
                    }

                    {cartItems && cartItems.length > 0 && <InCart cartItems={cartItems} navigation={navigation} />}
                </View>
            </ScrollView>
            {!customerId && <NoLogin />}
        </SafeAreaView>
    );

    function browseServicesInfo() {
        return (
            <>{

                categoriesData.length > 0 &&
                <View style={{ marginBottom: Sizes.fixPadding, marginTop: Sizes.fixPadding * 2.0, marginHorizontal: Sizes.fixPadding * 1.0, }}>
                    <View className="flex flex-row justify-between items-center mt-2 mb-4 mx-2">
                        <Text className="text-lg font-bold text-gray-900">
                            {t('Browse Services')}
                        </Text>
                        <TouchableOpacity
                            onPress={debounce(() => navigation.navigate('servicesList'), 500)
                            }
                        >
                            <AntDesign name="arrowright" size={24} color="black" />
                        </TouchableOpacity>

                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className=" ">
                        {
                            servicesData.map((item, index) => {
                                return (
                                    <TouchableOpacity key={index} className=" mx-4 my-4"
                                        activeOpacity={0.9}
                                        onPress={debounce(() => navigation.push('CategoriesItems', { item, subcategory_name: t("All") }), 500)}
                                        style={styles.categoryWrapStyle}
                                    >
                                        <View style={styles.categoryImageWrapStyle} className="border border-gray-200">
                                            <Image
                                                resizeMode="contain"
                                                source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                                                style={{ width: 100.0, height: 100.0, resizeMode: 'contain' }}
                                                className="rounded-full"

                                            />
                                        </View>
                                        <Text numberOfLines={2} style={styles.categoryText} className="text-[12px]">
                                            {t(`${item.category_name}`)}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            }</>
        )
    }

    function browseCategoriesInfo() {
        function chunkArray(arr, size) {
            const chunkedArray = [];
            for (let i = 0; i < arr.length; i += size) {
                chunkedArray.push(arr.slice(i, i + size));
            }
            return chunkedArray;
        }


        return (
            <View style={{ marginBottom: Sizes.fixPadding, marginTop: Sizes.fixPadding * 2.0, marginHorizontal: Sizes.fixPadding * 1.0, }}>
                {
                    categoriesData.length === 0 ? (
                        <CategoryPlaceholder />
                    ) :
                        <>
                            <View className="flex flex-row justify-between items-center mt-2 mb-4 mx-2">
                                <View className="flex-row items-center space-x-2">

                                    <Text className="text-lg font-bold text-gray-900">
                                        {t('Browse Categories')}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={debounce(() => navigation.push('productsList'), 500)}
                                >
                                    <AntDesign name="arrowright" size={24} color="black" />
                                </TouchableOpacity>
                                {/* <Link to="/productsList">
                                    <AntDesign name="arrowright" size={24} color="black" />

                                </Link> */}
                            </View> 
                            <ScrollView horizontal className="grid grid-rows-3 gap-5 h-[350px]" showsHorizontalScrollIndicator={false}>
                                {chunkArray(productssubcategories, 2)?.map((rowItems, rowIndex) => (
                                    <View key={rowIndex} className="grid grid-cols-2 gap-2">
                                        {rowItems?.map((item, itemIndex) => {
                                            const { subcategory_name } = item
                                            return (
                                                <TouchableOpacity key={itemIndex} className="mr-1.5 w-[100px] h-[100px]"
                                                    activeOpacity={0.9}
                                                    onPress={debounce(() => {
                                                        navigation.push('CategoriesItems', { item: productscategories.find((single) => single.category_id === item.parent_category_id), subcategory_name })
                                                    }, 500)}
                                                    style={styles.categoryWrapStyle}
                                                >
                                                    <View style={styles.categoryWrapStyle} className="mb-10">
                                                        <View style={styles.categoryImageWrapStyle} className="border border-gray-200 ">
                                                            <Image
                                                                resizeMode="contain"
                                                                source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${item.subcategory_image_url}` }}
                                                                style={{ width: 100.0, height: 100.0, resizeMode: 'contain' }}
                                                                className="rounded-full"
                                                            />
                                                        </View>
                                                        <Text numberOfLines={2} style={styles.categoryText} className="mt-4">
                                                            {t(`${item.subcategory_name}`)}
                                                        </Text>
                                                    </View >
                                                </TouchableOpacity>
                                            )
                                        })}
                                    </View>
                                ))}
                            </ScrollView>
                        </>
                }
            </View>
        )
    }
};


const styles = StyleSheet.create({
    headerWrapStyle: {
        backgroundColor: Colors.primaryColor,
        // borderBottomLeftRadius: Sizes.fixPadding + 5.0,
        // borderBottomRightRadius: Sizes.fixPadding + 5.0,
    },
    cityAndMapInfoWrapStyle: {
        marginTop: Sizes.fixPadding,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    activeDotStyle: {
        marginHorizontal: Sizes.fixPadding - 7.0,
        width: 12.0,
        height: 12.0,
        borderRadius: 6.0,
        backgroundColor: Colors.primaryColor
    },
    inActiveDotStyle: {
        marginHorizontal: Sizes.fixPadding - 7.0,
        width: 8.0,
        height: 8.0,
        borderRadius: 4.0,
        backgroundColor: Colors.grayColor
    },
    sliderPaginationWrapStyle: {
        position: 'absolute',
        bottom: -60.0,
        left: 0.0,
        right: 0.0,
    },

    categoryImageWrapStyle: {
        width: 110.0,
        height: 110.0,
        borderRadius: 70.0,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
        // elevation: 5,
        // borderWidth: 1,
        // borderColor: '#ececec',
    },
    categoryWrapStyle: {
        maxWidth: width / 4.0 - 10.0,
        marginBottom: Sizes.fixPadding + 10,
        flex: 1,
        alignItems: 'center'
    },
    freshRecommendationWrapStyle: {
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
        bottom: 40.0,
        left: -10.0,
        right: -10.0,
        backgroundColor: '#333333',
        elevation: 0.0,
    },
    searchInputWrapper: {
        position: 'relative', // Use relative positioning for the wrapper
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: Sizes.fixPadding - 10.0,
    },
    searchInput: {
        paddingLeft: 2,
    },
    searchIcon: {
        color: "gray",
        position: 'absolute', // Use absolute positioning for the icon
        top: 22, // Adjust this value to vertically center the icon
        right: 19, // Adjust this value to horizontally center the icon 
        position: 'absolute', // Use absolute positioning for the icon
    },
    categoryText: {
        width: 80,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
        fontWeight:"500",
    },
});

export default HomeScreen;
