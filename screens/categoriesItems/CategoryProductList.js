import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { AdminUrl, HeaderBar } from '../../constant';
import { t } from 'i18next';
import { Image } from 'react-native';
import { SubcategoryPlaceholder } from '../../components/Skeleton';
import renderItemOrSkeleton from '../../components/ProductList2';
import { FlatList } from 'react-native';
import { ActivityIndicator } from 'react-native';

const CategoryProductList = ({ route, navigation }) => {
    const scrollRef = useRef(null);
    const itemsRef = useRef([]);
    const [subcategoriesToShow, setSubcategoriesToShow] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [productsDataBackend, setProducts] = useState(null)
    const [filterProductsBACKEND, setFilteredProducts] = useState(null)
    const [hasMore, setHasMore] = useState(false)
    const { categoryId, categoryName, subcategory_name, featureddatatoshow } = route.params
    const [pageloading, setPageloading] = useState(true);



    const selectCategory = (index, subcat_name) => {
        const selected = itemsRef.current[index];
        setActiveIndex(index);
        selected?.measure((x) => {
            scrollRef.current?.scrollTo({ x: x - 16, y: 0, animated: true });
        });
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // onCategoryChanged(categories[index].name);
        getProductBySubcatName(subcat_name)
    };

    const getProductBySubcatName = async (subcat_name) => {
        // setHasMore(true);
        if (subcat_name !== subcategory_name) {
            setFilteredProducts(null)
            setProducts(null)
        }

        try {
            const response = await fetch(`${AdminUrl}/api/getProductBySubcategories?subcat=${subcat_name?.replace(/[^\w\s]/g, "")
                .replace(/\s/g, "")}&pageNumber=${page}&pageSize=10&currency=USD&category=${categoryName?.replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "")}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data?.AllProducts);
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
                setHasMore(true);
            } else {
                console.log("ENTERED ELSEeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
                console.log(filterProductsBACKEND, productsDataBackend, "timer start");
                !filterProductsBACKEND && setFilteredProducts([])
                !productsDataBackend && setProducts([])
                filterProductsBACKEND?.length === 0 && setFilteredProducts([])
                productsDataBackend?.length === 0 && setProducts([])
                console.log(filterProductsBACKEND, productsDataBackend, "timer end");
                setHasMore(false); // If response is an empty array, set hasMore to false
            }


        } catch (error) {
            console.error('Error:', error);
        } finally {
            setPageloading(false);
        }
    }

    useEffect(() => {
        getProductBySubcatName(subcategory_name)
    }, [page])

    const getSubcatDataByCatId = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getSubcategorygroupByCatId?catId=${categoryId}&category_name=${categoryName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.subcategories) {
                // Add the "All" item to the beginning of the subcategories array
                const allItem = {
                    subcategory_id: -0,  // You can use a unique ID for the "All" item
                    subcategory_name: 'All',
                    subcategory_description: 'All products',
                    subcategory_image_url: require('../../assets/images/allproducts.png'), // Replace with the actual path to your image
                    parent_category_id: categoryId, // Set it to the appropriate category ID
                    created_at: '', // Set these values as needed
                    updated_at: '',
                    isfeatured: null,
                };

                const subcategoriesWithAll = [allItem, ...data.subcategories];
                setSubcategoriesToShow(subcategoriesWithAll);

                const indexToSetActive = subcategoriesWithAll.findIndex(item => item.subcategory_name?.trim() === subcategory_name?.trim());

                if (indexToSetActive !== -1) {
                    // Set the active index
                    setActiveIndex(indexToSetActive);
                }
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>



            <View>
                {/* <ProductListing title={selectedsubcategory} productList={filterProductsBACKEND} /> */}
                <FlatList
                    data={filterProductsBACKEND}
                    renderItem={filterProductsBACKEND ? renderItemOrSkeleton : console.log('hello')}
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
                            <HeaderBar goback={true} title={t(`${categoryName ? categoryName : "sbcategory"}`)} navigation={navigation} />

                            <View style={styles.container}>
                                <ScrollView
                                    horizontal
                                    ref={scrollRef}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{
                                        alignItems: 'center',
                                        gap: 20,
                                        paddingHorizontal: 16,
                                    }}>

                                    {
                                        featureddatatoshow && featureddatatoshow.map((item, index) => (
                                            <TouchableOpacity
                                                ref={(el) => (itemsRef.current[index] = el)}
                                                key={index}
                                                style={activeIndex === index ? styles.categoriesBtnActive : styles.categoriesBtn}
                                                onPress={() => {

                                                    selectCategory(index, item.subcategory_name)
                                                }}>

                                                <View style={{ height: 110 }}>
                                                    <View className={`w-24 h-24 shadow-sm rounded-full mx-auto duration-300 overflow-hidden`}>
                                                        {item.subcategory_image_url ? (
                                                            <Image
                                                                source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${item.subcategory_image_url}` }}
                                                                style={{ resizeMode: 'contain', width: '100%', height: '100%' }}
                                                            />
                                                        ) : (
                                                            <Image
                                                                source={require('../../assets/noimage.jpg')}
                                                                style={{ resizeMode: 'contain', width: '100%', height: '100%' }}
                                                            />
                                                        )}
                                                    </View>
                                                    <Text className="text-center" style={activeIndex === index ? styles.categoryTextActive : styles.categoryText}>
                                                        {item.subcategory_name}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    }

                                    {
                                        subcategoriesToShow && subcategoriesToShow.map((item, index) => (
                                            <TouchableOpacity
                                                ref={(el) => (itemsRef.current[index] = el)}
                                                key={index}
                                                style={activeIndex === index ? styles.categoriesBtnActive : styles.categoriesBtn}
                                                onPress={() => selectCategory(index, item.subcategory_name)}
                                            >
                                                <View className={`w-20 h-20 shadow-sm rounded-full mx-auto duration-300 overflow-hidden`}>
                                                    {item.subcategory_name === 'All' ? (
                                                        <Image
                                                            source={require('../../assets/images/allproducts.png')} // Replace with the actual path to your "All" image
                                                            style={{ resizeMode: 'contain', width: '100%', height: '100%' }}
                                                        />
                                                    ) : (
                                                        <Image
                                                            source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${item.subcategory_image_url}` }}
                                                            style={{ resizeMode: 'contain', width: '100%', height: '100%' }}
                                                        />
                                                    )}
                                                </View>
                                                <Text className="text-center" style={activeIndex === index ? styles.categoryTextActive : styles.categoryText}>
                                                    {item.subcategory_name}
                                                </Text>

                                            </TouchableOpacity>
                                        ))
                                    }

                                </ScrollView>
                            </View>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        elevation: 2,
        // shadowColor: '#000',
        // shadowOpacity: 0.1,
        // shadowRadius: 6,
        // shadowOffset: {
        //     width: 1,
        //     height: 10,
        // },
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    searchBtn: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        alignItems: 'center',
        width: 280,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#c2c2c2',
        borderRadius: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: {
            width: 1,
            height: 1,
        },
    },
    filterBtn: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#A2A0A2',
        borderRadius: 24,
    },
    categoryText: {
        fontSize: 14,
        color: "#323232",
    },
    categoryTextActive: {
        fontSize: 14,
        color: '#323232',
    },
    categoriesBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 8,
    },
    categoriesBtnActive: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: '#000',
        borderBottomWidth: 2,
        paddingBottom: 8,
    },
});

export default CategoryProductList;