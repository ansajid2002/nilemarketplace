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
} from "react-native";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { Colors, Sizes } from "../../constants/styles";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { AdminUrl } from "../../constant";
import Animated, { useSharedValue } from 'react-native-reanimated';
import { CategorysidebarPlaceholder } from "../../components/Skeleton";

const SearchScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { categoriesData } = useSelector((store) => store.categories);
    const { searchfocus } = useSelector((store) => store.bottomtabbar);
    const { currencyCode } = useSelector((store) => store.selectedCurrency);
    const [fadeInOpacity] = useState(new Animated.Value(0));
    const width = useSharedValue(200);

    const fadeIn = () => {
        Animated.timing(fadeInOpacity, {
            toValue: 1,
            duration: 1000, // Adjust the duration as needed
            useNativeDriver: true,
        }).start();
    };

    const fadeOut = () => {
        Animated.timing(fadeInOpacity, {
            toValue: 0,
            duration: 1000, // Adjust the duration as needed
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        // You can call fadeIn or fadeOut in response to certain events or triggers.
        fadeIn();

        // For example, you can automatically fade out after a certain delay:
        const fadeOutTimeout = setTimeout(() => {
            fadeOut();
        }, 3000); // 3000 milliseconds (adjust as needed)

        // Clear the timeout to avoid memory leaks when the component unmounts
        return () => clearTimeout(fadeOutTimeout);
    }, []);

    const productsData = useMemo(
        () => categoriesData.filter((singleservice) => singleservice.category_type === "Products"),
        [categoriesData]
    );
    const featuredData = useMemo(
        () =>
            productsData.flatMap((single) =>
                single.subcategories.filter((s) => s.isfeatured == true)
            ),
        [productsData]
    );


    const { t } = useTranslation();
    const [selectedcategory, setSelectedcategory] = useState(t("Featured"));
    const [subcategoriesdatatoshow, setSubcategoriesdatatoshow] = useState();

    const handlesubcategoriesdata = useCallback(
        (selectedcategory) => {
            setSelectedcategory(selectedcategory);
            const selectedProduct = productsData.find(
                (single) => single.category_name === selectedcategory
            );
            if (selectedProduct) {
                setSubcategoriesdatatoshow(selectedProduct.subcategories);
            }
        },
        [productsData]
    );

    const handlecategorytosent = useCallback(
        (parent_category_id, subcategory_name) => {
            const selectedProduct = productsData.find(
                (single) => single.category_id === parent_category_id
            );
            if (selectedProduct) {
                navigation.push("CategoriesItems", { item: selectedProduct, subcategory_name });
            }
        },
        [productsData, navigation]
    );


    function showcategories() {
        const renderitem = ({ item }) => {
            return (
                <TouchableOpacity onPress={debounce(() => handlesubcategoriesdata(item.category_name), 500)}
                    className={`pb-2.5 pt-1.5 ${selectedcategory === item.category_name ? "border-[#ff7701] border-l-4 bg-white" : "border-b border-gray-300"}`}>
                    <Animated.View style={{
                        width,
                        height: 200,
                        backgroundColor: 'violet',
                    }} className="items-center">
                        <Animated.Image
                            source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                            style={{ width, height: 150.0, resizeMode: 'cover' }}
                            className=""
                        />
                        <Text className="text-[12px] px-2 pt-2 pb-2  text-[#1b1b52]  font-medium">{t(`${item.category_name}`)}</Text>
                    </Animated.View>
                </TouchableOpacity>
            );
        };

        return (<>
            <TouchableWithoutFeedback >
                <Animated.View className="flex-row flex-1">
                    <View className="w-[25%]  bg-[#fb76011e] mr-2 ">
                        <FlatList showsVerticalScrollIndicator={false}
                            data={productsData}
                            renderItem={renderitem}
                            keyExtractor={item => item.category_id}
                            ListHeaderComponent={() => (
                                <TouchableOpacity onPress={debounce(() => setSelectedcategory(t("Featured")), 500)}
                                    className={`pb-2.5 pt-1.5 ${selectedcategory === t("Featured") ? "border-[#ff7701] border-l-4 bg-white" : "border-b border-gray-300"}`}>
                                    <View className=" items-center">
                                        <Image
                                            source={require('../../assets/images/allproducts.png')}
                                            style={{ width: 50.0, height: 50.0, resizeMode: 'cover' }}
                                            className=""
                                        />
                                        <Text className="text-[12px] px-2 pt-2 pb-2  text-[#1b1b52]" >{t('Featured')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    <View className="w-[70%]  bg-[white]">
                        <Text className="text-center mb-2 font-medium text-lg">{t("Shop By Category")}</Text>
                        <ScrollView className="flex-1 ">
                            <View className="flex-row flex-wrap mb-4">
                                {
                                    (selectedcategory === t("Featured")) ?
                                        featuredData?.map((single) => {

                                            const { subcategory_id, subcategory_name, subcategory_image_url, parent_category_id } = single
                                            return (
                                                <TouchableOpacity className=" items-center my-3 mx-2 " key={subcategory_id}
                                                    onPress={debounce(() => handlecategorytosent(parent_category_id, subcategory_name))}
                                                >
                                                    <Animated.View style={{ width }} className="w-[60px] h-[60px] rounded-lg border border-gray-300">
                                                        <Image
                                                            source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${subcategory_image_url}` }}
                                                            style={{ resizeMode: 'contain' }}
                                                            className=" w-full h-full rounded-lg"
                                                        />

                                                    </Animated.View>
                                                    <Text className="w-[75px] text-[11px] text-center mt-1.5 " numberOfLines={2}>{t(`${subcategory_name}`)}


                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        }) :
                                        subcategoriesdatatoshow?.map((single) => {


                                            const { subcategory_id, subcategory_name, subcategory_image_url, parent_category_id } = single
                                            return (
                                                <TouchableOpacity className=" items-center mx-2 my-3" key={subcategory_id}
                                                    onPress={debounce(() => handlecategorytosent(parent_category_id, subcategory_name))}>
                                                    <View className="w-[60px] h-[60px] rounded-lg border border-gray-300">
                                                        <Image
                                                            source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${subcategory_image_url}` }}
                                                            style={{ resizeMode: 'contain' }}
                                                            className=" w-full h-full rounded-lg"
                                                        />

                                                    </View>
                                                    <Text className="w-[75px] text-[11px] text-center mt-1.5 " numberOfLines={2}>{t(`${subcategory_name}`)}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                }
                            </View>
                        </ScrollView>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>

        </>
        )
    }

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

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                {showcategories()}
            </View>
        </SafeAreaView>
    )

    function showcategories() {
        const renderitem = ({ item }) => {
            return (
                <TouchableOpacity onPress={debounce(() => handlesubcategoriesdata(item.category_name), 500)}
                    className={`pb-2.5 pt-1.5 ${selectedcategory === item.category_name ? "border-[#ff7701] border-l-4 bg-white" : "border-b border-orange-300"}`}>
                    <View className=" items-center">
                        <Image
                            source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                            style={{ width: 70.0, height: 60.0, resizeMode: 'contain' }}
                            className=""
                        />
                        <Text className="text-[11px] px-2 pt-2 pb-1  text-[#1b1b52] text-center font-medium">{t(`${item.category_name}`)}</Text>
                    </View>
                </TouchableOpacity>
            );
        };



        return (<>
            <TouchableWithoutFeedback >
                <View className="flex-row flex-1">
                    <View className="w-[25%]  bg-[#ffc363]/50 mr-2 ">
                        {
                            productsData ? 
                        <FlatList showsVerticalScrollIndicator={false}
                            data={productsData}
                            renderItem={renderitem}
                            keyExtractor={item => item.category_id}
                            ListHeaderComponent={() => (
                                <TouchableOpacity onPress={debounce(() => setSelectedcategory("Featured"), 500)}
                                    className={`pb-2.5 pt-1.5 ${selectedcategory === t("Featured") ? "border-[#ff7701] border-l-4 bg-white" : "border-b border-orange-300"}`}>
                                    <View className=" items-center">
                                        <Image
                                            source={require('../../assets/images/allproducts.png')}
                                            style={{ width: 50.0, height: 50.0, resizeMode: 'contain' }}
                                            className=""
                                        />
                                        <Text className="text-[12px] px-2 pt-2 pb-1 text-[#1b1b52]" >{t('Featured')}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        /> :
                        <CategorysidebarPlaceholder/>
                                                }

                    </View>
                    <View className="w-[70%]  bg-[white]">
                        <Text className="text-center mb-2 font-medium text-lg">{t("Shop By Category")}</Text>
                        <ScrollView className="flex-1 ">
                        {
                            productsData ? 
                        
                            <View className="flex-row flex-wrap mb-4">
                                {
                                    (selectedcategory === t("Featured")) ?
                                        featuredData?.map((single) => {

                                            const { subcategory_id, subcategory_name, subcategory_image_url, parent_category_id } = single
                                            return (
                                                <TouchableOpacity className=" items-center my-3 mx-2 " key={subcategory_id}
                                                    onPress={debounce(() => handlecategorytosent(parent_category_id, subcategory_name))}

                                                >
                                                    <View className="w-[60px] h-[60px] rounded-lg border border-gray-300">
                                                        <Image
                                                            source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${subcategory_image_url}` }}
                                                            style={{ resizeMode: 'contain' }}
                                                            className=" w-full h-full rounded-lg"
                                                        />

                                                    </View>
                                                    <Text className="w-[75px] text-[11px] text-center mt-1.5 " numberOfLines={2}>{t(`${subcategory_name}`)}


                                                    </Text>
                                                </TouchableOpacity>
                                            )
                                        }) :
                                        subcategoriesdatatoshow?.map((single) => {


                                            const { subcategory_id, subcategory_name, subcategory_image_url, parent_category_id } = single
                                            return (
                                                <TouchableOpacity className=" items-center mx-2 my-3" key={subcategory_id}
                                                    onPress={debounce(() => handlecategorytosent(parent_category_id, subcategory_name))}>
                                                    <View className="w-[60px] h-[60px] rounded-lg border border-gray-300">
                                                        <Image
                                                            source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${subcategory_image_url}` }}
                                                            style={{ resizeMode: 'contain' }}
                                                            className=" w-full h-full rounded-lg"
                                                        />

                                                    </View>
                                                    <Text className="w-[75px] text-[11px] text-center mt-1.5 " numberOfLines={2}>{t(`${subcategory_name}`)}</Text>
                                                </TouchableOpacity>
                                            )
                                        })
                                }
                            </View>
                            : <CategorysidebarPlaceholder/>
                        }
                        </ScrollView>
                    </View>
                </View>
            </TouchableWithoutFeedback>

        </>
        )
    }

    function header() {
        return (

            <View
                className="px-2  mb-4"
                style={{
                    // backgroundColor: "#00008b",
                    // padding: 10,
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
