import { View, Text, SafeAreaView, Alert } from 'react-native'
import React, { useState } from 'react'
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import { HeaderBar } from '../../constant';
import { FlatList } from 'react-native';
import { debounce } from 'lodash';
import { changeSomaliandistrict } from '../../store/slices/customerSlice';
import { AdminUrl } from '../../constant';


const cities = [
  "WARTA NABADA",
  "KAARAN",
  "WADAJIR",
  "YAAQSHID",
  "ABDIAZIZ",
  "KAXDA",
  "HELIWAA",
  "DAYNILE",
  "SHIBIS",
  "HOLWADAG",
  "BOONDHERE",
  "XAMAR WEYNE",
  "XAMAR JAJAB",
  "WAABERI",
  "DHARKENLEY",
  "SHANGANI",
  "AFGOOYE",
  "DARUSALAM",
  "GUBUDLEY",
  "HODAN",
];


const Mogadishudistrict = ({ navigation }) => {

  const { somalian_district } = useSelector((store) => store.customerAddress)
  const { cartItems } = useSelector((state) => state.cart);
  const { cartTotal } = useSelector((store) => store.cart)
  const [selectedDistrict, setSelectedDistrict] = useState(somalian_district);
  const { customerData } = useSelector((store) => store.userData)
  const customerId = customerData[0]?.customer_id

  const dispatch = useDispatch()


  const renderItem = ({ item }) => {
    const isSelected = selectedDistrict === item;


    const handleChangeDistrict = async (name) => {
      try {
        if (cartTotal > 0) {
          Alert.alert(
            "Cannot Change District",
            `You have ${cartTotal} items in your cart! Proceed to checkout or empty your cart.`
          );
        } else {
          if (customerId) {
            const response = await fetch(`${AdminUrl}/api/getmogadishudistrict`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                customer_id: customerId,
                district: name,
              }),
            });
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            // Handle the response data as needed

            setSelectedDistrict(name);
            dispatch(changeSomaliandistrict(name));
          } else {
            setSelectedDistrict(name);
            dispatch(changeSomaliandistrict(name));
          }

        }
      } catch (error) {
        console.error('Error performing POST request:', error);
        // Handle the error as needed
      }
    };


    return (
      <TouchableOpacity onPress={debounce(() => handleChangeDistrict(item), 500)} className=" mx-4 my-1.5 border border-gray-300  rounded-md shadow-md flex-row items-center py-3 px-3 space-x-3  "
        style={{
          backgroundColor: isSelected ? '#fb7701' : '#fff',
        }}>


        <Text style={{
          color: isSelected ? 'white' : 'black',
        }} className="text-lg tracking-wider font-medium">
          {item}
        </Text>

      </TouchableOpacity>

    );
  };



  return (


    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} className="">

      <HeaderBar goback={true} title={'Mogadishu Districts'} navigation={navigation} />

      <FlatList showsVerticalScrollIndicator={false}
        data={cities}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        numColumns={1}

      />
    </SafeAreaView>
  )
}

export default Mogadishudistrict
