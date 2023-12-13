import React, { createRef, useEffect, useState } from "react";
import { SafeAreaView, View, StatusBar, Dimensions, FlatList, ScrollView, StyleSheet, Image, Text, TextInput, TouchableOpacity } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { TextInput as Input } from 'react-native-paper';
import { Menu } from 'react-native-material-menu';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { AdminUrl } from "../../constant";
import { useSelector } from "react-redux";
// import { t } from "i18next";
import { ActivityIndicator } from "react-native";
import { Button } from "react-native";
// import s from "../../assets/images"


const { width } = Dimensions.get('window');

const searchResultsList = [  
];

const sortByOptions = ['Date Published', 'Price:low to high', 'Price:high to low'];

const conditionsList = ['New', 'Used', 'Recondition'];

const subCategoriesList = [
    'Mobile Phones',
    'Accessories',
    'Tablets'
];
const windowWidth = Dimensions.get('window').width;
const SearchResultsScreen = ({ navigation, route }) => {
    const { c_symbol } = useSelector((store) => store.selectedCurrency)
    const { currencyCode } = useSelector((store) => store.selectedCurrency)

    const selectedKeyword = route.params
    const [getSearchedProducts, setgetSearchedProducts] = useState([])
    const [totalProducts, settotalProducts] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [keyword, setkeyord] = useState(selectedKeyword);


    const fetchData = async () => {
        setIsLoading(true);
        setkeyord(selectedKeyword)
        try {
            const response = await fetch(
                `${AdminUrl}/api/getSearchedProducts?searchTerm=${selectedKeyword}&page=${page}&limit=${limit}&currency=${currencyCode}`
            );

            if (response.ok) {
                const newItems = await response.json();

                const newProducts = newItems.products; // Extract products from newItems
                const total = newItems.totalProducts; // Extract totalProducts count

                if (newProducts.length > 0) {
                    // Append new products to the existing data
                    setgetSearchedProducts([...getSearchedProducts, ...newProducts]);
                    setPage(page + 1); // Increment the page for the next load
                    settotalProducts(total); // Update the totalProducts count
                }
            }
        } catch (error) {
            console.error("An error occurred:", error);
            // Handle error here
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setPage(1)
        keyword != selectedKeyword && setgetSearchedProducts([])
        fetchData(); // Initial data fetch
    }, [selectedKeyword]);




    const { t } = useTranslation()

    const [state, setState] = useState({
        search: selectedKeyword,
        searchResults: searchResultsList,
        snackBarMsg: null,
        showSnackBar: false,
        showFilterSheet: false,
        selectedSortOption: sortByOptions[0],
        selectedCondition: conditionsList[0],
        minPrice: null,
        maxPrice: null,
        selectedCategoryIndex: 0,
        selectedSubCategory: subCategoriesList[0],
        showSubCategoriesOptions: false,
    })

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    const {
        searchResults,
        snackBarMsg,
        showSnackBar,
        showFilterSheet,
        selectedSortOption,
        selectedCondition,
        minPrice,
        maxPrice,
        selectedCategoryIndex,
        selectedSubCategory,
        showSubCategoriesOptions,
    } = state;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
                {header()}
            <View className="mb-20" style={{ flex: 1 }}>
                {searchResultsCountAndFilterIcon()}
                {searchResultsInfo()}
            </View>
            <Snackbar
                style={styles.snackBarStyle}
                visible={showSnackBar}
                onDismiss={() => updateState({ showSnackBar: false })}
            >
                <Text style={{ ...Fonts.whiteColor12Medium }}>
                    {snackBarMsg}
                </Text>
            </Snackbar>
        </SafeAreaView>
    )


    function searchResultsInfo() {
        const renderItem2 = ({ item }) => {
            const discountPercentageSimple = ((item.mrp - item.sellingprice) / item.mrp) * 100;
            return (
                <TouchableOpacity
                    onPress={debounce(() => navigation.push('ProductDetail', item), 500)}
                    style={styles.productContainer}
                    className='relative  shadow-sm   border mr-2'
                >
                    <View className="  border-gray-200 p-2 "
                        style={styles.image}>

                        <Image
                            resizeMode="contain"
                            source={
                                item.images.length === 0
                                    ? require('../../assets/noimage.jpg')
                                    : { uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${item.images[0]}` }
                            }

                            defaultSource={require('../../assets/noimage.jpg')}
                            className=" h-full w-full  "
                        />


                        {/* <Image
                            resizeMode="contain"
                            source={
                                item.images.length === 0
                                    ? require('../../assets/noimage.jpg')
                                    : { uri: `${AdminUrl}/uploads/UploadedProductsFromVendors/${item.images[0]}` }
                            }

                            defaultSource={require('../../assets/noimage.jpg')}

                            style={{ width: '100%', height: undefined, aspectRatio: 4 / 4 }} className="rounded-md"
                        /> */}


                    </View>
                    <View className="absolute -top-[1px] -right-[1px]">
                        {
                            discountPercentageSimple &&
                            <Text className={'bg-white text-[#fb7701] text-[12px] font-bold rounded-sm  border px-1 py-0.5 border-[#fb760167]'}>
                                {discountPercentageSimple?.toFixed(2)}%
                            </Text>
                        }
                    </View>
                    <View className="  ml-2 pt-2 pb-4"  >

                        <Text numberOfLines={1} className="text-base font-medium ">
                            {item?.ad_title}
                        </Text>
                        {
                            // item.label && <Text className="text-[14px] text-gray-500 ">{item.label.split("/").join(" / ")}</Text>
                        }

                        {/* {
                        <View className="flex-row items-center">
                            <StarRating enable={false} reviewButton={false} size="[16px]" rating={averageRating || 0} onRatingChange={() => { }} item={item} />
                        </View>
                    } */}
                        <View className="flex-row  items-center ">
                            <Text className={'text-[#fb7701] text-[16px] font-bold mr-1'}>
                                {`${c_symbol} ${item.sellingprice % 1 === 0 ? Math.trunc(item.sellingprice) : item.sellingprice}`}
                            </Text>
                            <Text className="ml-0.5" style={{ textDecorationLine: 'line-through', fontSize: 12, fontWeight: 'medium', color: 'gray' }}>
                                {`${c_symbol} ${item.mrp % 1 === 0 ? Math.trunc(item.mrp) : item.mrp}`}
                            </Text>

                        </View>


                    </View>
                </TouchableOpacity>
            )
        }

        const renderFooter = () => {
            return isLoading && (
                <ActivityIndicator size="large" color="gray" />
            )
        };

        return (
            <View className="mx-2  ">
                <FlatList
                    data={getSearchedProducts}
                    keyExtractor={(item) => `${item.uniquepid}`}
                    renderItem={renderItem2}
                    showsVerticalScrollIndicator={false}
                    numColumns={2}
                    ListFooterComponent={renderFooter}
                    onEndReachedThreshold={0.3} // Adjust as needed
                    onEndReached={() => {
                        if (getSearchedProducts.length < totalProducts) {
                            fetchData();
                        }
                    }}
                />
            </View>

        );
    }

    function searchResultsCountAndFilterIcon() {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                margin: Sizes.fixPadding * 2.0,
            }}>
                <Text style={{ ...Fonts.grayColor12SemiBold }}>
                    {totalProducts} {t('Search Results...')}
                </Text>
            </View>
        )
    }

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
        // borderBottomLeftRadius: Sizes.fixPadding + 5.0,
        // borderBottomRightRadius: Sizes.fixPadding + 5.0,
    },
    searchFieldWrapStyle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.whiteColor,
        borderRadius: Sizes.fixPadding - 5.0,
        padding: Sizes.fixPadding,
    },
    snackBarStyle: {
        position: 'absolute',
        bottom: -10.0,
        left: -10.0,
        right: -10.0,
        backgroundColor: '#333333',
        elevation: 0.0,
    },
    productImageStyle: {
        width: 100.0,
        height: '100%',
        borderTopLeftRadius: Sizes.fixPadding - 5.0,
        borderBottomLeftRadius: Sizes.fixPadding - 5.0,
    },
    searchResultsWrapStyle: {
        backgroundColor: Colors.whiteColor,
        elevation: 3.0,
        borderRadius: Sizes.fixPadding - 5.0,
        marginBottom: Sizes.fixPadding,
    },
    filterIconWrapStyle: {
        width: 30.0,
        height: 30.0,
        borderRadius: Sizes.fixPadding - 5.0,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3.0,
        backgroundColor: Colors.whiteColor,
    },
 
    sortByOptionWrapStyle: {
        borderWidth: 1.0,
        flex: 1,
        borderRadius: Sizes.fixPadding - 5.0,
        padding: Sizes.fixPadding,
        marginHorizontal: Sizes.fixPadding - 5.0,
        marginBottom: Sizes.fixPadding,
    },
    conditionOptionWrapStyle: {
        borderWidth: 1.0,
        minWidth: 90.0,
        borderRadius: Sizes.fixPadding - 5.0,
        padding: Sizes.fixPadding,
        marginHorizontal: Sizes.fixPadding - 5.0,
        marginBottom: Sizes.fixPadding,
        alignItems: 'center',
        justifyContent: 'center'
    },
    minAndMaxPriceTextFieldStyle: {
        height: 35.0,
        borderRadius: Sizes.fixPadding - 5.0,
        backgroundColor: Colors.whiteColor,
        borderColor: Colors.grayColor,
        borderWidth: 1.0,
        ...Fonts.blackColor12Medium,
        flex: 1,
    },
    subCategoryWrapStyle: {
        marginTop: Sizes.fixPadding - 5.0,
        borderColor: Colors.primaryColor,
        borderWidth: 1.0,
        paddingVertical: Sizes.fixPadding,
        paddingHorizontal: Sizes.fixPadding - 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    applyFilterButtonStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        paddingVertical: Sizes.fixPadding + 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        elevation: 5.0,
        shadowColor: Colors.primaryColor,
        margin: Sizes.fixPadding * 2.0,
        borderColor: 'rgba(75, 44, 32, 0.5)',
        borderWidth: 1.0,
    },
    sliderThumbStyle: {
        backgroundColor: Colors.primaryColor,
        width: 14.0,
        height: 14.0,
        borderRadius: 7.0,
        borderColor: Colors.whiteColor,
        borderWidth: 1.0,
        elevation: 2.0,
    },
    container: {
        backgroundColor: 'white',
        marginBottom: 50,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productItem: {
        margin: 2, // Add the desired margin value here
    },

    productContainer: {
        width: windowWidth / 2 - 14, // Adjust spacing as needed
        marginBottom: 3, // Adjust spacing as needed
        backgroundColor: 'white',
        borderColor: 'lightgray',
        borderRadius: 5,
    },
    image: {
        width: '100%',
        height: 200,
    },
    productTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    productPrice: {
        color: 'gray',
        fontSize: 14,
    },

});

export default SearchResultsScreen;