import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Dimensions, StatusBar, ImageBackground, FlatList, ScrollView, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Menu } from 'react-native-material-menu';


import { useDispatch, useSelector } from "react-redux";
import { Image } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useTranslation } from "react-i18next";
import { addItemToWishlist, removeItemFromWishlist } from "../../store/slices/wishlistSlice";
import { toggleFavouriteProductslice } from "../../store/slices/productSlice";
import { debounce } from "lodash";
import { AdminUrl, HeaderBar } from "../../constant";
import ProductListing from "../../components/ProductList";
import { productUrl } from '../../constant'

const { width } = Dimensions.get('window');

const ServiceDetailScreen = ({ navigation, route }) => {
    const { t } = useTranslation()
    const singleData = route.params;

    const categoriesList = singleData.subcategories.map((singlesuncategory) => {
        return singlesuncategory.subcategory_name
    })



    //////////////////////REDUX//////////////////////////////////////
    const dispatch = useDispatch()
    const { productsList } = useSelector((store) => store.products)
    const { c_symbol } = useSelector((store) => store.selectedCurrency)

    const { locationcity } = useSelector((state) => state.locations)

    //   const [selectedsubcategory, setSelectedsubcategory] = useState(singleData.subcategories[0].subcategory_name)
    const [selectedsubcategory, setSelectedsubcategory] = useState("All");

    const categoryProducts = productsList.filter((product) => {
        return (
            product.category === singleData.category_name
        );
    });

    const filterProductsBySubcategory = () => {
        if (selectedsubcategory === t("All")) {
            return categoryProducts; // Return all products
        } else {
            return categoryProducts.filter((singleproduct) => {
                return singleproduct.subcategory === selectedsubcategory;
            });
        }
    }

    const [state, setState] = useState({
        selectedCategory: selectedsubcategory,
        showCategoriesOptions: false,
        showLocationsOptions: false,
        showBrandOptions: false,
        availableProducts: filterProductsBySubcategory(),
        showSnackBar: false,
        snackBarMsg: null,
    })

    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    const {
        selectedCategory,
        showCategoriesOptions,
        selectedLocation,
        showLocationsOptions,
        // selectedBrand,
        showBrandOptions,
        availableProducts,
        showSnackBar,
        snackBarMsg,
    } = state;


    const [fromValue, setFromValue] = useState(0);
    const [toValue, setToValue] = useState(5000);

    useEffect(() => {
        const filteredProducts = filterProductsBySubcategory();
        updateState({ availableProducts: filteredProducts, selectedCategory: selectedsubcategory });
    }, [selectedsubcategory]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                {categoryLocationAndBrandInfo()}
                {singleData.category_type === "products" && budgetRangeInfo()}
                { }
                {divider()}
                <ProductListing title={''} productList={availableProducts} />
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

    function updateAvailableProducts({ id }) {
        const newList = availableProducts.map((item) => {
            if (item.uniquepid === id) {
                const updatedItem = { ...item, inFavorite: !item.inFavorite };

                if (updatedItem.inFavorite) {
                    dispatch(addItemToWishlist({ ...updatedItem, inFavorite: true }))
                }
                else {
                    dispatch(removeItemFromWishlist({ ...updatedItem, inFavorite: false }))
                }

                updateState({
                    snackBarMsg: !updatedItem.inFavorite ? `${updatedItem.ad_title} ${t('Remove From Favorite')}` : `${updatedItem.ad_title} ${t('Added To Favorite')}`
                })
                return updatedItem;
            }
            return item;
        });
        updateState({ availableProducts: newList })
    }

    function budgetRangeInfo() {
        const CustomSliderMarker = ({ currentValue }) => (
            <View style={{ alignItems: 'center' }}>
                <View style={styles.sliderThumbStyle} />
                <Text style={{ position: 'absolute', top: 20.0, ...Fonts.grayColor12Bold }}>
                    {`$`}{currentValue}
                </Text>
            </View>
        )
        return (
            <View style={{ marginTop: Sizes.fixPadding, marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ ...Fonts.blackColor14Medium }} className="mt-2 text-2xl -mb-4" >
                        Select Budget Range
                    </Text>
                    <Text style={{ ...Fonts.primaryColor14Bold }} className="mt-2 text-2xl -mb-4">
                        Apply
                    </Text>
                </View>
                <View>
                    <View style={{ alignItems: 'center' }}>
                        <MultiSlider
                            isMarkersSeparated={true}
                            values={[0, 5000]}
                            min={0}
                            max={10000}
                            sliderLength={width - 50}
                            customMarkerLeft={(e) => { return (<CustomSliderMarker currentValue={e.currentValue} />) }}
                            customMarkerRight={(e) => { return (<CustomSliderMarker currentValue={e.currentValue} />) }}
                            selectedStyle={{ backgroundColor: Colors.primaryColor, height: 4.0, borderRadius: Sizes.fixPadding }}
                            unselectedStyle={{ backgroundColor: Colors.lightGrayColor, height: 4.0, borderRadius: Sizes.fixPadding }}
                        />
                    </View>
                </View>
            </View>
        )
    }


    function availableProductsInfo() {
        const renderItem = ({ item }) => {
            return (
                <TouchableOpacity className="flex-row mb-2.5 rounded-md  p-2 border border-gray-800" onPress={debounce(() => navigation.push('ProductDetail', item), 500)}>
                    <View style={{ width: 100, overflow: 'hidden' }} className="m-auto">
                        <Image resizeMode="contain" source={{ uri: `${productUrl}/${item.images[0]}` }} style={{ width: '100%', height: undefined, aspectRatio: 4 / 4 }} />
                    </View>

                    <View className=" flex-1 ml-4" >
                        <View >
                            <View className="flex-row justify-between">
                                <Text className="text-base font-semibold mb-0">
                                    {`${c_symbol} ${item.sellingprice}`}
                                </Text>
                                <View style={styles.favoriteIconWrapStyle} >
                                    <MaterialIcons
                                        name={item.inFavorite ? "favorite" : "favorite-border"}
                                        color="#00008B"
                                        size={20}
                                        onPress={debounce(() => {
                                            updateState({ showSnackBar: true })
                                            updateAvailableProducts({ id: item.uniquepid })
                                            dispatch(toggleFavouriteProductslice(item))
                                        }, 500)}
                                    />
                                </View>


                            </View>
                            <Text numberOfLines={1} style={{ flex: 1 }} className="text-base -mt-1.5 mb-5">
                                {item.ad_title}
                            </Text>
                            <View style={styles.productDetailWrapStyle} className="">
                                <MaterialCommunityIcons
                                    name="map-marker-outline"
                                    size={20}
                                    color="black"
                                />
                                <Text numberOfLines={1} style={{ flex: 1 }} className="text-gray-700 text-sm">
                                    {`${item.city}, ${item.state}`}
                                </Text>
                                <Text className="text-gray-500 text-sm">
                                    {item.date}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View>

                    </View>
                </TouchableOpacity>
            )
        }
        return (
            <FlatList
                data={availableProducts}
                keyExtractor={(item) => `${item.uniquepid}`}
                renderItem={renderItem}

                contentContainerStyle={{ paddingTop: Sizes.fixPadding + 5.0, paddingHorizontal: Sizes.fixPadding + 5.0 }}
                showsVerticalScrollIndicator={false}
            />
        )
    }

    function divider() {
        return (
            <View style={styles.dividerStyle} />
        )
    }


    function categoryLocationAndBrandInfo() {
        return (
            <View style={{ marginTop: Sizes.fixPadding * 2.0, marginHorizontal: Sizes.fixPadding + 5.0, flexDirection: 'row', }}>
                {categoryInfo()}
                {locationInfo()}
                {/* {brandInfo()} */}
            </View>
        )
    }


    function locationInfo() {
        return (
            <View style={{ flex: 1, marginHorizontal: Sizes.fixPadding - 5.0, }}>
                <Text style={{ ...Fonts.grayColor12Medium }}>
                    {t('Select Location')}
                </Text>
                <Menu
                    visible={showLocationsOptions}
                    style={{ paddingVertical: Sizes.fixPadding - 5.0, paddingRight: Sizes.fixPadding - 5.0, }}
                    anchor={
                        <TouchableOpacity
                            activeOpacity={0.9}
                            // onPress={debounce(() => updateState({ showLocationsOptions: true })}
                            // onPress={debounce(() => navigation.navigate("Selectstate")}
                            onPress={debounce(() => navigation.push('Location'), 500)}
                            style={styles.categoryLocationAndBrandWrapStyle}
                        >
                            <MaterialCommunityIcons name="map-marker" size={15} color={Colors.blackColor} />
                            <Text numberOfLines={1} style={{ flex: 1, ...Fonts.blackColor12SemiBold }} className="ml-1">
                                {locationcity}
                            </Text>

                        </TouchableOpacity>
                    }
                    onRequestClose={() => updateState({ showLocationsOptions: false })}
                >
                </Menu>
            </View>
        )
    }

    function categoryInfo() {
        return (
            <View style={{ flex: 1, marginHorizontal: Sizes.fixPadding - 5.0, }}>
                <Text style={{ ...Fonts.grayColor12Medium }}>
                    {t('Select Category')}
                </Text>
                <Menu
                    visible={showCategoriesOptions}
                    style={{ paddingVertical: Sizes.fixPadding - 5.0, marginTop: Sizes.fixPadding, paddingRight: Sizes.fixPadding - 5.0 }}
                    anchor={
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={debounce(() => updateState({ showCategoriesOptions: true }), 500)}
                            style={styles.categoryLocationAndBrandWrapStyle}
                        >
                            <Text
                                numberOfLines={1} style={{ flex: 1, ...Fonts.blackColor12SemiBold }}>
                                {t(`${selectedCategory}`)}
                            </Text>
                            <MaterialCommunityIcons name="chevron-down" size={15} color={Colors.blackColor} />
                        </TouchableOpacity>
                    }
                    onRequestClose={() => updateState({ showCategoriesOptions: false })}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text
                            style={{ marginHorizontal: Sizes.fixPadding, marginTop: Sizes.fixPadding, ...Fonts.blackColor12SemiBold }}
                            onPress={debounce(() => {
                                setSelectedsubcategory(t('All'));
                                updateState({ showCategoriesOptions: false });
                            }, 500)}
                        >
                            {t('All')}
                        </Text>
                        {categoriesList.map((item, index) => (
                            <Text
                                key={index}
                                style={{ marginHorizontal: Sizes.fixPadding, marginTop: Sizes.fixPadding, ...Fonts.blackColor12SemiBold }}
                                onPress={debounce(() => {
                                    setSelectedsubcategory(item);
                                    updateState({ showCategoriesOptions: false });
                                }, 500)}
                            >
                                {t(`${item}`)}
                            </Text>
                        ))}
                    </ScrollView>
                </Menu>
            </View>
        )
    }

    function header() {
        return (
            <HeaderBar goback={true} navigation={navigation} title={t(`${singleData.category_name}`)} />
            // <View style={styles.headerWrapStyle}>
            //     <MaterialIcons
            //         name="arrow-back-ios"
            //         color={Colors.whiteColor}
            //         size={22}
            //         onPress={debounce(() => navigation.pop(), 500)}
            //     />
            //     <Text style={{ marginLeft: Sizes.fixPadding - 5.0, flex: 1, ...Fonts.whiteColor18SemiBold }}>
            //         {t(`${singleData.category_name}`)}
            //     </Text>
            // </View>
        )
    }
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
    categoryLocationAndBrandWrapStyle: {
        marginTop: Sizes.fixPadding,
        backgroundColor: Colors.whiteColor,
        elevation: 3.0,
        paddingVertical: Sizes.fixPadding,
        paddingHorizontal: Sizes.fixPadding - 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    dividerStyle: {
        backgroundColor: Colors.lightGrayColor,
        height: 1.0,
        marginTop: Sizes.fixPadding + 5.0,
        marginHorizontal: Sizes.fixPadding * 2.0,
    },
    availableProductsWrapStyle: {
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
        margin: 2,
        marginTop: 0,
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
        bottom: -10.0,
        left: -10.0,
        right: -10.0,
        backgroundColor: '#333333',
        elevation: 0.0,
    },
    sliderThumbStyle: {
        backgroundColor: Colors.primaryColor,
        width: 14.0,
        height: 14.0,
        borderRadius: 7.0,
        borderColor: Colors.whiteColor,
        borderWidth: 1.0,
        elevation: 2.0,
    }
});
export default ServiceDetailScreen