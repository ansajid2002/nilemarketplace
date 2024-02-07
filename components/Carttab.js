import { View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from 'react-redux';
import { AdminUrl } from '../constant';
import { getCartTotal } from '../store/slices/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Carttab = ({ color }) => {

  // const [cartTotal, setCartTotal] = useState(null)
  const { cartTotal } = useSelector((store) => store.cart)
  const { customerData } = useSelector((store) => store.userData)
  const customerId = customerData[0]?.customer_id
  const dispatch = useDispatch()


  const getCartTotaldata = async () => {
    try {
      if (!customerId) {
        const cartTotal = await AsyncStorage.getItem("cartTotal");
        if (cartTotal) {
          dispatch(getCartTotal(Number(cartTotal)))
        }
        else {
          dispatch(getCartTotal(0))
        }
      }
      else {
        const urlWithCustomerId = `${AdminUrl}/api/cartTotal?customer_id=${customerId}`;
        const requestOptions = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const response = await fetch(urlWithCustomerId, requestOptions);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json()
        dispatch(getCartTotal(data.total))
        await AsyncStorage.setItem('cartTotal', JSON.stringify(data.total));

      }

    } catch (error) {
      console.log(error, "error while fetching cart total");
    }
  }
  useEffect(() => {
    if (!cartTotal) {
      getCartTotaldata()
    }
  }, [cartTotal, customerId])


  // Function to format cartTotal for display
  const formatCartTotal = (total) => {
    const numericTotal = parseInt(total, 10); // Convert to number
    if (numericTotal >= 1000) {
      return `${Math.floor(numericTotal / 1000)}k+`;
    } else if (numericTotal >= 100) {
      return '100+';
    } else {
      return numericTotal.toString();
    }
  };

  // Calculate the width based on the formatted cartTotal
  const badgeWidth = Math.max(15, 10 + (formatCartTotal(parseInt(cartTotal)).length - 1) * 6);


  return (
    <View>
      <MaterialCommunityIcons name="cart-outline" size={25} color={color} />
      {(
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -10,
            backgroundColor: 'red',
            borderRadius: 50,
            width: badgeWidth + 5, // Set the minWidth property
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }}>{formatCartTotal(parseInt(cartTotal))}</Text>
        </View>
      )}
    </View>
  );
}

export default Carttab;
