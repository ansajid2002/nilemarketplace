import { View, Text } from 'react-native'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FlatList } from 'react-native'
import { debounce } from 'lodash'
import { TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { setAppcountry } from '../../store/slices/currencySlice'
import i18n from '../../services/i18next'
import { setLang } from '../../store/slices/languageSlice'
import { Image } from 'react-native'
import { StyleSheet } from 'react-native'
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { HeaderBar } from '../../constant'
import { SafeAreaView } from 'react-native'

const CountryScreen = ({ navigation }) => {

  const dispatch = useDispatch()
  const { appcountry, availablecountries } = useSelector((store) => store.selectedCurrency)
  const [selectedCountry, setSelectedCountry] = useState(appcountry);


  const handlecountrychange = async (item) => {
    setSelectedCountry(item.name)
    dispatch(setAppcountry(item.name))
    await i18n.changeLanguage(item.languages[0].langcode);
    dispatch(setLang({ newLanguagecode: item.languages[0].langcode, newLanguagename: item.languages[0].name }));
    navigation.goBack()
  }


  const renderItem = ({ item }) => {

    const isSelected = selectedCountry === item.name;


    return (
      <TouchableOpacity onPress={debounce(() => handlecountrychange(item),500)} className=" items-center mx-auto my-4 border border-gray-300 p-4 rounded-lg w-[170px] shadow-md "
        style={{

          backgroundColor: isSelected ? '#f1a15a5e' : '#fff',
          // borderColor:isSelected ? '#00008b' : 'white'
        }}>
        <Image source={item.image} className="w-[100px] h-[100px]" />


        <Text className="text-xl tracking-wider font-medium mt-3">
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };


  return (
    // <View className="flex-1 bg-white">
                  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

      <HeaderBar goback={true} title={'Select Country'} navigation={navigation} />

      <FlatList
        data={availablecountries}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        numColumns={2}

      />
</SafeAreaView>
    // </View>
  )
}

const styles = StyleSheet.create({
  headerWrapStyle: {
    padding: Sizes.fixPadding * 2.0,
    backgroundColor: Colors.primaryColor,
    borderBottomLeftRadius: Sizes.fixPadding + 5.0,
    borderBottomRightRadius: Sizes.fixPadding + 5.0,
  },
})
export default CountryScreen