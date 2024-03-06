import { View, Text, SafeAreaView, FlatList, Image } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { AdminUrl, HeaderBar } from '../../constant';
import { ProductSkeleton } from '../../components/Skeleton';
import renderItemOrSkeleton from '../../components/ProductList2';
import { ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RefreshControl } from 'react-native';

const Channels = ({ navigation, route }) => {
    const { t } = useTranslation()
    const { customerData } = useSelector((store) => store.userData)
    const customerId = customerData[0]?.customer_id
    const [page, setPage] = useState(1);
    const [pageloading, setPageloading] = useState(true);
    const [VendorProductList, setVendorProductList] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRecommendedProducts = async () => {
        setPageloading(true);
        try {
            // const response = await fetch(`${AdminUrl}/api/recommendedProducts/${'null'}`);
            const recommendedResponse = await fetch(`${AdminUrl}/api/recommendedProducts/${customerId || 'null'}?pageNumber=${page}&pageSize=10`);

            if (recommendedResponse.ok) {
                const data = await recommendedResponse.json();
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
    };

    const fetchNewArrivals = async () => {
        setPageloading(true);
        try {
            const response = await fetch(`${AdminUrl}/api/newArrivals/${customerId || 'null'}?pageNumber=${page}&pageSize=10`);
            // const response = await fetch(`${AdminUrl}/api/newArrivals/${'null'}`);

            // const response = await fetch(`${AdminUrl}/api/recommendedProducts/${customerId}`);
            if (response.ok) {
                const data = await response.json();
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
                    console.log("No product found");
                    !VendorProductList && setVendorProductList([])
                    setHasMore(false); // If response is an empty array, set hasMore to false
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPageloading(false);
        }


    };

    const fetchExplore = async () => {
        setPageloading(true);
        try {
            const response = await fetch(`${AdminUrl}/api/getexploreproducts?pageNumber=${page}&pageSize=10`);
            if (response.ok) {
                const data = await response.json();
                if (data.AllProducts?.length > 0) {
                    setVendorProductList(prevProducts => {
                        if (prevProducts) {
                            return [...prevProducts, ...data.AllProducts];
                        } else {
                            return [...data.AllProducts];
                        }
                    });
                    setHasMore(true); // If data is fetched and not an empty array, set hasMore to true
                } else {
                    console.log("No product found");
                    !VendorProductList && setVendorProductList([])
                    setHasMore(false); // If response is an empty array, set hasMore to false
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPageloading(false);

        }
    };

    useEffect(() => {
        if (route.params.channelName === "New Arrivals") {
            !VendorProductList && fetchNewArrivals()
        }
        if (route.params.channelName === "Recommended Products") {
            !VendorProductList && fetchRecommendedProducts()
        }
        if (route.params.channelName === "Explore More") {
            !VendorProductList && fetchExplore()
        }

    }, [VendorProductList])

    const loadMoreProducts = () => {
        setPageloading(true);
        if (hasMore) { // Check if there is more data to fetch
            if (route.params.channelName === "New Arrivals") {
                fetchNewArrivals(page)
            }
            if (route.params.channelName === "Recommended Products") {
                fetchRecommendedProducts(page)
            }
            if (route.params.channelName === "Explore More") {
                fetchExplore(page)
            }
            console.log("LOADING MORE PRODUCTS=============================================================================");
            setPage(prevPage => prevPage + 1);
        }
        else {
            console.log("##################### NO MORE PRODUCTS TO BE FETCHED ####################################################");
        }
    };

    const onRefresh = () => {
        // Perform the refresh action here, e.g., fetch updated wallet amount
        // For demonstration purposes, let's simulate a delay before updating the balance
        setRefreshing(true);

        setVendorProductList(null)
        // setAvailableBalance(availableBalance + 1000); // Replace this with your logic to fetch the updated balance
        setRefreshing(false);

    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            {/* {header()} */}
            {
                VendorProductList ?
                    <>

                        <HeaderBar title={`${route.params.channelName}`} goback={true} navigation={navigation} />
                        <FlatList
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
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
                                            <Text className="text-xl my-10 text-gray-300 font-bold">{t("No More Products!")}</Text>
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