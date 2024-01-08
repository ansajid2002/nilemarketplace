import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Image } from 'react-native';
import { Colors, Fonts, Sizes } from '../../constants/styles';
import { useTranslation } from 'react-i18next';
import DisplayProducts from './DisplayProducts';
import { debounce } from "lodash";
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AdminUrl } from '../../constant';
const { width } = Dimensions.get('screen');

const HomeSlideItem = ({ item }) => {
    const { t } = useTranslation();
    const navigation = useNavigation()
    const [showAll, setShowAll] = useState(false);

    if (!item) {
        return null;
    }

    const modifiedSubcategories = [
        {
            subcategory_id: 'all',
            subcategory_name: 'All',
            subcategory_image_url: 'URL_HERE',
        },
        ...(item.subcategories || []),
    ];

    const displayedSubcategories = showAll
        ? modifiedSubcategories
        : modifiedSubcategories.slice(0, 4);

    const { categoriesData } = useSelector((store) => store.categories)

    const productscategories = categoriesData.filter((singleservice) => singleservice.category_type === "Products")

    const productssubcategories = productscategories?.map((single) => {
        return single.subcategories

    }).flat()

    function browseCategoriesInfo() {

        function chunkArray(arr, size) {
            const chunkedArray = [];
            for (let i = 0; i < arr.length; i += size) {
                chunkedArray.push(arr.slice(i, i + size));
            }
            return chunkedArray;
        }

        return (
            <View style={{ marginBottom: Sizes.fixPadding, marginTop: Sizes.fixPadding * 2.0, marginHorizontal: Sizes.fixPadding * 1.0, }}>
                <View className="flex flex-row justify-between mt-2 mb-4">
                    <Text style={{ marginBottom: Sizes.fixPadding, ...Fonts.blackColor16SemiBold }}>
                        {t('Browse Categories')}
                    </Text>
                    <Text onPress={debounce(() => navigation.navigate("Pick Interest"), 500)}>{t("Pick interest")}</Text>
                    <Text style={{ marginBottom: Sizes.fixPadding, ...Fonts.blackColor16SemiBold }} onPress={debounce(() => navigation.push('productsList'), 500)}>{t('View All')}</Text>
                </View>

                <ScrollView horizontal className="grid grid-rows-3" showsHorizontalScrollIndicator={false}>
                    {chunkArray(productssubcategories, 3)?.map((rowItems, rowIndex) => (
                        <View key={rowIndex} className="grid grid-cols-2">
                            {rowItems?.map((item, itemIndex) => {

                                const { subcategory_name } = item

                                return (

                                    <TouchableOpacity key={itemIndex} className="mr-1.5  w-[100px] h-[100px] my-2"
                                        activeOpacity={0.9}
                                        onPress={debounce(() => navigation.push('CategoriesItems', { item: productscategories.find((single) => single.category_id === item.parent_category_id), subcategory_name }), 500)}
                                        style={styles.categoryWrapStyle}
                                    >
                                        <View style={styles.categoryImageWrapStyle}>
                                            <Image
                                                resizeMode='contain'
                                                source={{ uri: item.subcategory_image_url }}
                                                style={{ width: 50.0, height: 50.0, resizeMode: 'contain' }}
                                            />

                                        </View>
                                        <Text numberOfLines={2} className="text-center text-[12px] mt-2 px-2">
                                            {t(`${item.subcategory_name}`)}
                                            {item.subcategory_image_url}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ))}
                </ScrollView>

                <TouchableOpacity className="mt-2"
                    activeOpacity={0.9}
                    onPress={debounce(() => navigation.push('servicesList'), 500)}
                    style={styles.categoryWrapStyle}
                >
                    <View style={styles.categoryImageWrapStyle}>
                        <Image
                            resizeMode='contain'
                            source={require("../../assets/npmImages/productcategories/services.png")}
                            style={{ width: 30.0, height: 30.0, resizeMode: 'contain' }}
                        />
                    </View>
                    <Text numberOfLines={2} style={{ marginTop: Sizes.fixPadding - 5.0, ...Fonts.blackColor12Medium }}>
                        {t('SERVICES')}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View className="flex-1">

            <ScrollView horizontal nestedScrollEnabled={true} className="flex-row">

                {(
                    modifiedSubcategories.length > 0 && (
                        <View>
                            {modifiedSubcategories.map((subcat, index) => (
                                <TouchableOpacity
                                    key={subcat.subcategory_id}
                                    activeOpacity={0.9}
                                    style={styles.categoryWrapStyle}
                                >
                                    <View style={styles.categoryImageWrapStyle}>
                                        <Image
                                            resizeMode='contain'
                                            source={{ uri: subcat.subcategory_image_url }}
                                            style={{ width: 50.0, height: 50.0, resizeMode: 'contain' }}
                                            className="rounded-full"
                                        />
                                    </View>
                                    <Text numberOfLines={2} style={{ fontSize: 12, textAlign: 'center', marginTop: 5 }}>
                                        {t(`${subcat.subcategory_name}`)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )
                )}

            </ScrollView>
        </View>
        // </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        width,
    },
    scrollContainer: {
        flexDirection: 'row',
        padding: Sizes.fixPadding,
    },
    categoryImageWrapStyle: {
        width: 60.0,
        height: 60.0,
        borderRadius: 35.0,
        backgroundColor: Colors.whiteColor,
        elevation: 5,
        borderWidth: 1.5,
        borderColor: '#ececec',
    },
    categoryImage: {
        width: 50.0,
        height: 50.0,
        resizeMode: 'contain',
    },
    categoryWrapStyle: {
        width: width / 4.0 - 10.0,
        marginBottom: Sizes.fixPadding,
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
    },
    relativeContainer: {
        position: 'relative',
        top: 5,
    },
});

export default HomeSlideItem;
