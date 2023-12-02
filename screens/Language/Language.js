import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { FlatList } from 'react-native';
import { Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux'

import { setLang } from '../../store/slices/languageSlice';
import { debounce } from 'lodash';
import { StyleSheet } from 'react-native';
import { Colors, Fonts, Sizes, } from "../../constants/styles";
import { HeaderBar } from '../../constant';
import { SafeAreaView } from 'react-native';

const Language = ({ navigation }) => {

  const { selectedLangcode } = useSelector((store) => store.selectedLang)
  const [selectedLanguage, setSelectedLanguage] = useState(selectedLangcode);

  const { availablecountries } = useSelector((store) => store.selectedCurrency)
  const { appcountry } = useSelector((store) => store.selectedCurrency)

  const dispatch = useDispatch()


  const { t, i18n } = useTranslation();

  const handleSwitchLanguage = async (item) => {
    const { name, langcode } = item
    setSelectedLanguage(langcode)


    await i18n.changeLanguage(langcode);
    dispatch(setLang({ newLanguagecode: langcode, newLanguagename: name }));
    navigation.goBack()
  };

  const [languagestodisplay, setLanguagestodisplay] = useState((availablecountries.find((single) =>
    single.name === appcountry).languages

  ))

  const renderItem = ({ item }) => {
    const isSelected = selectedLangcode === item.langcode;


    const handleRadioButtonPress = (languageName) => {
      setSelectedLanguage(languageName);
    };

    return (
      <TouchableOpacity onPress={debounce(() => handleSwitchLanguage(item), 500)}>
        <View
          className="flex-row flex-wrap"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 20,

          }}
        >
          {/* Radio button */}
          <TouchableOpacity
            onPress={debounce(() => handleRadioButtonPress(item.langcode), 500)}
            style={{
              width: 21,
              height: 21,
              borderWidth: 1,
              borderColor: isSelected ? '#00008B' : 'gray',
              borderRadius: 16,
              marginRight: 10,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 8,
            }}
          >
            {isSelected && (
              <View
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: '#00008b',
                  borderRadius: 20,
                }}
              />
            )}
          </TouchableOpacity>

          {/* Language text */}
          <Text
            style={{
              fontSize: 18,                   // Set the font size to 18px
              fontWeight: 'bold',             // Make the text bold
              color: isSelected ? '#00008B' : 'black',  // Set text color to blue when selected
            }}
          >
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>

    );
  };

  return (
    // <View className="bg-white" style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">

      <HeaderBar goback={true} title={'Select Language'} navigation={navigation} />
      <View className="mt-3  h-full">

        <FlatList
          data={languagestodisplay}
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
