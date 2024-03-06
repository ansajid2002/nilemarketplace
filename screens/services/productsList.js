import { View, Text, TouchableOpacity, ScrollView, FlatList, Dimensions, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
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
  const screenWidth = Dimensions.get('window').width;

  // Calculate the desired width for the image (half of the screen width)
  const imageWidth = screenWidth / 2;
  const renderitem = ({ item }) => {
    return (

      <TouchableOpacity
        // onPress={debounce(() => navigation.push('CategoriesItems', { categoryId:item.category_id,categoryName:item.category_name, subcategory_name: t("All") }), 500)}
        onPress={debounce(() => {
          navigation.push('CategoryProductList', { categoryId: item.category_id, categoryName: item.category_name, subcategory_name: t("All") })
        }, 500)}
        className={`flex-1 m-0.5 overflow-hidden `}

      >
        <View style={styles.container} >
  <Image 
    source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${item.category_image_url}` }}
    style={{ width: imageWidth, height: 180, resizeMode: 'cover' }}
  />
  <View  style={styles.overlay} />
  <Text style={styles.text}>{t(`${item.category_name}`)}</Text>
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
              <View className="">
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
              <ProductcategoryPlaceholder />
            </ScrollView>
          </View>
      }
    </SafeAreaView>)
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #ccc', // You might need to adjust this style according to your needs
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay color
  },
  text: {
    position: 'absolute',
    textAlign: 'center',
    color: '#fff', // Text color
    fontSize: 16, // Text font size
    // Center the text horizontally and vertically
    left: 0,
    margin:2,
    right: 0,
    top: '50%',
   
  },
});

export default ProductsList 