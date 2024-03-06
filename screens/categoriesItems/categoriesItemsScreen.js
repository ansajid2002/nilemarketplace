import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, View, Dimensions, StatusBar, ImageBackground, FlatList, ScrollView, TouchableOpacity, StyleSheet, Modal, Text } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Menu } from 'react-native-material-menu';

import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { AdminUrl, HeaderBar } from "../../constant";
import { Image } from "react-native";
import { ActivityIndicator } from "react-native";
import { SubcategoryPlaceholder } from "../../components/Skeleton";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import renderItemOrSkeleton from "../../components/ProductList2";
const { width } = Dimensions.get('window');

const CategoriesItemsScreen = React.memo(({ navigation, route }) => {
    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const { c_symbol } = useSelector((store) => store.selectedCurrency)
    const [subcategoriesToShow, setSubcategoriesToShow] = useState(null)
    const [productsDataBackend, setProducts] = useState(null)
    const [filterProductsBACKEND, setFilteredProducts] = useState(null)

    const [page, setPage] = useState(1);
    const [pageloading, setPageloading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    const { categoryId, categoryName, subcategory_name, featureddatatoshow } = route.params
    const { t } = useTranslation()

    const [filterlabel, setFilterlabel] = useState()
    const [sliderValues, setSliderValues] = useState([0, 500]);
    const [selectedsubcategory, setSelectedsubcategory] = useState(subcategory_name || 'All');
    const [containerStyles, setContainerStyles] = useState({});

    const bottomSheetModalRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

    const handleSheetChanges = useCallback((index) => {
        if (index >= 0) {
            setContainerStyles(styles.container);
        } else {
            setContainerStyles({});
        }
    }, []);


    const handleSliderValuesChange = (values) => {
        const min = values[0]
        const max = values[1]
        setSliderValues(values);
    };

    const filtersData = [
        { label: "Sort By", data: [{ name: "Relevance", value: "Relevance" }, { name: "Price: Low to High", value: "Price: Low to High" }, { name: "Price: High to Low", value: "Price: High to Low" }, { name: "Most Recent", value: "Most Recent" }] },
        // { label: "Ratings", data: [{ name: "** and more", value: 2 }, { name: "*** and more", value: 3 }, { name: "**** and more", value: 4 }] },
        { label: "Discount", data: [{ name: "30% and More", value: "30%" }, { name: "50% and More", value: "50%" }, { name: "70% and More", value: "70%" }] },
        {
            label: "Price", min: sliderValues[0],
            max: sliderValues[1],
        }
    ]

    const [filterparameters, setFilterparameters] = useState([])

    const handleFilters = (newProps) => {
        setFilterparameters((prev) => {
            const { label, value, min, max } = newProps;

            // Create a copy of the previous filterparameters
            const updatedFilterparameters = { ...prev };

            if (label === "Price") {
                // Check if the "Price" label already exists
                if (updatedFilterparameters[label]) {
                    // Check if the existing min and max values match the new values
                    if (updatedFilterparameters[label].min === min && updatedFilterparameters[label].max === max) {
                        // Remove the "Price" label if the values match
                        delete updatedFilterparameters[label];
                    } else {
                        // Update the "Price" label with the new minimum and maximum values
                        updatedFilterparameters[label] = { min, max };
                    }
                } else {
                    // Create a new "Price" label with the minimum and maximum values
                    updatedFilterparameters[label] = { min, max };
                }
            } else if (label === "Sort By") {
                if (updatedFilterparameters[label]) {
                    if (updatedFilterparameters[label].includes(value)) {
                        // Remove the value from the "Sort By" label if it's already included
                        updatedFilterparameters[label] = updatedFilterparameters[label].filter((item) => item !== value);

                        // If there are no values left in the "Sort By" label, remove the label itself
                        if (updatedFilterparameters[label].length === 0) {
                            delete updatedFilterparameters[label];
                        }
                    } else {
                        updatedFilterparameters[label] = [value];
                    }
                } else {
                    updatedFilterparameters[label] = [value];
                }
            } else {
                // For other labels, continue with the existing logic
                if (updatedFilterparameters[label]) {
                    if (updatedFilterparameters[label].includes(value)) {
                        // Remove the value from the label if it's already included
                        updatedFilterparameters[label] = updatedFilterparameters[label].filter((item) => item !== value);

                        // If there are no values left in the label, remove the label itself
                        if (updatedFilterparameters[label].length === 0) {
                            delete updatedFilterparameters[label];
                        }
                    } else {
                        updatedFilterparameters[label].push(value);
                    }
                } else {
                    updatedFilterparameters[label] = [value];
                }
            }

            return updatedFilterparameters;
        });
    };

    const handlefilterdelete = (label) => {
        setFilterparameters((prev) => {
            // Create a copy of the previous filterparameters
            const updatedFilterparameters = { ...prev };

            if (label === "Price") {
                // Check if the "Price" label exists as a key in the updatedFilterparameters
                if (updatedFilterparameters.hasOwnProperty(label)) {
                    // If it exists, delete the "Price" key
                    setSliderValues([0, 500])
                    delete updatedFilterparameters[label];
                }
            } else {
                // For other labels, continue with the existing logic
                if (updatedFilterparameters.hasOwnProperty(label)) {
                    // If it exists, delete the key-value pair
                    delete updatedFilterparameters[label];
                }
            }

            bottomSheetModalRef?.current.dismiss()
            return updatedFilterparameters;
        });
        featureddatatoshow ? getProductsbysubcategory(selectedsubcategory) : getProductsbysubcategory('All')

    };

    const handlefilterresults = () => {
        handleFilters({ label: "Price", min: sliderValues[0], max: sliderValues[1] })
        bottomSheetModalRef?.current.dismiss()
        featureddatatoshow ? getProductsbysubcategory(selectedsubcategory) : getProductsbysubcategory('All')
    }

    const discountThresholds = {
        "70%": 0.7,
        "50%": 0.5,
        "30%": 0.3,
    };

    const sortProducts = (products, sortBy) => {
        switch (sortBy) {
            case t("Price: Low to High"):
                return products.sort((a, b) => parseFloat(a.sellingprice) - parseFloat(b.sellingprice));
            case t("Price: High to Low"):
                return products.sort((a, b) => parseFloat(b.sellingprice) - parseFloat(a.sellingprice));
            case t("Most Recent"):
                return products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            case t("Relevance"):
                // Implement relevance-based sorting if needed
                return products; // Placeholder, customize as needed
            default:
                return products;
        }
    };

    const filterByDiscount = (products, discountPercentage) => {
        const threshold = discountThresholds[discountPercentage];
        if (threshold) {
            return products.filter(
                (product) => (parseFloat(product.mrp) - parseFloat(product.sellingprice)) / parseFloat(product.mrp) > threshold
            );
        }
        return products;
    };

    const filterByPriceRange = (products, filterparameters) => {
        const priceFilter = filterparameters["Price"];

        if (priceFilter) {
            const { min, max } = priceFilter;

            return products.filter(
                (product) => {
                    const productPrice = parseFloat(product.sellingprice);
                    return productPrice >= min && productPrice <= max;
                }
            );
        }

        return products; // No price filter applied, return all products
    };

    const filterapplied = () => {

        const sortBy = filterparameters["Sort By"] && filterparameters["Sort By"][0];
        const discountFilter = filterparameters["Discount"] && filterparameters["Discount"][0];
        const priceFilter = filterparameters["Price"]
        // let filteredProducts = filterProductsBySubcategory();
        let filteredProducts = []

        if (sortBy) {
            filteredProducts = sortProducts(productsDataBackend, sortBy);
        }

        if (discountFilter) {
            filteredProducts = filterByDiscount(productsDataBackend, discountFilter);
        }
        if (priceFilter) {
            filteredProducts = filterByPriceRange(productsDataBackend, filterparameters);
        }


        return filteredProducts;
    };

    useEffect(() => {
        const products = filterapplied()
        setFilteredProducts(products)
    }, [filterparameters])

    const renderSubcategoryItem = (item) => {
        const isSelected = item.subcategory_name === selectedsubcategory
        return (
            <TouchableOpacity
                className={`w-[90px]`}
                onPress={debounce(() => {
                    handleSubcategoryProduct(item.subcategory_name);
                }, 500)}
                key={item.id}
            >
                <View key={item.subcategory_name} className={`h-[80px] w-[80px] border border-gray-200 shadow-sm rounded-full mx-auto duration-300 overflow-hidden ${isSelected ? ' border-gray-600 border-2 ' : ''}`} >
                    <Image
                        source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${item.subcategory_image_url}` }}
                        style={{ resizeMode: 'contain' }}
                        className={`rounded-full w-full h-full  ${isSelected ? ' scale-100 ' : ' scale-90'}`}
                    />
                </View>
                <Text
                    numberOfLines={2}
                    className={`text-center text-[11px] mt-1.5 px-1 py-0.5  ${isSelected ? 'font-bold  text-[13px]  rounded-sm ' : ''}`}
                >
                    {t(`${item.subcategory_name}`)}
                </Text>
            </TouchableOpacity>
        )
    };

    const getSubcatDataByCatId = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getSubcategorygroupByCatId?catId=${categoryId}&category_name=${categoryName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            if (data) {
                setSubcategoriesToShow(data.subcategories);
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        if (!subcategoriesToShow && !featureddatatoshow) {
            getSubcatDataByCatId()
        }
    }, [subcategoriesToShow])

    const handleSubcategoryProduct = (subcat_name) => {
        setSelectedsubcategory(subcat_name)
        getProductsbysubcategory(subcat_name)
    }

    ////////////////Here we get the products of subcategory using API//////////////////////////////// 
    const getProductsbysubcategory = async (subcategoryname) => {
        setProducts(null)
        setFilteredProducts(null)
        setPageloading(true);
        try {
            const response = await fetch(`${AdminUrl}/api/getProductBySubcategories?subcat=${subcategoryname.replace(/[^\w\s]/g, "")
                .replace(/\s/g, "")}&pageNumber=${page}&pageSize=10&currency=${currencyCode}&category=${categoryName.replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "")}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data?.AllProducts.length > 0) {
                setProducts(prevProducts => {
                    if (prevProducts) {
                        return [...prevProducts, ...data?.AllProducts];
                    } else {
                        return [...data?.AllProducts];
                    }
                });
                setFilteredProducts(prevProducts => {
                    if (prevProducts) {
                        return [...prevProducts, ...data?.AllProducts];
                    } else {
                        return [...data?.AllProducts];
                    }
                });
                setHasMore(true); // If data is fetched and not an empty array, set hasMore to true
            }

            else {
                !filterProductsBACKEND && setFilteredProducts([])
                !productsDataBackend && setProducts([])
                filterProductsBACKEND?.length === 0 && setFilteredProducts([])
                productsDataBackend?.length === 0 && setProducts([])
                setHasMore(false); // If response is an empty array, set hasMore to false

            }

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setPageloading(false);
        }
    };

    useEffect(() => {
        selectedsubcategory ? getProductsbysubcategory(selectedsubcategory) : getProductsbysubcategory('All')
    }, [page])



    const CustomSliderMarker = ({ currentValue }) => (
        <View style={{ alignItems: 'center' }}>
            <View style={styles.sliderThumbStyle} />
            <Text style={{ position: 'absolute', top: 20 }} className="text-[14px]">
                {c_symbol} {currentValue}
            </Text>
        </View>
    )

    function renderStars(value) {
        const stars = [];
        for (let i = 0; i < value; i++) {
            stars.push(
                <MaterialCommunityIcons key={i} name="star" color={"#00008b"} size={20} />
            );
        }
        return stars;
    }

    // callbacks
    const handlePresentModalPress = useCallback((label) => {
        setFilterlabel(label)
        bottomSheetModalRef.current?.present();
        setContainerStyles(styles.container);
    }, []);

    const handlePresentModalClose = useCallback(() => {
        bottomSheetModalRef.current?.dismiss(); // Dismiss the modal
    }, []);

    const renderBackdrop = useCallback(
        (props) => <BottomSheetBackdrop {...props} />,
        []
    );

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />

            {availableProductsInfo()}
            <BottomSheetModalProvider>
                <View style={containerStyles}>
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={1}
                        snapPoints={snapPoints}
                        onChange={handleSheetChanges}
                        enableDismissOnPress={true}
                        backdropComponent={renderBackdrop}
                    >
                        {
                            filtersData.filter((s) => s.label === filterlabel)?.map((single, index) => {
                                if (filterlabel === "Price") {
                                    return (
                                        <View className="m-2" key={index} >
                                            <View className="flex-row items-center justify-between mx-4">
                                                <Text className="text-xl mb-3">{t("Select Price Range")}</Text>
                                                <TouchableOpacity onPress={debounce(() => handlePresentModalClose(), 500)}>
                                                    <MaterialCommunityIcons name="close" color={"black"} size={22} />
                                                </TouchableOpacity>
                                            </View>
                                            <View style={{ alignItems: 'center' }}>
                                                <MultiSlider
                                                    isMarkersSeparated={true}
                                                    values={[sliderValues[0], sliderValues[1]]}
                                                    min={0}
                                                    max={1000}
                                                    sliderLength={width - 70}
                                                    customMarkerLeft={(e) => { return (<CustomSliderMarker currentValue={e.currentValue} />) }}
                                                    customMarkerRight={(e) => { return (<CustomSliderMarker currentValue={e.currentValue} />) }}
                                                    selectedStyle={{ backgroundColor: Colors.primaryColor, height: 4.0, borderRadius: Sizes.fixPadding }}
                                                    unselectedStyle={{ backgroundColor: Colors.lightGrayColor, height: 4.0, borderRadius: Sizes.fixPadding }}
                                                    onValuesChange={handleSliderValuesChange}

                                                />
                                            </View>
                                            <View className="flex-row ml-auto mr-4 space-x-4 my-6 ">
                                                <TouchableOpacity
                                                    className="bg-[#00008b] rounded-md max-w-[100px]" onPress={debounce(() => handlefilterdelete(filterlabel), 500)}>
                                                    <Text className="mx-auto p-0.5 mb-1 px-2.5 tracking-wider text-lg text-white font-semibold">{t("Reset")}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity className="bg-[#fb7701] rounded-md max-w-[90px] i " onPress={debounce(() => handlefilterresults(), 500)}>
                                                    <Text className="mx-auto p-0.5 mb-1 px-2.5 tracking-wider text-lg text-white font-semibold">{t("Apply")}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )
                                }

                                else if (filterlabel === "Ratings") {
                                    return (
                                        <View className="m-2" key={index}>

                                            <View className="flex-row items-center justify-between mx-4">
                                                <Text className="text-xl mb-3">{t(`${single.label}`)}</Text>
                                                <TouchableOpacity onPress={debounce(() => handlePresentModalClose(), 500)}>
                                                    <MaterialCommunityIcons name="close" color={"black"} size={22} />
                                                </TouchableOpacity>
                                            </View>

                                            <View className="flex-row flex-wrap  w-full">
                                                {single.data?.map((s, index) => {

                                                    return (
                                                        <TouchableOpacity onPress={debounce(() => handleFilters({ label: "Ratings", value: s.value }), 500)} key={index}
                                                            style={filterparameters["Ratings"]?.includes(s.value) ? { backgroundColor: '#E5E4E2' } : { backgroundColor: 'white' }}
                                                            // style={{backgroundColor:"red"}}

                                                            className="border  border-gray-200 p-1 px-1.5 rounded-md mb-3  mr-4 ">
                                                            <View className="flex-row items-center">
                                                                {renderStars(s.value)}
                                                                <Text className=" tracking-wide font-medium text-[16px]"> {t("and more")} </Text>
                                                            </View>

                                                        </TouchableOpacity>
                                                    )
                                                })}
                                            </View>
                                            <View className="flex-row ml-auto mr-4 space-x-4 my-6 ">
                                                <TouchableOpacity className="bg-[#00008b] rounded-md max-w-[100px] " onPress={debounce(() => handlefilterdelete("Ratings"), 500)}>
                                                    <Text className="mx-auto p-0.5 mb-1 px-2.5 tracking-wider text-lg text-white font-semibold">{t("Reset")}</Text>
                                                </TouchableOpacity>

                                            </View>
                                        </View>
                                    )
                                }
                                return (
                                    <View className="m-2" key={index}>
                                        <View className="flex-row items-center justify-between mx-4">
                                            <Text className="text-xl mb-3">{t(`${single.label}`)}</Text>
                                            <TouchableOpacity onPress={debounce(() => handlePresentModalClose(), 500)}>
                                                <MaterialCommunityIcons name="close" color={"black"} size={22} />
                                            </TouchableOpacity>
                                        </View>
                                        <View className="flex-row flex-wrap   ">
                                            {single.data?.map((s, index) => {
                                                return (
                                                    <TouchableOpacity onPress={debounce(() => handleFilters({ label: single.label, value: s.value }), 500)} key={index}
                                                    >
                                                        <Text className="text-[15px] my-2 tracking-wide mr-4 border border-gray-200 py-1 px-2 rounded-md"
                                                            style={filterparameters[filterlabel]?.includes(s.value) ? { backgroundColor: '#E5E4E2' } : { backgroundColor: 'white' }}
                                                        >{t(`${s.name}`)}</Text>
                                                    </TouchableOpacity>


                                                )
                                            })}
                                        </View>
                                        <View className="flex-row ml-auto mr-4 space-x-4 my-6 ">
                                            <TouchableOpacity className="bg-[#00008b] rounded-md max-w-[100px] " onPress={debounce(() => handlefilterdelete(single.label), 500)}>
                                                <Text className="mx-auto p-0.5 mb-1 px-2.5 tracking-wider text-lg text-white font-semibold" >{t("Reset")}</Text>
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                )
                            })
                        }
                    </BottomSheetModal>
                </View>
            </BottomSheetModalProvider>
        </SafeAreaView>
    )

    function availableProductsInfo() {
        return (
            <View>

                {!filterProductsBACKEND && filterProductsBACKEND?.length === 0 ? (
                    <View className="flex-row items-center  m-auto mt-24">
                        <ActivityIndicator size="large" color="red" />
                        {/* <Text className="text-gray-400 ml-2 text-[14px]">Fetching Location Data...</Text> */}
                    </View>
                ) : (
                    <View>
                        {/* <ProductListing title={selectedsubcategory} productList={filterProductsBACKEND} /> */}
                        <FlatList
                            data={filterProductsBACKEND}
                            renderItem={renderItemOrSkeleton
                            }
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={2} // Adjust as needed
                            onEndReached={filterProductsBACKEND?.length > 9 && loadMoreProducts}
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
                                        filterProductsBACKEND?.length === 0 &&
                                        <View className="">
                                            <Image resizeMode="contain" className="h-[150px] w-[150px] mx-auto" source={require('../../assets/images/empty-folder.png')} />
                                            <Text className="text-center text-xl ">{t("No Product Found !")}</Text>
                                        </View>
                                    }
                                </View>
                            )}
                            ListHeaderComponent={() => (
                                <View>
                                    <HeaderBar goback={true} title={t(`${route.params.categoryName ? route.params.categoryName : "sbcategory"}`)} navigation={navigation} />

                                    {filtersInfo2()}
                                    {categoryInfo()}
                                    {divider()}
                                </View>
                            )}
                        />
                    </View>
                )}
            </View>
        )
    }


    function filtersInfo2() {
        return (
            <View className="py-2 border-b border-gray-200">
                <ScrollView className="gap-2 px-2" horizontal showsHorizontalScrollIndicator={false}>
                    {
                        filtersData?.map((single, index) => {
                            let translatedText = t(single.label)
                            return (
                                <TouchableOpacity key={index} className="flex-row py-1 px-2 items-center border border-gray-200 rounded-md " onPress={() => handlePresentModalPress(single.label)}>
                                    {
                                        single.label === "Price" ?
                                            <Text className=" text-[15px] ">{t(`${single.label}`)}</Text> :
                                            <Text className=" text-[15px] ">{`${translatedText} ${filterparameters[single.label]
                                                ? `(${filterparameters[single.label].length})`
                                                : ""
                                                }`}</Text>
                                    }
                                    <MaterialCommunityIcons name="chevron-down" size={16} />
                                </TouchableOpacity>
                            )
                        })
                    }
                    {
                        Object.keys(filterparameters).length !== 0 ?
                            <TouchableOpacity className="flex-row mx-4 px-1.5 rounded-md items-center" onPress={debounce(() => {
                                featureddatatoshow ? getProductsbysubcategory(selectedsubcategory) : getProductsbysubcategory('All')

                                setFilterparameters({})
                            }, 500)}><Text className="text-[15px] text-blue-800   mr-0.5 font-medium ">{t("Clear all")}</Text></TouchableOpacity>
                            : ""}
                </ScrollView>
            </View>
        )
    }

    function divider() {
        return (
            <View style={styles.dividerStyle} />
        )
    }


    function categoryInfo() {
        return (
            <View className="px-1 mt-4" style={{ flex: 1 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {
                        featureddatatoshow || subcategoriesToShow ?
                            <>
                                {
                                    categoryName !== 'Featured' && <TouchableOpacity className="w-[90px]"
                                        onPress={debounce(() => {
                                            handleSubcategoryProduct('All');
                                        }, 500)}>
                                        <View className={`h-[80px] w-[80px] border border-gray-200 shadow-sm  rounded-full mx-auto duration-300 overflow-hidden
                            ${selectedsubcategory === t("All") ? ' border-gray-600 border-2 ' : ''}`}>
                                            <Image resizeMode="contain" className={`rounded-full w-full h-full  ${selectedsubcategory === t("All") ? '  ' : ' scale-90'} `} source={require('../../assets/images/allproducts.png')} />
                                        </View>
                                        <Text

                                            // style={{ marginHorizontal: Sizes.fixPadding, marginTop: Sizes.fixPadding, ...Fonts.blackColor12SemiBold }}
                                            className={`text-center text-[12px] mt-1.5 px-1 py-0.5  ${selectedsubcategory === t("All") ? 'font-bold  text-[13px]  rounded-lg ' : ''}`}

                                        >{t("All")}</Text>
                                    </TouchableOpacity>

                                }

                                {
                                    featureddatatoshow ? (
                                        featureddatatoshow.map((item, index) => (
                                            <View key={index}>
                                                {renderSubcategoryItem(item, false)}
                                            </View>
                                        ))
                                    ) : (
                                        subcategoriesToShow?.map((item, index) => (
                                            <View key={index}>
                                                {renderSubcategoryItem(item, selectedsubcategory === item.subcategory_name)}
                                            </View>
                                        ))
                                    )
                                }
                            </>
                            :
                            <SubcategoryPlaceholder />

                    }

                </ScrollView>


            </View>
        )
    }

})

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
});

export default CategoriesItemsScreen; 