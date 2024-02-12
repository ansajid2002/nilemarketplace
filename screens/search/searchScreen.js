import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    SafeAreaView,
    View,
    StatusBar,
    TouchableOpacity,
    Image,
    Text,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    Pressable,
} from "react-native";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { Colors, Sizes } from "../../constants/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AdminUrl } from "../../constant";
import Animated, { useSharedValue } from 'react-native-reanimated';
import { CategorysidebarPlaceholder } from "../../components/Skeleton";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SearchScreen = ({ navigation }) => {
    const { t } = useTranslation();
    const [productCatData, setProductCatData] = useState(null)
    const [selectedcategory, setSelectedcategory] = useState(t("Featured"));
    const [subcategoriesdatatoshow, setSubcategoriesdatatoshow] = useState(null);
    const [featureddatatoshow, setFeatureddatatoshow] = useState(null);

    const getProductsData = async () => {
        try {
            // Check if there is stored data and if it is still valid
            const storedData = await AsyncStorage.getItem('productCatData');
            const storedTimestamp = await AsyncStorage.getItem('productCatDataTimestamp');
            const currentTimestamp = new Date().getTime();

            if (storedData && storedTimestamp && currentTimestamp - parseInt(storedTimestamp) <= 30 * 60 * 1000) {
                // Use stored data if it's still valid
                console.log('storage');
                setProductCatData(JSON.parse(storedData));
            } else {
                // Fetch new data
                const response = await fetch(`${AdminUrl}/api/getProductsData`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                console.log('backend');

                const data = await response.json();

                // Save the new data and timestamp in AsyncStorage
                await AsyncStorage.setItem('productCatData', JSON.stringify(data));
                await AsyncStorage.setItem('productCatDataTimestamp', currentTimestamp.toString());

                // Set the state with the new data
                setProductCatData(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (!productCatData) {
            getProductsData()
        }
    }, [productCatData])

    const fetchFeaturedData = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getFeaturedSubcategories`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setFeatureddatatoshow(data);

            // Save the new data to AsyncStorage
            await AsyncStorage.setItem('featuredData', JSON.stringify(data));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check if there is stored data
                const storedData = await AsyncStorage.getItem('featuredData');

                if (storedData) {
                    // Use stored data if it exists
                    setFeatureddatatoshow(JSON.parse(storedData));
                } else {
                    // Fetch new data if there is no stored data
                    await fetchFeaturedData();
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (!featureddatatoshow) {
            fetchData();
        }
    }, [featureddatatoshow]);

    ////////////////////////////////////////////////////////////////////////////////////////
    const handlesubcategoriesdata = async (category_id, category_name) => {
        try {

            // Set the selected category after handling data
            setSelectedcategory(category_name);

            // Check if there is stored data for the specific category_id and if it is still valid
            const storedSubcategoriesData = await AsyncStorage.getItem(`subcategoriesData_${category_id}`);
            const storedTimestamp = await AsyncStorage.getItem(`subcategoriesDataTimestamp_${category_id}`);
            const currentTimestamp = new Date().getTime();

            if (storedSubcategoriesData && storedTimestamp && currentTimestamp - parseInt(storedTimestamp) <= 30 * 60 * 1000) {
                // Use stored data if it's still valid
                setSubcategoriesdatatoshow(JSON.parse(storedSubcategoriesData));
            } else {
                // Fetch new data if there is no stored data or if it's expired
                const response = await fetch(`${AdminUrl}/api/getSubcategoriesByCatId?catId=${category_id}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data);
                // Save the new data and timestamp to AsyncStorage
                await AsyncStorage.setItem(`subcategoriesData_${category_id}`, JSON.stringify(data));
                await AsyncStorage.setItem(`subcategoriesDataTimestamp_${category_id}`, currentTimestamp.toString());

                // Set the state with the new data
                setSubcategoriesdatatoshow(data);
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                {showcategories()}
            </View>
        </SafeAreaView>
    )


    function header() {
        return (
            <Animated.View
                className="px-2  mb-4"
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
            >
                <TouchableOpacity
                    className=" rounded-md mt-4 h-9 border border-gray-500"
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
                        navigation.navigate("Search");
                    }, 500)}
                >
                    <View>
                        <Text className="pl-3">{t("Search Market-Place ...")}</Text>
                    </View>
                </TouchableOpacity>
                <MaterialIcons
                    className=""
                    name={"search"}
                    size={22}
                    style={styles.searchIcon}
                />
            </Animated.View>
        );
    }

    function showcategories() {
        const renderitem = ({ item }) => {
            return (
                <TouchableOpacity onPress={debounce(() => handlesubcategoriesdata(item.category_id, item.category_name), 500)}
                    className={` ${selectedcategory === item.category_name ? "border-[#ff7701] border-l-4 bg-white" : "border-b border-orange-300"}`}>
                    <View style={{ position: 'relative', alignItems: 'center' }}>
                        <Image
                            source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                            style={{ width: 100, height: 100, resizeMode: 'cover' }}
                        />
                        {selectedcategory !== item.category_name && (
                            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.3)' }} />
                        )}
                        <Text className={`  ${selectedcategory === item.category_name ? "text-gray-200" : "text-white"} font-bold text-center`} style={{ position: 'absolute', top: '50%', fontSize: 13 }}>
                            {t(`${item.category_name}`)}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        };

        return (<>
            <View className="flex-row flex-1">
                <View className="w-[25%]  bg-black/30 mr-2 ">
                    {
                        productCatData ?
                            <FlatList showsVerticalScrollIndicator={false}
                                data={productCatData}
                                renderItem={renderitem}
                                keyExtractor={item => item.category_id}
                                ListHeaderComponent={() => (
                                    <TouchableOpacity onPress={debounce(() => setSelectedcategory("Featured"), 500)}
                                        className={`pb-2.5 pt-1.5 ${selectedcategory === "Featured" ? "border-[#ff7701] border-l-4 bg-white" : "border-b border-orange-300"}`}>
                                        <View className=" items-center">
                                            <Image
                                                source={require('../../assets/images/allproducts.png')}
                                                style={{ width: 60.0, height: 60.0, resizeMode: 'cover' }}
                                                className=""
                                            />
                                            <Text className="text-[12px] px-2 pt-2 pb-1 text-[#1b1b52]" >{t('Featured')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            /> :
                            <CategorysidebarPlaceholder />
                    }
                </View>
                <View className="w-[70%]  bg-[white]">
                    <Text className="text-center mb-2 font-medium text-lg">{t("Shop By Category")}</Text>
                    <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
                        {
                            featureddatatoshow ?
                                <View className="flex-row flex-wrap justify-center gap-4 mb-4 mt-1">
                                    {
                                        (selectedcategory === "Featured") ?
                                            featureddatatoshow?.map((single) => {

                                                const { subcategory_id, subcategory_name, subcategory_image_url, parent_category_id } = single
                                                return (
                                                    <TouchableOpacity className=" items-center my-3 mx-0.5 " key={subcategory_id}
                                                        // onPress={debounce(() => handlecategorytosent(parent_category_id, subcategory_name))}
                                                        // navigation.push('CategoryProductList',{ item, subcategory_name: t("All") })
                                                        // onPress={debounce(() => {
                                                        //     navigation.push("CategoryProductList", {categoryId:parent_category_id });
                                                        // })}

                                                        onPress={debounce(() => {
                                                            navigation.push("CategoryProductList", { categoryId: parent_category_id, categoryName: selectedcategory, subcategory_name: subcategory_name, featureddatatoshow });
                                                        }, 500)}

                                                    >
                                                        <View className="w-[70px] h-[70px] rounded-full border border-gray-300">
                                                            <Image
                                                                source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${subcategory_image_url}` }}
                                                                style={{ resizeMode: 'cover' }}
                                                                className=" w-full h-full rounded-full"
                                                            />

                                                        </View>
                                                        <Text className="w-[75px] text-[10px] text-center mt-1.5 " numberOfLines={2}>
                                                            {t(`${subcategory_name}`)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            }) :
                                            subcategoriesdatatoshow?.map((single) => {
                                                const { subcategory_id, subcategory_name, subcategory_image_url, parent_category_id } = single
                                                return (
                                                    <TouchableOpacity className=" items-center mx-0.5 my-3" key={subcategory_id}
                                                        // onPress={debounce(() => handlecategorytosent(parent_category_id, subcategory_name))}>
                                                        onPress={debounce(() => {
                                                            navigation.push("CategoryProductList", { categoryId: parent_category_id, categoryName: selectedcategory, subcategory_name: subcategory_name });
                                                        }, 500)}

                                                    // onPress={debounce(() => navigation.push('CategoryProductList', { categoryId:item.category_id,categoryName:item.category_name, subcategory_name: t("All") }), 500)}

                                                    >
                                                        <View className="w-[70px] h-[70px] rounded-full border border-gray-300">
                                                            <Image
                                                                source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${subcategory_image_url}` }}
                                                                style={{ resizeMode: 'contain' }}
                                                                className=" w-full h-full rounded-full"
                                                            />

                                                        </View>
                                                        <Text className="w-[75px] text-[10px] text-center mt-1.5 " numberOfLines={2}>{t(`${subcategory_name}`)}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                    }
                                </View>
                                : <CategorysidebarPlaceholder />
                        }
                    </ScrollView>
                </View>
            </View>
        </>
        )
    }

}

const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 1,

    },
    categoryImageWrapStyle: {
        width: 55.0,
        height: 55.0,
        borderRadius: 15.0,
        backgroundColor: Colors.whiteColor,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        borderWidth: 1.5,
        borderColor: '#ececec',
    },


    searchIcon: {
        position: 'absolute', // Use absolute positioning for the icon
        top: 22, // Adjust this value to vertically center the icon
        right: 25, // Adjust this value to horizontally center the icon 
    },
    keywordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    keywordText: {
        fontSize: 14,
        marginLeft: 8, // Spacing between the arrow and keyword text
    },
});
export default SearchScreen;
