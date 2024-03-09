import React, { createRef, useEffect, useState } from "react";
import { SafeAreaView, View, StatusBar, Dimensions, FlatList, ScrollView, StyleSheet, Image, Text, TextInput, TouchableOpacity } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { AdminUrl } from "../../constant";
import { useSelector } from "react-redux";
import renderItemOrSkeleton from "../../components/ProductList2";
import { ActivityIndicator } from "react-native";
import { ProductSkeleton } from "../../components/Skeleton";

const SearchResultsScreen = ({ navigation, route }) => {
    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const { t } = useTranslation()
    const selectedKeyword = route.params

    const [page, setPage] = useState(1);
    const [pageloading, setPageloading] = useState(true);
    const [VendorProductList, setVendorProductList] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0)

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

    const fetchData = async () => {
        setPageloading(true);
        try {
            const response = await fetch(
                `${AdminUrl}/api/getSearchedProducts?searchTerm=${selectedKeyword}&pageNumber=${page}&pageSize=10&currency=${currencyCode}`
            );
            if (response.ok) {
                const data = await response.json();

                console.log(data, "search result data");
                if (data?.products.length > 0) {
                    setVendorProductList(prevProducts => {
                        if (prevProducts) {
                            return [...prevProducts, ...data?.products];
                        } else {
                            return [...data?.products];
                        }
                    });
                    setTotalProducts(data?.totalCount)
                    setHasMore(true); // If data is fetched and not an empty array, set hasMore to true
                } else {
                    !VendorProductList && setVendorProductList([])
                    setHasMore(false); // If response is an empty array, set hasMore to false
                }
            }
        } catch (error) {
            console.error("An error occurred:", error);
        } finally {
            setPageloading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Initial data fetch
    }, [selectedKeyword, page]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            {header()}
            {
                VendorProductList ?
                    <>
                        <Text className="text-xl text-gray-600 font-medium mx-4 my-2">{`${totalProducts} ${t("Products Found")} `}</Text>
                        <FlatList
                            data={VendorProductList}
                            keyExtractor={(item) => `${item.uniquepid}`}
                            renderItem={renderItemOrSkeleton}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            onEndReached={VendorProductList?.length > 9 && loadMoreProducts}
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
                    <View className="my-6">

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

    function header() {
        return (
            <View style={styles.headerWrapStyle}>
                <MaterialIcons
                    name="arrow-back-ios"
                    color={Colors.whiteColor}
                    size={22}
                    onPress={debounce(() => navigation.goBack(), 500)}
                    style={{ marginRight: Sizes.fixPadding, }}
                />
                <TouchableOpacity activeOpacity={0.9} style={styles.searchFieldWrapStyle} onPress={debounce(() => navigation.goBack(), 500)}>
                    <View>
                        <Text numberOfLines={1}>{selectedKeyword}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "#fb7701",
    },
    searchFieldWrapStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: Sizes.fixPadding - 5.0,
        padding: Sizes.fixPadding,
    },

    container: {
        backgroundColor: 'white',
        marginBottom: 50,
    },

    image: {
        width: '100%',
        height: 200,
    },

});

export default SearchResultsScreen;