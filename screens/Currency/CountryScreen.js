import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { debounce } from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native';
import { setAppcountry } from '../../store/slices/currencySlice';
import { HeaderBar } from '../../constant';
const CountryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { appcountry, availablecountries } = useSelector((store) => store.selectedCurrency);
  const [selectedCountry, setSelectedCountry] = useState(appcountry);

  useEffect(() => {
    // Load the selected country from AsyncStorage on component mount
    const loadSelectedCountry = async () => {
      try {
        const storedCountry = await AsyncStorage.getItem('selectedCountry');
        console.log(storedCountry,"from async storage");
        
        if (storedCountry !== null) {
          setSelectedCountry(storedCountry);
          // dispatch(setAppcountry(storedCountry));
        }
      } catch (error) {
        console.error('Error loading selected country from AsyncStorage:', error);
      }
    };

    loadSelectedCountry();
  }, []);

  const handleCountryChange = async (item) => {
    setSelectedCountry(item.name);

    // Save the selected country to AsyncStorage
    try {
      await AsyncStorage.setItem('selectedLang', item.name);
    } catch (error) {
      console.error('Error saving selected country to AsyncStorage:', error);
    }

    dispatch(setAppcountry(item.name));
    navigation.goBack();
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedCountry === item.name;

    return (
      <TouchableOpacity
        onPress={debounce(() => handleCountryChange(item), 500)}
        style={{
          backgroundColor: isSelected ? '#fb7701' : '#fff',
          padding: 10,
          borderRadius: 8,
          margin: 8,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Image source={item.image} style={{ width: 30, height: 30 }} />
        <Text style={{ color: isSelected ? 'white' : 'black', fontSize: 18, marginLeft: 10 }}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderBar goback={true} title={'Select Country'} navigation={navigation} />

      <FlatList
        showsVerticalScrollIndicator={false}
        data={availablecountries}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        numColumns={1}
      />
    </SafeAreaView>
  );
};

export default CountryScreen;
