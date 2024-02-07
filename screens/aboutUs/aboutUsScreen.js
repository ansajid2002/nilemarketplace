import React from "react";
import { SafeAreaView, View, StatusBar, StyleSheet, Text,ScrollView } from "react-native";
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { MaterialIcons } from '@expo/vector-icons';

import { debounce } from "lodash";
import { HeaderBar } from "../../constant";

const aboutInfoList = [
    `Welcome to Nile Marketplace, your go-to destination for buying and selling a wide range of new and refurbished products. Whether you're a buyer looking for great deals or a seller hoping to reach a large audience, Nile Marketplace is the platform for you.
    
    For buyers, the app offers an extensive collection of products, including electronics, fashion items, furniture, appliances, and more. Each listing on Nile Marketplace meets strict quality standards, providing buyers with the confidence to shop without any worries.
    
    On the other hand, sellers can easily list their products with detailed descriptions and images, making it easy for potential buyers to find their products. The platform's user-friendly interface ensures sellers can efficiently manage their listings.
    
    Safety and security are paramount at Nile Marketplace, with advanced encryption and security measures in place to protect users' personal information and facilitate secure transactions. Buyers and sellers can carry out their transactions with peace of mind.
    
    As part of a supportive community, users can join Nile Marketplace to connect with like-minded individuals passionate about finding great deals and selling their products to a broad audience. In case of any questions or concerns, a dedicated support team is available to assist users promptly.
    
    Safety and security are paramount at Nile Marketplace, with advanced encryption and security measures in place to protect users' personal information and facilitate secure transactions. Buyers and sellers can carry out their transactions with peace of mind.
    
    As part of a supportive community, users can join Nile Marketplace to connect with like-minded individuals passionate about finding great deals and selling their products to a broad audience. In case of any questions or concerns, a dedicated support team is available to assist users promptly.`
    
];

const AboutUsScreen = ({ navigation }) => {

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }}>
            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            <View style={{ flex: 1 }}>
                {header()}
                {aboutInfo()}
            </View>
        </SafeAreaView>
    )

    function aboutInfo() {
        return (
            <ScrollView style={{ margin: Sizes.fixPadding * 1.5 }} showsVerticalScrollIndicator={false}>
                {
                    aboutInfoList.map((item, index) => (
                        <Text key={`${index}`}  
                        className="leading-5 text-gray-600 text-justify" >
                            {item}
                        </Text>
                    ))
                }
            </ScrollView>
        )
    }

    function header() {
        return (
            <HeaderBar title={'About Nile Marker-Place'} goback={true} navigation={navigation} />
        )
    }

}

const styles = StyleSheet.create({
   
});

export default AboutUsScreen;
