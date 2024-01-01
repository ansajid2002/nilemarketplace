import { View, Text, ScrollView, StatusBar, SafeAreaView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { TouchableOpacity } from 'react-native'
import { Feather, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import { Colors, Sizes } from '../../constants/styles'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native'
import { AdminUrl } from '../../constant'
import { debounce } from 'lodash'
import { Keyboard } from "react-native";

const Bottomsearch = ({ navigation }) => {
    const [searchInput, setSearchInput] = useState("")
    const [isFocused, setIsFocused] = useState(false);
    const [MatchingKeyword, setMatchingKeyword] = useState([]);
    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const { t } = useTranslation()
    const inputRef = useRef(null);

    useEffect(() => {
        // Focus the input once the component is mounted
        inputRef.current.focus();
    }, []);


    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleSearchInput = async (text) => {
        setSearchInput(text);
        try {
            const response = await fetch(`${AdminUrl}/api/searchProducts?searchTerm=${text}&currency=${currencyCode}`);
            const searchKeywords = await response.json();
            setMatchingKeyword(searchKeywords)
        } catch (error) {
            console.error('An error occurred:', error);
        }
    };

    const handleKeywordPress = async (selectedKeyword) => {
        if (searchInput) {
            navigation.navigate('SearchResults', selectedKeyword)
        }
    };


    function header() {
        return (
            <View style={styles.headerWrapStyle} className="bg-[#ffffff]">
                <View className="relative">
                    <TextInput
                        ref={inputRef}
                        className="h-9 border rounded-md bg-white py-1 pl-2 tracking-wider focus:ring-0 focus:outline-none active:ring-0  hover:ring-0 hover:outline-none"
                        placeholder={t('Search here')}
                        value={searchInput}
                        onChangeText={(text) => handleSearchInput(text)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onSubmitEditing={debounce(() => { handleKeywordPress(searchInput) }, 700)}
                    />

                    <MaterialIcons
                        className=""
                        name={isFocused ? "cancel" : "search"}
                        color="black"
                        size={22}
                        style={styles.searchIcon}
                        onPress={() => {
                            if (isFocused) {
                                setIsFocused(false);
                                setSearchInput("")
                                Keyboard.dismiss();
                            }
                        }}
                    />
                </View>
            </View>

        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            {header()}
            <ScrollView className="bg-white">
                {MatchingKeyword.length > 0 && MatchingKeyword.map((keyword, index) => (
                    <TouchableOpacity key={index} onPress={debounce(() => handleKeywordPress(keyword), 1000)}>
                        <View style={styles.keywordContainer}>
                            <Feather name="arrow-up-right" size={24} color="black" />
                            <Text style={styles.keywordText}>{keyword}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    )


}


const styles = StyleSheet.create({
    headerWrapStyle: {
        padding: Sizes.fixPadding * 1.5,
        // paddingTop:Sizes.fixPadding * 2

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
        top: 7, // Adjust this value to vertically center the icon
        right: 8, // Adjust this value to horizontally center the icon 
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
export default Bottomsearch