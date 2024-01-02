import { View, Text, SafeAreaView, FlatList, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { AdminUrl, HeaderBar } from '../../constant';
import { ProductSkeleton } from '../../components/Skeleton';
import renderItemOrSkeleton from '../../components/ProductList2';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

const Channels = ({ navigation, route }) => {
    const [recommendedProdutcs, setRecommendedProducts] = useState(null)
    const [newArrivals, setNewArrivals] = useState(null)
    //  const [recommendedProductsFetched, setRecommendedProductsFetched] = useState(false);
    //  const [newArrivalsFetched, setNewArrivalsFetched] = useState(false);
    const [error, setError] = useState(null);
    const { t } = useTranslation()
    const { customerData } = useSelector((store) => store.userData)
    const customerId = customerData[0]?.customer_id
    const [page, setPage] = useState(1);
    const [pageloading, setPageloading] = useState(true);
    const [VendorProductList, setVendorProductList] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    const fetchRecommendedProducts = useCallback(async () => {
        setPageloading(true);
        try {
            // const response = await fetch(`${AdminUrl}/api/recommendedProducts/${'null'}`);
            const recommendedResponse = await fetch(`${AdminUrl}/api/recommendedProducts/${customerId || 'null'}`);

            if (recommendedResponse.ok) {
                const data = await recommendedResponse.json();
                console.log(data, "data reccome");

                console.log(data, "search result data");
                if (data?.length > 0) {
                    setVendorProductList(prevProducts => {
                        if (prevProducts) {
                            return [...prevProducts, ...data];
                        } else {
                            return [...data];
                        }
                    });
                    setHasMore(true); // If data is fetched and not an empty array, set hasMore to true
                } else {
                    !VendorProductList && setVendorProductList([])
                    setHasMore(false); // If response is an empty array, set hasMore to false
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPageloading(false);
        }
    }, [customerId, setVendorProductList]);

    const fetchNewArrivals = useCallback(async () => {
        setPageloading(true);
        try {
            const response = await fetch(`${AdminUrl}/api/newArrivals/${customerId}`);
            // const response = await fetch(`${AdminUrl}/api/newArrivals/${'null'}`);

            // const response = await fetch(`${AdminUrl}/api/recommendedProducts/${customerId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data, "data reccome");

                console.log(data, "search result data");
                if (data?.length > 0) {
                    setVendorProductList(prevProducts => {
                        if (prevProducts) {
                            return [...prevProducts, ...data];
                        } else {
                            return [...data];
                        }
                    });
                    setHasMore(true); // If data is fetched and not an empty array, set hasMore to true
                } else {
                    !VendorProductList && setVendorProductList([])
                    setHasMore(false); // If response is an empty array, set hasMore to false
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPageloading(false);
        }

        // try {
        //     if (!newArrivalsResponse.ok) {
        //         throw new Error(`HTTP error! Status: ${newArrivalsResponse.status}`);
        //     }
        //     const newArrivalsData = await newArrivalsResponse.json();
        //     console.log(newArrivalsData, "newarrivalsdata");
        //     setVendorProductList(newArrivalsData);
        // } catch (error) {
        //     setError(error.message || 'An error occurred while fetching new arrivals.');
        // }
    }, [customerId, setVendorProductList, setError]);

    useEffect(() => {
        if (!newArrivals && route.params.arrivals) {
            console.log("ARRIVALS DATA COMING");
            fetchNewArrivals()
        }
        if (!recommendedProdutcs && route.params.recommended) {
            console.log("RECOMMENDED DATA COMING");
            fetchRecommendedProducts()
        }
    }, [newArrivals, recommendedProdutcs])

    const loadMoreProducts = () => {
        setPageloading(true);
        if (hasMore) { // Check if there is more data to fetch
            console.log("LOADING MORE PRODUCTS=============================================================================");
            setPage(prevPage => prevPage + 1);
        }
        else {
            console.log("##################### NO MORE PRODUCTS TO BE FETCHED ####################################################");
        }
    };

    console.log('VendorProductList');
    console.log(VendorProductList, hasMore);
    console.log('VendorProductList');

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            {/* {header()} */}
            {
                VendorProductList ?
                    <>
                        {
                            route.params.recommended ?
                                <HeaderBar title={'Recommended Products'} goback={true} navigation={navigation} />
                                :
                                <HeaderBar title={'New Arrivals'} goback={true} navigation={navigation} />
                        }
                        <FlatList
                            data={VendorProductList}
                            keyExtractor={(item) => `${item.uniquepid}`}
                            renderItem={renderItemOrSkeleton}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            onEndReached={VendorProductList?.length > 9 && loadMoreProducts}
                            // onEndReached={VendorProductList?.length > 9 }
                            onEndReachedThreshold={0.1}
                            ListFooterComponent={() => (
                                <View className="">
                                    {
                                        (pageloading && hasMore) &&
                                        <View className="my-8">
                                            <ActivityIndicator size="large" color={"#00008b"} />
                                        </View>
                                    }
                                    {
                                        (!hasMore && VendorProductList.length !== 0) &&
                                        <View className="flex-row items-center justify-center">
                                            <Text className="text-xl my-10 text-gray-300 font-bold">No More Products!</Text>
                                        </View>
                                    }
                                    {
                                        VendorProductList?.length === 0 &&
                                        <View className="">
                                            <Image resizeMode="contain" className="h-[150px] w-[150px] mx-auto" source={require('../../assets/images/empty-folder.png')} />
                                            <Text className="text-center text-xl ">{t("No Product Found !")}</Text>
                                        </View>
                                    }
                                </View>
                            )}
                        />
                    </> :
                    <View className="my-12">


                        <FlatList
                            data={[1, 2, 3, 4, 5, 6, 7, 8]}
                            renderItem={() => (


                                <View style={{ width: '50%' }}>
                                    <ProductSkeleton />
                                </View>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={2} // Adjust as needed
                            showsVerticalScrollIndicator={false}


                        />
                    </View>
            }
        </SafeAreaView>
    )
}

export default Channels