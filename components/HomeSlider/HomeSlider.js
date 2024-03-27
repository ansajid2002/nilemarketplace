import { Animated, ScrollView, StyleSheet, Text, View, TextInput } from 'react-native';
import React, { useRef, useState } from 'react';
import CategoryList from './CategoryList';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native';

const HomeSlider = () => {
    const [index, setIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const { categoriesData } = useSelector((store) => store.categories);
    const productscategories = categoriesData.filter((singleservice) => singleservice.category_type === "Products");

    const handleOnScroll = event => {
        Animated.event(
            [
                {
                    nativeEvent: {
                        contentOffset: {
                            x: scrollX,
                        },
                    },
                },
            ],
            {
                useNativeDriver: false,
            },
        )(event);
    };

    const handleOnViewableItemsChanged = useRef(({ viewableItems }) => {
        setIndex(viewableItems[0].index);
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const productscategoriesWithAll = [{ category_name: 'All' }, ...productscategories];

    return (
        <SafeAreaView style={{ flex: 1, marginTop: 20, backgroundColor: "#fff" }}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                />
            </View>
            <View style={styles.categoryContainer}>
                <CategoryList data={productscategoriesWithAll} scrollX={scrollX} index={index} />
            </View>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleOnScroll}
                viewabilityConfig={viewabilityConfig}
                nestedScrollEnabled
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: 'white',
        borderRadius: 50,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'black',
    },
    categoryContainer: {
        marginTop: 5,
    },
});

export default HomeSlider;
