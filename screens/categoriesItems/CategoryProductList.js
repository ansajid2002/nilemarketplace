import React, { useEffect, useState } from 'react';
import { Text, Dimensions, FlatList, SafeAreaView, Image, View, ActivityIndicator, RefreshControl } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import { AdminUrl, HeaderBar } from '../../constant';

import renderItemOrSkeleton from '../../components/ProductList2';
import { ProductSkeleton } from '../../components/Skeleton';
import FilterComponent from './FilterComponent';
import { useTranslation } from 'react-i18next';

const CategoryProductList = ({ route, navigation }) => {
    const [index, setIndex] = useState(0);
    const [page, setPage] = useState(1); // Add state for tracking page number
    const { categoryId, categoryName, subcategory_name, featureddatatoshow } = route.params;
    const [subcategoriesToShow, setSubcategoriesToShow] = useState(featureddatatoshow);
    const [loading, setLoading] = useState(true);
    const [Products, setProducts] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    // const [hasmore, sethasmore] = useState(true);
    const [currenctCategory, setCurrentCategory] = useState(''); // Flag to track initial index set
    const [sortValue, setsortValue] = useState(''); // Flag to track initial index set
    const [refreshing, setRefreshing] = useState(false);
    const {t} = useTranslation()

    const [routes, setRoutes] = useState([]);

    const renderScene = ({ route }) => {
        const sceneIndex = parseInt(route.key);
        if (sceneIndex !== index) {
            // Return an empty view for inactive scenes
            return <FlatList
                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={() => <ProductSkeleton />}
                numColumns={2}
            />;
        }

        if (Products?.length === 0) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../assets/no-results.png')} className="w-48 h-48" />
                    <Text style={{ fontSize: 18, color: 'gray', fontStyle: 'italic' }}>
                        {t("No Product Found...")}
                    </Text>
                </View>
            );
        } else {
            return (
                subcategoriesToShow && <FlatList
                    data={Products}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItemOrSkeleton}
                    numColumns={2}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    onEndReached={Products?.length > 9 && handleLoadMore}
                    onEndReachedThreshold={0.6}
                    ListFooterComponent={Products?.length > 9 && loadingMore && (
                        <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                            <ActivityIndicator size="small" color="blue" />
                        </View>
                    )}
                />
            );
        }
    };

    const renderTabBar = (props) => {
        const { navigationState } = props;
        const isInitialTabFocused = navigationState.index === index;

        if (!subcategoriesToShow && !featureddatatoshow) return
        return (
            <>
                <HeaderBar goback={true} title={t(`${categoryName ? categoryName : "sbcategory"}`)} navigation={navigation} />

                <TabBar
                    {...props}
                    scrollEnabled
                    indicatorStyle={{ backgroundColor: 'transparent' }}
                    style={{ backgroundColor: 'white' }}
                    tabStyle={{ width: 110 }}
                    renderLabel={({ route }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', height: 100 }} className="my-2">
                            {loading ? (
                                <ActivityIndicator size="small" color="blue" />
                            ) : (
                                <>
                                    {subcategoriesToShow && subcategoriesToShow[parseInt(route.key)] && subcategoriesToShow[parseInt(route.key)].subcategory_name === 'All' ? (
                                        <View
                                            className={` overflow-hidden border ${(isInitialTabFocused && route.key === index.toString()) ? 'border-2 border-black' : 'border-1 border-gray-300'}  rounded-full`}
                                        >
                                            <Image
                                                source={require('../../assets/images/allproducts.png')}
                                                style={{ resizeMode: 'cover', width: 75, height: 75 }}
                                            />
                                        </View>
                                    ) : (
                                        subcategoriesToShow && subcategoriesToShow[parseInt(route.key)] && (
                                            <View
                                                className={`border overflow-hidden ${(isInitialTabFocused && route.key === index.toString()) ? 'border-2 border-black' : 'border-1 border-gray-300'}  rounded-full `}
                                            >
                                                <Image
                                                    source={{ uri: `${AdminUrl}/uploads/SubcategoryImages/${subcategoriesToShow[parseInt(route.key)].subcategory_image_url}` }}
                                                    
                                                    style={{ resizeMode: 'cover', width: 80, height: 80 }}
                                                />
                                            </View>
                                        )
                                    )}

                                    {subcategoriesToShow && subcategoriesToShow[parseInt(route.key)] && (
                                        <Text
                                            style={{
                                                color: ((isInitialTabFocused && route.key === index.toString())) ? 'black' : 'black',
                                                textAlign: 'center',
                                                marginTop: 5,
                                            }}
                                            className={`  ${isInitialTabFocused && route.key === index.toString() ? 'font-bold' : ''}`}
                                            numberOfLines={2}
                                            ellipsizeMode="tail"

                                        > {t(subcategoriesToShow[parseInt(route.key)].subcategory_name)}</Text>
                                    )}
                                </>
                            )}
                        </View>
                    )}
                />
            </>
        );
    };


    const getSubcatDataByCatId = async () => {
        try {
            const response = await fetch(`${AdminUrl}/api/getSubcategorygroupByCatId?catId=${categoryId}&category_name=${categoryName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.subcategories) {
                const allItem = {
                    subcategory_id: -0,
                    subcategory_name: 'All',
                    subcategory_description: 'All products',
                    subcategory_image_url: require('../../assets/images/allproducts.png'),
                    parent_category_id: categoryId,
                    created_at: '',
                    updated_at: '',
                    isfeatured: null,
                };

                const subcategoriesWithAll = [allItem, ...data.subcategories];
                setSubcategoriesToShow(subcategoriesWithAll);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false); // Set loading to false once data is loaded or an error occurs
        }
    };

    const getProductBySubcatName = async (subcat_name, pageNumber, sortMethod, selected) => {
        try {
            if (!subcat_name) return
            const response = await fetch(`${AdminUrl}/api/getProductBySubcategories?subcat=${subcat_name?.replace(/[^\w\s]/g, "")
                .replace(/\s/g, "")}&pageNumber=${pageNumber}&pageSize=10&selected=${selected}&currency=USD&sortMethod=${sortMethod}&category=${categoryName?.replace(/[^\w\s]/g, "")
                    .replace(/\s/g, "")}`);


            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (pageNumber === 1) {
                // If it's the first page, set the products directly
                setProducts(data?.AllProducts || []);
            } else if (data?.AllProducts.length > 0) {
                // If it's not the first page and there are products, append them to the existing list
                setProducts(prevProducts => [...prevProducts, ...data?.AllProducts]);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoadingMore(false); // Set loadingMore to false once data is loaded or an error occurs
        }
    };

    const handleLoadMore = () => {
        // If not already loading more and there are more products to load
        if (!loadingMore && Products?.length > 0) {
            setLoadingMore(true);
            setPage(prevPage => prevPage + 1); // Increment the page number
            getProductBySubcatName(subcategory_name, page + 1, sortValue, []); // Load more products
        }
    };

    useEffect(() => {
        // Find subcategory_name from featureddatatoshow or subcategoriesToShow based on the current index
        const currentSubcategoryData = subcategoriesToShow
            ? subcategoriesToShow[index]?.subcategory_name
            : null;

        setCurrentCategory(currentSubcategoryData)
        // Reset Products and Page when the index changes
        setProducts(null);
        setPage(1);

        // Set the found subcategory_name in the state
        getProductBySubcatName(currentSubcategoryData, 1, '', []);
    }, [index, subcategoriesToShow]);


    useEffect(() => {
        if (!subcategoriesToShow) {
            getSubcatDataByCatId();
        } else if (featureddatatoshow) {
            const indexData = featureddatatoshow.findIndex(subcategory => subcategory.subcategory_name === subcategory_name);
            setIndex(indexData);
            // If featureddatatoshow is not available, use featureddatatoshow data for routes
            setRoutes(featureddatatoshow.map((_, i) => ({ key: i.toString() })));
            setLoading(false); // Set loading to false once data is loaded
        } else if (subcategoriesToShow) {
            const indexData = subcategoriesToShow.findIndex(subcategory => subcategory.subcategory_name === subcategory_name);
            setIndex(indexData);
            // If subcategoriesToShow is not available, use subcategoriesToShow data for routes
            setRoutes(subcategoriesToShow.map((_, i) => ({ key: i.toString() })));

            setLoading(false); // Set loading to false once data is loaded
        }
    }, [subcategoriesToShow, featureddatatoshow, subcategory_name]);


    const handleSort = (value) => {
        setPage(1)
        setsortValue(value)
        getProductBySubcatName(currenctCategory, 1, value, []);
    }

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1)
        // Fetch data or perform actions you want on refresh
        getProductBySubcatName(currenctCategory, 1, sortValue, [])
        // After fetching data or performing actions, set refreshing to false
        setRefreshing(false);
    };

    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')       // Replace spaces with -
            .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
            .replace(/\-\-+/g, '-')     // Replace multiple - with single -
            .replace(/^-+/, '')         // Trim - from start of text
            .replace(/-+$/, '');        // Trim - from end of text
    };

    const getSelected = (selectedValues) => {
        const slugs = selectedValues.map(value => slugify(value));
        console.log(slugs, 'slugs'); // Log the array of slugs for debugging
        getProductBySubcatName(currenctCategory, 1, '', slugs);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <TabView
                lazy
                navigationState={{ index, routes }}
                renderScene={renderScene}
                renderTabBar={renderTabBar}
                onIndexChange={setIndex}
                shouldRasterizeIOS={true}
                initialLayout={{ width: Dimensions.get('window').width }}
                style={{ flex: 1 }}
            />
            <FilterComponent getSort={handleSort} subcategoriesToShow={subcategoriesToShow} selectedTab={getSelected} />
        </SafeAreaView>
    );
};

export default CategoryProductList;
