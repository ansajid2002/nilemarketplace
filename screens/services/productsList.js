import { View, Text, TouchableOpacity, ScrollView,FlatList } from 'react-native'
import React,{useState,useEffect} from 'react'
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { HeaderBar } from '../../constant';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Colors } from '../../constants/styles';
import { AdminUrl } from '../../constant';
import { ProductcategoryPlaceholder } from '../../components/Skeleton';


const ProductsList = ({ navigation }) => {

  const [productCatData, setProductCatData] = useState(null)
  const { t } = useTranslation();
  const getCatgeory = async () => {
    try {
        const response = await fetch(`${AdminUrl}/api/getCatgeory`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setProductCatData(data)
        // Log the data
        //   dispatch(updateproductsList(data));
    } catch (error) {
        console.error('Error:', error);
    }
};

useEffect(() => {
    if (!productCatData) {
        getCatgeory()
    }
}, [productCatData])

  const renderitem = ({ item }) => {
    return (

      <TouchableOpacity
        // onPress={debounce(() => navigation.push('CategoriesItems', { categoryId:item.category_id,categoryName:item.category_name, subcategory_name: t("All") }), 500)}
        onPress={debounce(() => {
            navigation.push('CategoryProductList', { categoryId: item.category_id, categoryName: item.category_name, subcategory_name: t("All") })
        }, 500)}
        className={`flex-1 `}

      >
        <View className=" border border-gray-200 p-2 items-center ">
        <Image
                            source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
                            style={{ width: 140.0, height: 100.0, resizeMode: 'cover' }}
                            className=""
                        />
          <Text className="text-[14px] pt-2">{t(`${item.category_name}`)}</Text>
          
        </View>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">
    {
      productCatData ? 

    
    <FlatList
        data={productCatData}
        renderItem={renderitem}
        numColumns={2}
        keyExtractor={item => item.category_id}
        ListHeaderComponent={() => (
          <View className="mb-2">
          <HeaderBar title={'All Categories'} goback={true} navigation={navigation} searchEnable={true} />
          </View>
        )}
       
        stickyHeaderIndices={[0]} // Index of the header component
      /> :
      <View>
      <View className="mb-2">
          <HeaderBar title={'All Categories'} goback={true} navigation={navigation} searchEnable={true} />
          </View>
          <ScrollView>
      <ProductcategoryPlaceholder/>
          </ScrollView>
      </View>
    }
</SafeAreaView>  )
}

export default ProductsList 