import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/styles';
import { AdminUrl, HeaderBar } from '../../constant';
import { changetabbarIndex } from '../../store/slices/counterslice';
import { updateCustomerData } from '../../store/slices/customerData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FullPageLoader from '../../components/FullPageLoader';
import { SafeAreaView } from 'react-native';
import { CategoryPlaceholder, PickinterestPlaceholder } from '../../components/Skeleton';
import { useTranslation } from 'react-i18next';

const Pickinterest = ({ navigation }) => {
  const dispatch = useDispatch()
  const [allcategorydata,setAllcategorydata] = useState(null)
  const [interest, setInterest] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const {t} = useTranslation()

  const minSelectedInterests = 5;

  const continueButtonEnabled = selectedInterests?.length >= minSelectedInterests;

  const { customerData } = useSelector((store) => store.userData)
  const customerId = customerData[0]?.customer_id

  useEffect(() => {
    setSelectedInterests(interest.map((single) => single.category_id));
  }, [interest]);


  const getCatgeory = async () => {
    try {
        const response = await fetch(`${AdminUrl}/api/getCatgeory`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setAllcategorydata(data);

    } catch (error) {
        console.error('Error:', error);
    }
};


  useEffect(() => {
    if (!allcategorydata) {
      getCatgeory()
    }
  },[])

  const handleInterest = (category_id) => {
    // Find the clicked category in categoriesData
    const clickedCategory = allcategorydata.find(
      (category) => category.category_id === category_id
    );

    if (clickedCategory) {
      // Check if the category is already in the interest array
      const isAlreadyAdded = interest.some(
        (item) => item.category_id === category_id
      );

      if (isAlreadyAdded) {
        // Remove the category from the interest array
        const updatedInterest = interest.filter(
          (item) => item.category_id !== category_id
        );
        setInterest(updatedInterest);
      } else {
        // Check if the maximum limit of 5 categories is reached
        if (interest?.length < 5) {
          // Add the category to the interest array
          setInterest([...interest, clickedCategory]);
        } else {
          // Notify the user that they can only select 5 categories
          alert("You can only select up to 5 categories.");
        }
      }
    }
  };

  const handleContinue = () => {
    setLoading(true)
    // Extract categoryIds from the interest array
    const categoryIds = interest.map((item) => item.category_id);

    // Define your customer data
    const customerData = {
      customerId: customerId, // Replace with the actual customer ID
      categoryIds: categoryIds,
    };

    // Define the URL of your API endpoint
    const apiUrl = `${AdminUrl}/api/storeCustomerInterest`;

    // Define the request options, including method, headers, and body
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    };

    // Send the POST request
    fetch(apiUrl, requestOptions)
      .then((response) => {
        if (response.ok) {
          // Request was successful
          return response.json();
        } else {
          throw new Error('Network response was not ok');
        }

      })
      .then(async (data) => {
        // Handle the response data as needed
        if (data?.customerData) {
          await AsyncStorage.removeItem('customerData');
          await AsyncStorage.setItem('customerData', JSON.stringify(data?.customerData));
        }

        console.log(data.customerData);
        dispatch(updateCustomerData(data?.customerData))
        navigation.navigate("Home")
      })
      .catch((error) => {
        // Handle any errors that occurred during the fetch
        console.error('Fetch Error:', error);
      });
  };
  return (
    <View style={styles.container}>
      {
        loading ? <FullPageLoader /> :             <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">


          <HeaderBar goback={true} navigation={navigation} title={`${t("Pick Interest")} (${selectedInterests?.length}/${minSelectedInterests})`} />
          <ScrollView style={styles.scrollView} className="mt-2">
            
            {
              !allcategorydata ? <PickinterestPlaceholder/> : 
            
            <View style={styles.categoriesContainer}>
              {allcategorydata?.map((single) => {
                const { category_id, category_name, category_image_url } = single;

                return (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    key={category_id}
                    onPress={debounce(() => handleInterest(category_id))}
                  >
                    <View
                      style={[
                        styles.categoryImageWrapStyle,
                        selectedInterests.includes(category_id),
                      ]}
                    >
                      <Image
                        resizeMode='contain'
                        source={{ uri: `${AdminUrl}/uploads/CatgeoryImages/${single.category_image_url}` }}
                        style={{ width: 100.0, height: 100.0 }}
                        className="rounded-full"
                      />
                      {selectedInterests.includes(category_id) && (
                        <View style={styles.checkmark}>
                          <MaterialCommunityIcons name="heart" size={25} color="#fb7701" />
                        </View>
                      )}
                    </View>
                    <Text style={styles.categoryText} className="text-gray-600" numberOfLines={2}>
                      {category_name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View> }
          </ScrollView>
          <View className={`rounded-full mb-2 mx-2 ${continueButtonEnabled ? 'bg-[#fb7701]' : 'bg-gray-400'}`}>
            <TouchableOpacity className=" mx-auto flex-row items-center"
              disabled={!continueButtonEnabled}
              onPress={handleContinue}
            >
              {/* <MaterialCommunityIcons name="cart" size={25} color={Colors.whiteColor} /> */}
              <Text className="text-xl tracking-wider px-4 py-2 pb-3 text-white font-bold rounded ">Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    color: '#00008b',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 2,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
    padding: 5
  },
  categoryItem: {
    alignItems: 'center',
    margin: 2,
    marginBottom: 8,
  },
  categoryImageWrapStyle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.whiteColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ececec',
  },

  checkmark: {
    padding: 0.5,
    borderRadius: 10,
    position: 'absolute',
    top: 1,
    right: 4,
  },
  categoryText: {
    width: 80,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: 'bold',
  },
  continueButtonContainer: {
    backgroundColor: '#fb7701',
    borderRadius: 30,
    margin: 2,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    backgroundColor: 'gray', // You can set the background color for the disabled button
    borderRadius: 30,
  },
  enabledContinueButton: {
    backgroundColor: '#fb7701',
  },
  disabledContinueButton: {
    backgroundColor: 'gray',
  },

});

export default Pickinterest;
