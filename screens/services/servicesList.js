import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from "react-native-vector-icons"
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { HeaderBar } from '../../constant';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';

const ServicesList = ({ navigation }) => {

  const { t } = useTranslation()
  //////////////////////REDUX/////////////////////////////////////
  const { categoriesData } = useSelector((store) => store.categories)



  const servicesData = categoriesData
    .filter((singleservice) => singleservice.category_type === "Services")


  const renderitem = ({ item }) => {

    return (

      // navigation.push('CategoriesItems', { item: productscategories.find((single) => single.category_id === item.parent_category_id), subcategory_name })

      <TouchableOpacity onPress={debounce(() => navigation.push('CategoriesItems', { item, subcategory_name: t("All") }), 500)}
        // onPress={debounce(() => navigation.push('CategoriesItems', { item: item, subcategory_name:"All" }), 500)}
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
          <HeaderBar title={'Services'} goback={true} navigation={navigation} searchEnable={true} />
        } // Use the renderHeader function as the header
        stickyHeaderIndices={[0]}
      />
</SafeAreaView>  )
}

export default ServicesList 