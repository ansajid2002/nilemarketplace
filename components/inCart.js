import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { AdminUrl } from '../constant';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Link } from '@react-navigation/native';
import { debounce } from 'lodash';
import { productUrl } from '../constant'
const InCart = ({ cartItems, navigation }) => {
    const { t } = useTranslation()
    return (
        <View style={styles.container}>
            <View className="flex-row justify-between items-center mb-5">
                <Text style={styles.heading} > {cartItems.length} {t("items in Your Cart!")} 🛍</Text>
                <TouchableOpacity className="bg-blue-700 px-2 py-[6px]" onPress={() => navigation.navigate('Cart')}>
                    <Text className="text-white">{t("Go To Cart")}</Text>
                </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productList}>
                {cartItems.map((product, i) => (
                    <TouchableOpacity key={i} onPress={debounce(() => navigation.push('ProductDetail', product), 100)}>
                        <View key={product.uniquepid} style={styles.productItem} className="border p-2 border-gray-300">
                            <Image
                                resizeMode='contain'
                                defaultSource={"../assets/noimage.jpg"}
                                source={
                                    !product.images
                                        ? require('../assets/noimage.jpg')
                                        : { uri: `${productUrl}/${product.images?.[0]}` }}
                                style={styles.productImage} />
                            <Text numberOfLines={1} style={styles.productTitle}>{product.ad_title}</Text>
                            <Text style={styles.productPrice}>{t("Price: ")}${product.sellingprice}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: 'white'
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    productList: {
        flexDirection: 'row',
    },
    productItem: {
        marginRight: 10,
    },
    productImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    productTitle: {
        fontSize: 16,
        marginTop: 8,
        width: 100
    },
    productPrice: {
        fontSize: 14,
        color: 'green',
    },
    productStock: {
        fontSize: 14,
        color: 'gray',
    },
});

export default InCart;
