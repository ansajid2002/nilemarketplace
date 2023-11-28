import { View, Text } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from 'react-redux';

const Carttab = ({ color, size, count }) => {

  const cartItems = useSelector((state) => state.cart.cartItems);
  return (
    <View>
      <MaterialCommunityIcons name="cart-outline" size={25} color={color} />
      {count > 0 && (
        <View
          style={{
            position: 'absolute',
            top: 0, // Adjust the vertical position as needed
            right: -6, // Adjust the horizontal position as needed
            backgroundColor: 'red',
            borderRadius: 20,
            width: 17,
            height: 17,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 12 }} className="">{cartItems.length}</Text>
        </View>
      )}
    </View>
  )
}

export default Carttab