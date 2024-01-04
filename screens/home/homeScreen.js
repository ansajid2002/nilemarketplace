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
import { LinearGradient } from 'expo-linear-gradient';
import Notificationtab from "../../components/Notificationtab";
import InCart from "../../components/inCart";
import { AntDesign } from '@expo/vector-icons';
import { CategoryPlaceholder, ServicesPlaceholder } from "../../components/Skeleton";
import NoLogin from "../../components/NoLogin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCartTotal } from "../../store/slices/cartSlice";
import { updateCustomerData } from "../../store/slices/customerData";
import { updateproductsListwishlist } from "../../store/slices/wishlistSlice";


const { width } = Dimensions.get('window');
const HomeScreen = () => {
    const dispatch = useDispatch()
    const [recommendedProdutcs, setRecommendedProducts] = useState(null)
    const [newArrivals, setNewArrivals] = useState(null)
    const [servicesData, setServicesData] = useState(null)
    const [productCatData, setProductCatData] = useState(null)

    const navigation = useNavigation();
    const { t } = useTranslation()
    const cartItems = useSelector((state) => state.cart.cartItems);
    const { productsList } = useSelector((store) => store.products)

    const { customerData } = useSelector((store) => store.userData)
    const customerId = customerData[0]?.customer_id
    const [wishlistItems, setWishlistItems] = useState(false)

    useEffect(() => {
        // Check if loggedid and customerData are available in AsyncStorage
        async function checkAuthentication() {
            // const loggedid = await AsyncStorage.getItem('loggedid');
            const storedCustomerData = await AsyncStorage.getItem('customerData');

            // If both loggedid and customerData are available, set isAuthenticated to true
            if (storedCustomerData) {
                dispatch(updateCustomerData(JSON.parse(storedCustomerData)))
            }
        }

        checkAuthentication();
    }, []);



    //     const scrollViewRef = useRef(null);

    //   useFocusEffect(
    //     React.useCallback(() => {
    //       if (scrollViewRef.current) {
    //         scrollViewRef.current.scrollTo({ y: 0, animated: true });
    //       }
    //     }, [])
    //   );

    const getservicesData = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getServicesData`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setServicesData(data);

            // Save the new data and timestamp to AsyncStorage
            const currentTimestamp = new Date().getTime();
            await AsyncStorage.setItem('servicesData', JSON.stringify(data));
            await AsyncStorage.setItem('servicesDataTimestamp', currentTimestamp.toString());
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const getCatgeory = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getCatgeory`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setProductCatData(data);

            // Save the new data and timestamp to AsyncStorage
            const currentTimestamp = new Date().getTime();
            await AsyncStorage.setItem('productCatData', JSON.stringify(data));
            await AsyncStorage.setItem('productCatDataTimestamp', currentTimestamp.toString());

            // After getting category data, call the services API
            getservicesData();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if there is stored category data and if it is still valid
                const storedCategoryData = await AsyncStorage.getItem('productCatData');
                const storedCategoryTimestamp = await AsyncStorage.getItem('productCatDataTimestamp');
                const currentTimestamp = new Date().getTime();

                if (storedCategoryData && storedCategoryTimestamp && currentTimestamp - parseInt(storedCategoryTimestamp) <= 30 * 60 * 1000) {
                    // Use stored category data if it's still valid
                    setProductCatData(JSON.parse(storedCategoryData));

                    // After getting category data, call the services API
                    getservicesData();
                } else {

                    // Fetch new category data if there is no stored data or if it's expired
                    await getCatgeory();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (!productCatData) {
            fetchData();
        }
    }, [productCatData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if there is stored services data and if it is still valid
                const storedServicesData = await AsyncStorage.getItem('servicesData');
                const storedServicesTimestamp = await AsyncStorage.getItem('servicesDataTimestamp');
                const currentTimestamp = new Date().getTime();

                if (storedServicesData && storedServicesTimestamp && currentTimestamp - parseInt(storedServicesTimestamp) <= 30 * 60 * 1000) {
                    // Use stored services data if it's still valid
                    setServicesData(JSON.parse(storedServicesData));
                } else {
                    // Fetch new services data if there is no stored data or if it's expired

                    await getservicesData();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (!servicesData && productCatData?.length > 0) {
            fetchData();
        }
    }, [servicesData, productCatData]);

    const fetchRecommendedProducts = async () => {
        try {
            const recommendedResponse = await fetch(`${AdminUrl}/api/recommendedProducts/${customerId || 'null'}`);
            // const recommendedResponse = await fetch(`${AdminUrl}/api/recommendedProducts/${'null'}`);
            if (!recommendedResponse.ok) {
                throw new Error(`HTTP error! Status: ${recommendedResponse.status}`);
            }
            const recommendedData = await recommendedResponse.json();
            setRecommendedProducts(recommendedData);

        } catch (error) {
            console.log(error);
        }
    }

    const fetchNewArrivals = async () => {
        try {
            const newArrivalsResponse = await fetch(`${AdminUrl}/api/newArrivals/${customerId || 'null'}`);
            // const newArrivalsResponse = await fetch(`${AdminUrl}/api/newArrivals/${'null'}`);
            if (!newArrivalsResponse.ok) {
                throw new Error(`HTTP error! Status: ${newArrivalsResponse.status}`);
            }
            const newArrivalsData = await newArrivalsResponse.json();
            setNewArrivals(newArrivalsData);

        } catch (error) {
            console.log(error, "Error fetching new arrivals data");
        }
    }

    useEffect(() => {
        if (!recommendedProdutcs && servicesData?.length > 0) {
            fetchRecommendedProducts()
        }
    }, [recommendedProdutcs, servicesData])

    useEffect(() => {
        if (!newArrivals && recommendedProdutcs) {
            fetchNewArrivals()
        }
    }, [newArrivals, recommendedProdutcs])

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
            setWishlistItems(true)
            dispatch(updateproductsListwishlist(data))

        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (!wishlistItems) {
            getCustomerWishlist()
        }
    }, [customerId, wishlistItems])

    return (
        <SafeAreaView
            className=""
            style={{
                flex: 1,
                backgroundColor: "white",
            }}
        >
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            {/* <ScrollView showsVerticalScrollIndicator={false}  ref={scrollViewRef} > */}
            <ScrollView showsVerticalScrollIndicator={false} >
                <LinearGradient
                    colors={['#ffc363', '#fff', '#fff']}
                >
                    <View className="flex-row items-center mr-4">
                        <View
                            className="px-2 flex-1"
                            style={{
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
                <View className="mt-4 ">
                    {/* {
                        !customerId && <ProductListing title="Recommended Products" productList={productsList.slice(0, 10)} />
                    } */}
                    <View>
                        <View className="m-3 flex-row justify-between items-center">
                            <Text className="font-bold text-lg">Recommended Products</Text>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate("Channel", { channelName: "Recommended Products" })
                            }}>
                                <MaterialIcons name="arrow-forward" size={30} />
                            </TouchableOpacity>
                        </View>
                        <ProductListing title="" productList={recommendedProdutcs} />
                    </View>
                    <View>
                        <View className="m-3 flex-row justify-between items-center">
                            <Text className="font-bold text-lg">New Arrivals</Text>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate("Channel", { channelName:"New Arrivals"})
                            }}>
                                <MaterialIcons name="arrow-forward" size={30} />
                            </TouchableOpacity>
                        </View>
                        <ProductListing title="" productList={newArrivals} />
                    </View>

                    {cartItems && cartItems.length > 0 && <InCart cartItems={cartItems} navigation={navigation} />}
                </View>
            </ScrollView>
            {!customerId && <NoLogin />}
        </SafeAreaView>
    );

    function browseServicesInfo() {
        return (
            <View style={{ marginBottom: Sizes.fixPadding, marginTop: Sizes.fixPadding * 2.0, marginHorizontal: Sizes.fixPadding * 1.0, }}>
                {
                    !servicesData ? <ServicesPlaceholder /> :
                        <>
                            <View className="flex flex-row justify-between items-center mt-2 mb-4 mx-2">
                                <Text className="text-lg font-bold text-gray-900">
                                    {t('Browse Services')}
                                </Text>
                                <TouchableOpacity
                                    onPress={debounce(() => navigation.navigate('servicesList'), 500)
                                        // onPress={debounce(() => navigation.navigate('bottomtabbar'), 500)
                                    }
                                >
                                    <AntDesign name="arrowright" size={24} color="black" />
                                </TouchableOpacity>

                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className=" ">
                                {
                                    servicesData?.map((item, index) => {
                                        return (
                                            <TouchableOpacity key={index} className=" mx-4 my-4"
                                                activeOpacity={0.9}

                                                style={styles.categoryWrapStyle}
                                            >
                                                <TouchableOpacity onPress={debounce(() => navigation.push('CategoryProductList', { categoryId: item.category_id, categoryName: item.category_name, subcategory_name: t("All") }), 500)} style={styles.categoryImageWrapStyle} className="border border-gray-200">
                                                    <Image
                                                        resizeMode="contain"
                                                        source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                                                        style={{ width: 100.0, height: 100.0, resizeMode: 'contain' }}
                                                        className="rounded-full"

                                                    />
                                                </TouchableOpacity>
                                                <Text numberOfLines={2} style={styles.categoryText} className="text-[12px]">
                                                    {t(`${item.category_name}`)}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })
                                }
                            </ScrollView>
                        </>

                }</View>
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
                    !productCatData ? (
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
                                {productCatData && chunkArray(productCatData, 2)?.map((rowItems, rowIndex) => (
                                    <View key={rowIndex} className="grid grid-cols-2 gap-2">
                                        {rowItems?.map((item, itemIndex) => {
                                            const { category_name } = item
                                            return (
                                                <TouchableOpacity key={itemIndex} className="mr-1.5 w-[100px] h-[100px]"
                                                    activeOpacity={0.9}

                                                    style={styles.categoryWrapStyle}
                                                >
                                                    <View style={styles.categoryWrapStyle} className="mb-10">
                                                        <TouchableOpacity
                                                            onPress={debounce(() => {
                                                                navigation.push('CategoryProductList', { categoryId: item.category_id, categoryName: item.category_name, subcategory_name: t("All") })
                                                            }, 500)}
                                                            style={styles.categoryImageWrapStyle} className="border border-gray-200 ">
                                                            <Image
                                                                resizeMode="contain"
                                                                source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                                                                style={{ width: 100.0, height: 100.0, resizeMode: 'contain' }}
                                                                className="rounded-full"
                                                            />
                                                        </TouchableOpacity>
                                                        <Text numberOfLines={2} style={styles.categoryText} className="mt-4">
                                                            {t(`${category_name}`)}
                                                        </Text>
                                                    </View>
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

    categoryImageWrapStyle: {
        width: 110.0,
        height: 110.0,
        borderRadius: 70.0,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',

    },
    categoryWrapStyle: {
        maxWidth: width / 4.0 - 10.0,
        marginBottom: Sizes.fixPadding + 10,
        flex: 1,
        alignItems: 'center'
    },
    searchIcon: {
        color: "gray",
        position: 'absolute', // Use absolute positioning for the icon
        top: 22, // Adjust this value to vertically center the icon
        right: 19, // Adjust this value to horizontally center the icon 
        position: 'absolute', // Use absolute positioning for the icon
    },
    categoryText: {
        width: 90,
        fontSize: 10,
        textAlign: 'center',
        marginTop: 5,
        fontWeight: "500",
    },
});

export default HomeScreen;
