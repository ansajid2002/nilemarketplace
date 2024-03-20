import { View, Text, ScrollView, StatusBar, SafeAreaView, FlatList } from 'react-native'
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
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios'

const Bottomsearch = ({ navigation }) => {
    const [searchInput, setSearchInput] = useState("")
    const [isFocused, setIsFocused] = useState(false);
    const [searchHistory, setSearchHistory] = useState(null)
    const [popularSearches, setPopularSearches] = useState(null)

    const [MatchingKeyword, setMatchingKeyword] = useState([]);
    const { currencyCode } = useSelector((store) => store.selectedCurrency)
    const { t } = useTranslation()

    const { customerData } = useSelector((store) => store.userData)
    const customer_id = customerData?.[0]?.customer_id || null

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
        navigation.navigate('SearchResults', selectedKeyword)
        if (selectedKeyword.length >= 3) {
            navigation.navigate('SearchResults', selectedKeyword);
            await fetch(`${AdminUrl}/api/postsearchquery`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ searchTerm: selectedKeyword, customer_id: customer_id }),
            });
        } else {
            console.log("Keyword length is less than 3. Not making API call.");
        }
    };

    const fetchsearch = async () => {
        try {
            const res = await fetch(`${AdminUrl}/api/getmostoccurredsearches`)
            if (!res.ok) {
                throw new Error("Failed to fetch search history")
            }
            const data1 = await res.json()
            setPopularSearches(data1.data)
            if (!customer_id) return;

            const response = await fetch(`${AdminUrl}/api/getsearchhistorybycid?customer_id=${customer_id}&limit=5`)
            if (!response.ok) {
                throw new Error("Failed to fetch search history")
            }
            const data = await response.json()
            setSearchHistory(data.data)

        } catch (error) {
            console.log(error, "ERROR FETCHING SEARCH...");

        }
    }


    useEffect(() => {
        fetchsearch()
    }, [isFocused])

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


    const handleCancel = async (id) => {
        try {
            // Send the id to the backend
            const response = await axios.get(`${AdminUrl}/api/cancelItem?id=${id}`);

            // Assuming the backend returns a success message upon successful cancellation
            if (response.data.success) {
                console.log("Item canceled successfully.");
                // Filter the item from the state
                const filteredSearchHistory = searchHistory.filter(item => item.id !== id);
                setSearchHistory(filteredSearchHistory);
            } else {
                console.log("Failed to cancel item.");
            }
        } catch (error) {
            console.error("Error while canceling item:", error);
        }
    };

    const renderSearchData = () => {
        return (
            <View>
             
  {searchHistory && searchHistory.length > 0 ? (
    <>
      <Text className="px-2 py-4 text-gray-700">Recent searches</Text>
      {searchHistory.map((item) => (
        <View key={item.id} style={styles.itemContainer} className="flex-row justify-between items-center">
          <TouchableOpacity className="w-[90%]" style={styles.keywordContainer} onPress={debounce(() => handleKeywordPress(item.search_keyword), 1000)}>
            <FontAwesome name="history" size={24} color="gray" />
            <Text style={styles.keywordText}>{item.search_keyword}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleCancel(item.id)} style={styles.cancelButton} className="flex-1 justify-end w-full">
            <FontAwesome name="times" size={16} color="black" />
          </TouchableOpacity>
        </View>
      ))}
    </>
  ) : (
    <Text className="px-2 py-4 text-gray-700">No Recent searches</Text>
  )}

<View>
  {popularSearches && popularSearches.length > 0 ? (
    <>
      <Text className="px-2 py-4 text-gray-700">Popular searches</Text>
      {popularSearches.map((item) => (
        <TouchableOpacity key={item.id} onPress={debounce(() => handleKeywordPress(item.search_keyword), 1000)}>
          <View style={styles.keywordContainer}>
            <FontAwesome name="history" size={24} color="gray" />
            <Text style={styles.keywordText}>{item.search_keyword}</Text>
            {/* Add more Text components to display other details */}
          </View>
        </TouchableOpacity>
      ))}
    </>
  ) : (
    <Text className="px-2 py-4 text-gray-700">No Popular searches</Text>
  )}
</View>

               

                <View>

                </View>

            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

            <StatusBar translucent={false} backgroundColor={Colors.primaryColor} />
            {header()}
            <ScrollView className="bg-white px-2">
                {MatchingKeyword.length > 0 ? MatchingKeyword.map((keyword, index) => (
                    <TouchableOpacity key={index} onPress={debounce(() => handleKeywordPress(keyword), 1000)}>
                        <View style={styles.keywordContainer}>
                            <Feather name="arrow-up-right" size={24} color="black" />
                            <Text style={styles.keywordText}>{keyword}</Text>
                        </View>
                    </TouchableOpacity>
                )) : renderSearchData()}
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