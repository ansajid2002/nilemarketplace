import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'

import { debounce } from 'lodash';
import { StyleSheet } from 'react-native';
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { HeaderBar } from '../../constant';
import { SafeAreaView } from 'react-native';
import { changeLanguage } from '../../services/i18next';
import { setAppLang, setAppLangname } from '../../store/slices/currencySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Language = ({ navigation }) => {

  const dispatch = useDispatch()

  const { languages,appLangcode } = useSelector((store) => store.selectedCurrency)
// console.log(appLangname,"name of language");
  const renderItem = ({ item }) => {
    const isSelected = appLangcode === item.langcode;

    return (
      <TouchableOpacity onPress={debounce(async () => {
        try {
          await AsyncStorage.setItem('selectedLangcode', item.langcode);
        } catch (error) {
          console.error('Error saving selected country to AsyncStorage:', error);
        }
        try {
          await AsyncStorage.setItem('selectedLangname', item.name);
        } catch (error) {
          console.error('Error saving selected country to AsyncStorage:', error);
        }

        dispatch(setAppLang(item.langcode))
        dispatch(setAppLangname(item.name))
        changeLanguage(item.langcode)
      }
        , 500)} className=" mx-4 my-1.5 border border-gray-300  rounded-md shadow-md flex-row items-center py-3 px-3 space-x-3  "
        style={{
          backgroundColor: isSelected ? '#fb7701' : '#fff',
        }}>


        <Text style={{
          color: isSelected ? 'white' : 'black',
        }} className="text-lg tracking-wider font-medium">
          {item.name}
        </Text>

      </TouchableOpacity>

    );
  };

  return (
    // <View className="bg-white" style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

      <HeaderBar goback={true} title={'Select Language'} navigation={navigation} />
      <View className="mt-3  h-full">

        <FlatList
          data={languages}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
        />

      </View>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  headerWrapStyle: {
    padding: Sizes.fixPadding * 2.0,
    backgroundColor: Colors.primaryColor,
    borderBottomLeftRadius: Sizes.fixPadding + 5.0,
    borderBottomRightRadius: Sizes.fixPadding + 5.0,
  },
})

export default Language;
