import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Dimensions, StatusBar, ImageBackground, FlatList, ScrollView, TouchableOpacity, StyleSheet, Modal, Text } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Menu } from 'react-native-material-menu';
import { Snackbar } from 'react-native-paper';
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { AdminUrl, HeaderBar } from "../../constant";
import ProductListing from "../../components/ProductList";
import { Image } from "react-native";
import { loaderOff, loaderOn } from "../../store/slices/counterslice";
import { ActivityIndicator } from "react-native";
import { SubcategoryPlaceholder } from "../../components/Skeleton";
const { width } = Dimensions.get('window');
// import { currencyConverter } from "../Currency/currencyScreen";


const CategoriesItemsScreen = React.memo(({ navigation, route }) => {
    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const { c_symbol } = useSelector((store) => store.selectedCurrency)
    const [subcategoriesToShow, setSubcategoriesToShow] = useState(null)
    const [productsDataBackend, setProducts] = useState(null)
    const categoryid = route.params.categoryId
    console.log("route.params start");
    console.log(route.params);
    console.log("route.params end");

    const { t } = useTranslation()


    const getSubcatDataByCatId = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getSubcategorygroupByCatId?catId=${categoryid}`);
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

   

    const [isOpen, setIsOpen] = useState(false);
    const [filterlabel, setFilterlabel] = useState()
    const [sliderValues, setSliderValues] = useState([0, 500]);
    const [subcategoryData, setSubcategoryData] = useState([])
    // const { loaderstate } = useSelector((store) => store.bottomtabbar)
    const [showLoading, setShowLoading] = useState(true);
    const [selectedsubcategory, setSelectedsubcategory] = useState('All');

    const togglePickeropen = (label) => {
        setFilterlabel(label)
        setIsOpen(true);
    };

    const togglePickerclose = () => {
        setIsOpen(false);
    };
    const handleSliderValuesChange = (values) => {
        const min = values[0]
        const max = values[1]
        setSliderValues(values);
    };
    const filtersData = [
        { label: "Sort By", data: [{ name: "Relevance", value: "Relevance" }, { name: "Price: Low to High", value: "Price: Low to High" }, { name: "Price: High to Low", value: "Price: High to Low" }, { name: "Most Recent", value: "Most Recent" }] },
        { label: "Ratings", data: [{ name: "** and more", value: 2 }, { name: "*** and more", value: 3 }, { name: "**** and more", value: 4 }] },
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

            togglePickerclose()
            return updatedFilterparameters;
        });
    };


    const handlefilterresults = () => {
        handleFilters({ label: "Price", min: sliderValues[0], max: sliderValues[1] })
        togglePickerclose()
    }



    //////////////////////REDUX//////////////////////////////////////
    const dispatch = useDispatch()
    console.log(route.params.categoryName);
    ////////////////Here we get the products of subcategory using API//////////////////////////////// 
    const getProductsbysubcategory = async (subcategoryname) => {
        setProducts(null)
        try {
            const response = await fetch(`${AdminUrl}/api/getProductBySubcategories?subcat=${subcategoryname.replace(/[^\w\s]/g, "")
                .replace(/\s/g, "")}&currency=${currencyCode}&category=${route.params.categoryName.replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "")}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(" get product by subcategory name");
            console.log(data);
            console.log(" get product by subcategory name");

            // setSubcategoryData((prevData) => [...prevData, ...data.AllProducts]);
            setProducts(data?.AllProducts)
            // You can dispatch or process the data here as needed.
        } catch (error) {
            console.error('Error:', error);
        }
    };


   

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
            filteredProducts = sortProducts(filteredProducts, sortBy);
        }

        if (discountFilter) {
            filteredProducts = filterByDiscount(filteredProducts, discountFilter);
        }
        if (priceFilter) {
            filteredProducts = filterByPriceRange(filteredProducts, filterparameters);
        }

        return filteredProducts;
    };


    // const filterProductsBySubcategory = () => {
    //     if (selectedsubcategory === t("All")) {
    //         return subcategoryData; // Return all products
    //     } else {
    //         return subcategoryData.filter((singleproduct) => {
    //             return singleproduct.slug_subcat === selectedsubcategory.replace(/[^\w\s]/g, "")
    //                 .replace(/\s/g, "");
    //         });
    //     }
    // }

    // useEffect(() => {
    //     if (subcategoryData.length === 0) {
    //         // dispatch(loaderOn())
    //         categoriesList?.map((single) => {
    //             getProductsbysubcategory(single.trim())
    //         })
    //         // dispatch(loaderOff())
    //     }
    //     else {
    //         console.log("NOT FOUND");
    //     }

    // }, [selectedsubcategory])

    useEffect(() => {
        if (!subcategoriesToShow) {
            getSubcatDataByCatId()
        }
    }, [subcategoriesToShow])

    useEffect(() => {
        if (!productsDataBackend ) {
            getProductsbysubcategory('All')

        }
    }, [productsDataBackend])
    useEffect(() => {
        updateState({ availableProducts: filterapplied() })
    }, [filterparameters])

    const [state, setState] = useState({
        selectedCategory: selectedsubcategory,
        showCategoriesOptions: false,
        showLocationsOptions: false,
        availableProducts: [],
        showSnackBar: false,
        snackBarMsg: null,
    })
    const updateState = (data) => setState((state) => ({ ...state, ...data }))

    const {
        availableProducts,
        showSnackBar,
        snackBarMsg,
    } = state;

    // useEffect(() => {
    //     if (subcategoryData) {
    //         // const filteredProducts = filterProductsBySubcategory();
    //         // const updatedAvailableProducts = filteredProducts.length === 0
    //         //     ? subcategoryData.filter((singleproduct) => singleproduct.subcategory === selectedsubcategory)
    //         //     : filteredProducts;

    //         // updateState({
    //         //     availableProducts: updatedAvailableProducts,
    //         //     selectedCategory: selectedsubcategory,
    //         // });
    //         setFilterparameters([])
    //     }
    //     dispatch(loaderOff())
    // }, [selectedsubcategory, subcategoryData]);


    const handleSubcategoryProduct = (subcat_name) => {
        setSelectedsubcategory(subcat_name)
        getProductsbysubcategory(subcat_name)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            {header()}
            {filtersInfo2()}
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {divider()}
                {categoryLocationAndBrandInfo()}
                {divider()}

                {availableProductsInfo()}
            </ScrollView>
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


    function filtersInfo2() {

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

        return (
            <View className="mt-3">

                <ScrollView className="mx-auto" horizontal showsHorizontalScrollIndicator={false}>
                    {
                        filtersData?.map((single, index) => {
                            let translatedText = t(single.label)
                            return (


                                <TouchableOpacity key={index} className="mx-2 flex-row items-center border border-gray-200 rounded-md p-1" onPress={debounce(() => togglePickeropen(single.label), 500)}>
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
                            <TouchableOpacity className="flex-row mx-4 bg-[#CED5FF] px-1.5 rounded-md items-center" onPress={debounce(() => setFilterparameters({}), 500)}><Text className="text-[15px]   mr-0.5 font-medium ">{t("Clear all")}</Text><MaterialCommunityIcons name="close" size={16} /></TouchableOpacity>
                            : ""}
                </ScrollView>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isOpen}
                    onRequestClose={togglePickerclose}
                >

                    <View style={{ flex: 1 }} className="">
                        <TouchableOpacity
                            style={{ position: 'absolute', top: 0, right: 0, left: 0, bottom: 0 }}
                            activeOpacity={1}
                            onPress={debounce(togglePickerclose, 500)}
                        >
                            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)' }} />
                        </TouchableOpacity>

                        <View className="h-100 pt-4 min-h-[175px] bg-white">

                            {
                                filtersData.filter((s) => s.label === filterlabel)?.map((single, index) => {
                                    if (filterlabel === "Price") {
                                        return (
                                            <View className="m-2" key={index} >
                                                <View className="flex-row items-center justify-between mx-4">
                                                    <Text className="text-xl mb-3">{t("Select Price Range")}</Text>
                                                    <TouchableOpacity onPress={debounce(() => togglePickerclose(), 500)}>
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
                                                    <TouchableOpacity onPress={debounce(() => togglePickerclose(), 500)}>
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
                                                <TouchableOpacity onPress={debounce(() => togglePickerclose(), 500)}>
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
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }

    function availableProductsInfo() {

        return (

            <View>
                {!productsDataBackend ? (
                    <View className="flex-row items-center  m-auto mt-24">
                        <ActivityIndicator size="large" color="#00008b" />
                        {/* <Text className="text-gray-400 ml-2 text-[14px]">Fetching Location Data...</Text> */}
                    </View>
                ) : productsDataBackend.length === 0 ? (
                    <View className="mt-10">
                        <Image resizeMode="contain" className="h-[150px] w-[150px] mx-auto" source={require('../../assets/images/empty-folder.png')} />
                        <Text className="text-center text-xl ">{t("No Product Found !")}</Text>
                    </View>
                ) : (
                    <View>
                        <ProductListing title={selectedsubcategory} productList={productsDataBackend} />
                    </View>
                )}
            </View>
        )
    }

    function divider() {
        return (
            <View style={styles.dividerStyle} />
        )
    }

    function categoryLocationAndBrandInfo() {
        return (
            <View style={{ marginTop: Sizes.fixPadding * 2.0, flexDirection: 'row', }}>
                {categoryInfo()}
            </View>
        )
    }

    function categoryInfo() {
        return (
            <View className="px-1" style={{ flex: 1 }}>
            
            

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {
                    subcategoriesToShow ?  

                <>
                    <TouchableOpacity className="w-[90px]"
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
                    
                        {

                        subcategoriesToShow?.map((item, index) => (
                            <TouchableOpacity className={`w-[90px] `}
                                onPress={debounce(() => {
                                    handleSubcategoryProduct(item.subcategory_name);
                                }, 500)}
                                key={index}>
                                <View className={`h-[80px] w-[80px] border border-gray-200 shadow-sm rounded-full mx-auto duration-300 overflow-hidden
                                ${selectedsubcategory === item.subcategory_name ? ' border-gray-600 border-2 ' : ''}`} >
                                    {/* <Image className={`rounded-full w-full h-full  ${selectedsubcategory === item ? ' scale-110 ' : ''} `} source={require('../../assets/images/mobiles/mobile11.png')} /> */}

                                    <Image
                                        source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${item.subcategory_image_url}` }}
                                        style={{ resizeMode: 'contain' }}
                                        className={`rounded-full w-full h-full  ${selectedsubcategory === item.subcategory_name ? ' scale-100 ' : ' scale-90'}`}
                                    />
                                </View>
                                <Text
                                    numberOfLines={2}
                                    // style={{ marginHorizontal: Sizes.fixPadding, marginTop: Sizes.fixPadding, ...Fonts.blackColor12SemiBold }}
                                    className={`text-center text-[11px] mt-1.5 px-1 py-0.5  ${selectedsubcategory === item.subcategory_name ? 'font-bold  text-[13px]  rounded-sm ' : ''}`}

                                >
                                    {t(`${item.subcategory_name}`)}
                                </Text>
                            </TouchableOpacity>
                        )) 
                    }</>

                    
                        : 
            <SubcategoryPlaceholder/>
                        
                        }

                </ScrollView> 
            

            </View>
        )
    }

    function header() {
        return (
            <HeaderBar goback={true} title={t(`${route.params.categoryName ? route.params.categoryName : "sbcategory"}`)} navigation={navigation} />)
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
    }
});

export default CategoriesItemsScreen; 