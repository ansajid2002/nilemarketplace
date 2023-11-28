import React, { useState } from "react";
import { SafeAreaView, View, Dimensions, ScrollView, FlatList, TouchableOpacity, StatusBar, Image, StyleSheet, Text } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from "react-redux";
import Modal from 'react-native-modal';
import { updateMyads } from "../../store/slices/myAdsListSlice";
import { clearAdsList } from "../../store/slices/myAdsSlice"
import { debounce } from "lodash";

const { width } = Dimensions.get('window');

const ReviewItemScreen = ({ navigation }) => {
    const { myAdsList } = useSelector((store) => store.adsList)
    const dispatch = useDispatch()
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const toggleModal = (imageUri) => {
        setSelectedImage(imageUri);
        setModalVisible(!isModalVisible);
    }


    const { adsList } = useSelector((store) => store.adPosting)

    const currenciesSymbol = (single) => {
        if (single === "USD") {
            return "$"
        }
        else if (single === "ETB") {
            return "Br"
        }
        else if (single === "SOS") {
            return "S"
        }
        else if (single === "KES") {
            return "Ksh"
        }
        else {
            return "€"
        }
    }

    const handlepublish = () => {
        dispatch(updateMyads(adsList))
        dispatch(clearAdsList())
        navigation.push('AdSuccessfullyPost')

    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                <ScrollView showsVerticalScrollIndicator={false}>
                    {itemImages()}
                    {itemDetail(adsList)}
                    {divider()}
                    {descriptionInfo()}
                    {divider()}
                    {publishButton()}
                    {editButton()}
                </ScrollView>
            </View>
        </SafeAreaView>
    )

    function editButton() {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={debounce(() => navigation.pop(), 500)}
                style={styles.editButtonStyle}
            >
                <Text style={{ ...Fonts.primaryColor16Bold }}>
                    EDIT
                </Text>
            </TouchableOpacity>
        )
    }

    function publishButton() {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={debounce(() => handlepublish(), 500)}
                style={styles.publishButtonStyle}
            >
                <Text style={{ ...Fonts.whiteColor16Bold }}>
                    PUBLISH
                </Text>
            </TouchableOpacity>
        )
    }

    function descriptionInfo() {
        return (
            <View style={{ marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <Text className="tracking-wider font-medium text-[20px]" style={{ marginBottom: Sizes.fixPadding }}>
                    Details
                </Text>
                <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Category : </Text><Text className="text-[15px]">{adsList.category}</Text>
                </View>
                <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Sub-Category : </Text><Text className="text-[15px]">{adsList.subcategory}</Text>
                </View>



                {adsList.condition && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px]  font-medium">Condition : </Text><Text className="text-[15px]">{adsList.condition}</Text></View>}
                {adsList.typeofsupplies && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Type : </Text><Text className="text-[15px]">{adsList.typeofsupplies}</Text></View>}
                {adsList.typeofsupplies && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Type : </Text><Text className="text-[15px]">{adsList.typeofsupplies}</Text></View>}
                {adsList.product && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Type : </Text><Text className="text-[15px]">{adsList.product}</Text></View>}
                {adsList.typeofcycle && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Type of Cycle: </Text><Text className="text-[15px]">{adsList.typeofcycle}</Text></View>}
                {adsList.typeofbeverage && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Type of Beverage : </Text><Text className="text-[15px]">{adsList.typeofbeverage}</Text></View>}
                {adsList.brand && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Brand : </Text><Text className="text-[15px]">{adsList.brand}</Text></View>}
                {adsList.publisher && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Publisher : </Text><Text className="text-[15px]">{adsList.publisher}</Text></View>}
                {adsList.gender && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Gender : </Text><Text className="text-[15px]">{adsList.gender}</Text></View>}
                {adsList.size && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Size : </Text><Text className="text-[15px]">{adsList.size}</Text></View>}
                {adsList.style && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Style : </Text><Text className="text-[15px]">{adsList.style}</Text></View>}
                {adsList.agegroup && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Age Group : </Text><Text className="text-[15px]">{adsList.agegroup}</Text></View>}
                {adsList.material && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Material : </Text><Text className="text-[15px]">{adsList.material}</Text></View>}
                {adsList.model && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Model : </Text><Text className="text-[15px]">{adsList.model}</Text></View>}
                {adsList.fueltype && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Fuel Type : </Text><Text className="text-[15px]">{adsList.fueltype}</Text></View>}
                {adsList.powersource && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Power Source : </Text><Text className="text-[15px]">{adsList.powersource}</Text></View>}
                {adsList.packagingtype && <View className="flex-row items-center">
                    <Text className="my-0.5 text-[15px] font-medium">Packaging : </Text><Text className="text-[15px]">{adsList.packagingtype}</Text></View>}
                {divider()}
                <Text className="tracking-wider font-medium text-[20px]" style={{ marginBottom: Sizes.fixPadding }}>
                    Description
                </Text>
                <Text className="text-[15px] text-gray-700 leading-5  tracking-wider " style={{ textAlign: 'justify' }}>
                    {adsList.description}
                </Text>
            </View>
        )
    }

    function divider() {
        return (
            <View style={{
                backgroundColor: Colors.lightGrayColor,
                height: 1.0,
                margin: Sizes.fixPadding * 2.0,
            }} />
        )
    }

    function itemDetail(adsList) {
        return (
            <View style={{ marginHorizontal: Sizes.fixPadding * 2.0, }}>
                <Text className="text-[16px]">
                    {currenciesSymbol(adsList.currency_symbol)} {adsList.price}
                </Text>

                <Text style={{ marginTop: Sizes.fixPadding - 8.0, marginBottom: Sizes.fixPadding }} className="text-[17px]">
                    {adsList.ad_title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons
                            name="map-marker"
                            size={18}
                            color={Colors.primaryColor}
                        />
                        <Text style={{ ...Fonts.grayColor14Medium }}>
                            {`${adsList.locationcity}, ${adsList.locationstate}`}
                        </Text>
                    </View>
                    <Text className="text-gray-400">
                        {`Posted on : `}<Text className="font-medium text-gray-600">{adsList.date}</Text>
                    </Text>
                </View>
            </View>
        )
    }

    function itemImages() {
        const renderItem = ({ item }) => {

            return (

                <View style={styles.itemImagesWrapStyle}>
                    <TouchableOpacity onPress={debounce(() => toggleModal(item), 500)}>
                        <Image
                            resizeMode="contain"
                            source={{ uri: item }}
                            style={{ width: '100%', height: '100%', borderRadius: Sizes.fixPadding - 5.0, }}
                        />
                    </TouchableOpacity>

                    <Modal className="bg-[rgba(0,0,0,0.6)]" isVisible={isModalVisible}>
                        <Image
                            resizeMode="contain"
                            source={{ uri: selectedImage }}
                            style={{
                                width: "100%", // Set your desired width
                                height: undefined, // Let the height be calculated based on the aspect ratio
                                aspectRatio: 4 / 3, // Set the aspect ratio as per your image's aspect ratio
                                borderRadius: Sizes.fixPadding - 1.0,
                            }}
                            imageIndex={0}
                            isVisible={isModalVisible}
                            onClose={() => toggleModal(null)}

                        />


                        <TouchableOpacity onPress={debounce(() => toggleModal(null), 500)} style={{ position: 'absolute', top: 10, right: 10 }}>
                            <MaterialIcons name="close" size={32} color="#fff" />
                        </TouchableOpacity>
                    </Modal>
                </View>
            )
        }
        return (
            <View>
                <FlatList
                    data={adsList.images}
                    keyExtractor={(index) => `${index}`}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: Sizes.fixPadding * 2.0, paddingLeft: Sizes.fixPadding * 2.0, paddingRight: Sizes.fixPadding, }}
                />
            </View>
        )
    }

    function header() {
        return (
            <View style={styles.headerWrapStyle}>
                <MaterialIcons
                    name="arrow-back-ios"
                    color={Colors.whiteColor}
                    size={22}
                    onPress={debounce(() => navigation.pop(), 500)}
                />
                <Text style={{ marginLeft: Sizes.fixPadding - 5.0, flex: 1, ...Fonts.whiteColor18SemiBold }}>
                    Review Ad
                </Text>
            </View>
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
    itemImagesWrapStyle: {
        backgroundColor: Colors.whiteColor,
        elevation: 3.0,
        borderRadius: Sizes.fixPadding - 5.0,
        marginRight: Sizes.fixPadding,
        height: 150.0,
        width: width / 1.5
    },
    publishButtonStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryColor,
        paddingVertical: Sizes.fixPadding + 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        elevation: 5.0,
        shadowColor: Colors.primaryColor,
        marginHorizontal: Sizes.fixPadding * 2.0,
        borderColor: 'rgba(75, 44, 32, 0.5)',
        borderWidth: 1.0,
    },
    editButtonStyle: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.whiteColor,
        paddingVertical: Sizes.fixPadding + 5.0,
        borderRadius: Sizes.fixPadding - 5.0,
        elevation: 1.0,
        shadowColor: Colors.primaryColor,
        margin: Sizes.fixPadding * 2.0,
        borderColor: '#ececec',
        borderWidth: 1.0,
    }
});

export default ReviewItemScreen;
