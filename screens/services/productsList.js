import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux';
import { FlatList } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from "react-native-vector-icons"
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { HeaderBar } from '../../constant';
import { AdminUrl } from '../../constant';
import { Image } from 'react-native';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';

const ProductsList = ({ navigation }) => {

  const { t } = useTranslation();
  //////////////////////REDUX/////////////////////////////////////
  const { categoriesData } = useSelector((store) => store.categories)

  const servicesData = categoriesData
    .filter((singleservice) => singleservice.category_type === "Products")


  const renderitem = ({ item }) => {
    return (

      <TouchableOpacity
        // onPress={debounce(() => navigation.push('serviceDetail', item), 500)}
        onPress={debounce(() => navigation.push('CategoriesItems', { item: item, subcategory_name: t("All") }), 500)}

        // onPress={debounce(() => navigation.push('CategoriesItems', { item: productscategories.find((single) => single.category_id === item.parent_category_id), subcategory_name }), 500)}
        className={`flex-1 `}

      >
        <View className=" border border-gray-200 p-2 items-center ">
        <Image
                            source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                            style={{ width: 90.0, height: 90.0, resizeMode: 'contain' }}
                            className=""
                        />
          <Text className="text-[14px] pt-2">{t(`${item.category_name}`)}</Text>
          
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
    <FlatList
        data={servicesData}
        renderItem={renderitem}
        numColumns={2}
        keyExtractor={item => item.category_id}
        ListHeaderComponent={() => (
          // <Text className="text-2xl font-bold px-3 py-5 border border-gray-300 bg-gray-300">{t('All Categories')}</Text>
          <View className="mb-2">
          <HeaderBar title={'All Categories'} goback={true} navigation={navigation} searchEnable={true} />
          </View>
        )}
       
        stickyHeaderIndices={[0]} // Index of the header component
      />
</SafeAreaView>  )
}

export default ProductsList 