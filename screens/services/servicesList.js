import { View, Text, TouchableOpacity,FlatList } from 'react-native'
import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux';

import { MaterialCommunityIcons } from "react-native-vector-icons"
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { HeaderBar } from '../../constant';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';
import { AdminUrl } from '../../constant';

const ServicesList = ({ navigation }) => {

  const { t } = useTranslation()
  const [servicesData, setServicesData] = useState(null)

  //////////////////////REDUX/////////////////////////////////////

    const getservicesData = async () => {
      try {
          const response = await fetch(`${AdminUrl}/api/getServicesData`);
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          setServicesData(data)
      } catch (error) {
          console.error('Error:', error);
      }
  };

  useEffect(() => {
    if (!servicesData) {
      getservicesData()
    }
  },[servicesData])

  const renderitem = ({ item }) => {

    return (


      <TouchableOpacity
      //  onPress={debounce(() => navigation.push('CategoriesItems', { categoryId:item.category_id,categoryName:item.category_name, subcategory_name: t("All") }), 500)}
      onPress={debounce(() => {
        navigation.push('CategoryProductList', { categoryId: item.category_id, categoryName: item.category_name, subcategory_name: t("All") })
    }, 500)}
        className="bg-white"
      >
        <View className="flex flex-row items-center border border-gray-200 py-1"  >
          <Text className="text-lg px-3 py-3">{t(`${item.category_name}`)}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="black"
            className="ml-auto pr-4"
          />
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
    <FlatList
        data={servicesData}
        renderItem={renderitem}
        keyExtractor={item => item.category_id}
        ListHeaderComponent={
          <HeaderBar title={t('Services')} goback={true} navigation={navigation} searchEnable={true} />
        } // Use the renderHeader function as the header
        stickyHeaderIndices={[0]}
      />
</SafeAreaView>  )
}

export default ServicesList 