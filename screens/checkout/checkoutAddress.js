import { View, Text, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux'
import { addAddress, changeCurrentAddress, loadAddress, removeAddress } from '../../store/slices/customerSlice'
import { debounce } from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons'; // You may need to install this package
import axios from 'axios';
import { AdminUrl } from '../../constant';
import FullPageLoader from '../../components/FullPageLoader';
import { Colors } from '../../constants/styles';
import { SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';

const Checkoutaddress = ({ navigation }) => {
  const { customerAddressData, currentAddress } = useSelector((store) => store.customerAddress)
  const [selectedAddressinfo, setSelectedAddressinfo] = useState(currentAddress ? currentAddress : {});
  const [selectedAddress, setSelectedAddress] = useState(currentAddress.address_id ? currentAddress.address_id : null);
  const { customerData } = useSelector((store) => store.userData)
  const { cartItems, checkoutItems } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()
  useEffect(() => {
    const fetchBanners = () => {
      // Replace 'backendBannersUrl' with the actual endpoint to fetch banners
      const backendBannersUrl = `${AdminUrl}/api/getCustomersAddress/${customerData?.[0]?.customer_id}`;

      axios.get(backendBannersUrl)
        .then((response) => {
          // Filter banners with non-empty 'banner_url' before updating the state
          if (response.data) {
            dispatch(loadAddress(response.data))
            setLoading(false)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch Address:', error);
        });
    };

    // Fetch banners from the backend when the component mounts
    fetchBanners();
  }, []);

  const dispatch = useDispatch()

  const handleAddressSelect = (customer_id) => {
    const selectedAddressData = customerAddressData.find((address) => address.address_id === customer_id);

    if (selectedAddressData) {
      setSelectedAddress(customer_id);
      const selectedAddressInfoCopy = { ...selectedAddressinfo, ...selectedAddressData };
      setSelectedAddressinfo(selectedAddressInfoCopy);
    }
  };

  useEffect(() => {
    if (Object.keys(currentAddress).length > 0) {
      // Check if any item in customerData has the same given_name, family_name, city, or postalCode
      const dataExists = customerAddressData.some((data) =>
        data.given_name_address === currentAddress.given_name_address &&
        data.family_name_address === currentAddress.family_name_address &&
        data.region_address === currentAddress.region_address
      );


      if (!dataExists) {
        // If none of the properties match, dispatch the action
        dispatch(addAddress(currentAddress));
      }
    }
  }, [currentAddress]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.whiteColor }} className="">


      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
          }
          <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 600 }}>{t("Select a delivery Address")}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={debounce(() => navigation.navigate("Checkout Add Address"), 1000)}>
            <MaterialIcons name="add" size={28} color="black" style={{ marginRight: 10 }} />
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView className="mx-2" showsVerticalScrollIndicator={false}>
        {
          (cartItems?.map(item => item.uniquepid).every(uniquepid => checkoutItems?.includes(uniquepid))) ?
            <View className="mx-auto mt-10">
              <Text className="text-lg italic mb-2 text-center">{t("You don't have any item eligible for shipping")}</Text>
              <TouchableOpacity className=" flex-row justify-center "
                onPress={() => navigation.navigate('Checkout Preview')}
              ><Text className="text-center bg-[#fb9b01] px-3 py-1.5 text-xl mt-2 font-medium ">{t("Proceed to checkout")}</Text></TouchableOpacity>
            </View> :
            <View>{
              customerAddressData.length === 0 ?
                <View className="m-auto my-20">
                  <Text className="text-2xl">{t("No Address Selected")}</Text>
                  <TouchableOpacity className="bg-[#00008b] flex-row items-center justify-center mt-4 w-[200px] mx-auto" onPress={debounce(() => navigation.navigate("Checkout Add Address"), 1000)}><Text className="text-xl text-white  py-1">Add Address</Text></TouchableOpacity>
                </View>
                :
                <View className="">
                  {
                    customerAddressData?.map((single) => {
                      const {
                        given_name_address,
                        family_name_address,
                        zip_address,
                        apt_address,
                        phone_address,
                        address_id,
                        city_address, country_address, region_address, subregion_address,
                        default_address
                      } = single

                      const isSelected = selectedAddress === address_id || default_address
          
                      return (
                        <TouchableOpacity key={address_id} className="p-2  my-1 border bg-white border-gray-300 " onPress={debounce(() => handleAddressSelect(address_id), 500)}>
                          <View className="flex-row items-center">

                            <View className="mr-5" style={{ width: 26, height: 26, borderRadius: 15, borderWidth: 2, padding: 3, borderColor: 'gray' }}>
                              {isSelected && <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#00008b' }} />}
                            </View>

                            <View className="w-full ">
                              <Text numberOfLines={1} className="text-lg font-semibold tracking-wider">{given_name_address} {family_name_address}</Text>

                              <Text className="line-clamp-1 w-4/6">{apt_address}</Text>
                              {/* <Text className="text-base">{street}</Text> */}
                              <Text numberOfLines={1} className="text-[15px]">{city_address}</Text>
                              {
                                region_address && subregion_address &&
                                <Text numberOfLines={1} className="text-[15px] ">{`${region_address}, ${subregion_address}`}</Text>
                              }
                              <Text numberOfLines={1} className="text-base">{country_address}</Text>
                              <Text numberOfLines={1} className="text-[15px]">{zip_address}</Text>
                              {/* <Text className="text-base">{country_address}</Text> */}
                              {
                                phone_address &&
                                <Text numberOfLines={1} className="text-[15px]">{`Phone Number: ${phone_address}`}</Text>
                              }
                            </View>

                          </View>
                          {
                            isSelected &&
                            <View className="mx-4 my-2">
                              <TouchableOpacity
                                className="bg-amber-400 border-gray-300"
                                style={{ padding: 8, marginVertical: 2, borderRadius: 4, borderWidth: 1 }}

                                onPress={debounce(() => {
                                  setLoading(true)
                                  dispatch(changeCurrentAddress(single));
                                  if (cartItems.length === 0) {
                                    navigation.goBack()
                                    // navigation.goBack()
                                  }
                                  else {
                                    if (selectedAddressinfo.phone_address === "" || selectedAddressinfo.phone_address === null) {
                                      Alert.alert("Error", "Please Select Phone Number and More Specific Address");
                                      navigation.navigate("Checkout Add Address", single);

                                    }
                                    else {

                                      navigation.navigate("Checkout Preview", single);
                                    }
                                    setLoading(false)
                                  }

                                }, 500)}
                              >
                                <Text className="text-center text-base font-semibold">{t("Deliver to this address")}</Text>
                              </TouchableOpacity>
                              <View className="flex-row items-center">

                                <TouchableOpacity className="flex-1 p-2 border border-gray-400 my-2 rounded-md bg-gray-100"
                                  onPress={debounce(() => navigation.navigate("Checkout Add Address", selectedAddressinfo), 500)}
                                >
                                  <Text className="text-center text-base ">{t("Edit Address")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="w-12 items-end" onPress={debounce(() => {
                                  // setAddressArr(addressArr.filter((item) => item.customer_id !== customer_id))
                                  const backendUrl = `${AdminUrl}/api/RemoveCustomerAddress/${single.address_id}`;
                                  setLoading(true)
                                  axios.get(backendUrl)
                                    .then((response) => {
                                      // Filter banners with non-empty 'banner_url' before updating the state
                                      if (response.data) {
                                        dispatch(removeAddress(single))
                                        setLoading(false)
                                      }
                                    })
                                    .catch((error) => {
                                      console.error('Failed to fetch Address:', error);
                                    });

                                }, 500)}>
                                  <MaterialIcons name="delete" color="#000000" size={35} />

                                </TouchableOpacity>
                              </View>
                            </View>
                          }
                        </TouchableOpacity>
                      )
                    })
                  }
                </View>}</View>
        }

      </ScrollView>
      {loading && <FullPageLoader />}

    </SafeAreaView>
  )
}
export default Checkoutaddress 